"""
mitre_service.py — Pemetaan aktivitas penyerang ke MITRE ATT&CK (Enterprise & ICS).

Pure engine (tanpa impor FastAPI/WS). Dikasih sinyal (vektor masuk, perintah terminal,
atau aksi OT), kembalikan MitreEnrichment: teknik tunggal + akumulasi teknik per sesi +
klasifikasi aktor.

shortcut: klasifikasi aktor & teknik pakai lookup rule statis, bukan LLM.
Cukup untuk demo (lihat to-fix.md P1); upgrade ke AI klasifikasi kalau waktu sisa.

Caller (main.py) menjalankan ini via asyncio.create_task supaya non-blocking:
terminal penyerang tidak pernah menunggu analisis intelijen.
"""

from __future__ import annotations

from schemas import ActorClass, AttackerProfile, MitreEnrichment, Severity

# technique_id -> (tactic_id, tactic_name, technique_name, severity)
_TECHNIQUES: dict[str, tuple[str, str, str, Severity]] = {
    "T1190": (
        "TA0001",
        "Initial Access",
        "Exploit Public-Facing Application",
        Severity.HIGH,
    ),
    "T1059.004": (
        "TA0002",
        "Execution",
        "Command and Scripting Interpreter: Unix Shell",
        Severity.HIGH,
    ),
    "T1059.007": (
        "TA0002",
        "Execution",
        "Command and Scripting Interpreter: JavaScript",
        Severity.MEDIUM,
    ),
    "T1552.001": (
        "TA0006",
        "Credential Access",
        "Unsecured Credentials: Credentials In Files",
        Severity.CRITICAL,
    ),
    "T1083": ("TA0007", "Discovery", "File and Directory Discovery", Severity.MEDIUM),
    "T1082": ("TA0007", "Discovery", "System Information Discovery", Severity.LOW),
    "T1033": ("TA0007", "Discovery", "System Owner/User Discovery", Severity.LOW),
    "T1057": ("TA0007", "Discovery", "Process Discovery", Severity.LOW),
    "T1049": (
        "TA0007",
        "Discovery",
        "System Network Connections Discovery",
        Severity.MEDIUM,
    ),
    # ICS/OT
    "T0855": (
        "TA0106",
        "Impair Process Control",
        "Unauthorized Command Message",
        Severity.CRITICAL,
    ),
    "T0836": ("TA0106", "Impair Process Control", "Modify Parameter", Severity.HIGH),
}

# Vektor masuk (dari detector) -> technique_id
_VECTOR_MAP: dict[str, str] = {
    "SQL_INJECTION_AUTH_BYPASS": "T1190",
    "SQL_INJECTION_UNION": "T1190",
    "SQL_INJECTION": "T1190",
    "COMMAND_INJECTION": "T1059.004",
    "PATH_TRAVERSAL": "T1083",
    "XSS": "T1059.007",
    "SCADA_PARAM_ANOMALY": "T0836",
}

# Aksi OT -> technique_id
_OT_MAP: dict[str, str] = {
    "OVERRIDE_VOLTAGE": "T0855",
    "SHUTDOWN_COOLING": "T0855",
}

_CRED_FILES = ("kredensial_komando.env", "/etc/passwd", "/etc/shadow", ".env")


def _command_technique(command: str) -> str:
    """Petakan satu baris perintah terminal ke technique_id paling relevan."""
    line = command.strip()
    cmd = line.split()[0] if line else ""
    if cmd == "cat" and any(f in line for f in _CRED_FILES):
        return "T1552.001"
    if cmd in ("whoami", "id"):
        return "T1033"
    if cmd in ("uname", "hostname", "env"):
        return "T1082"
    if cmd in ("ls", "cd", "cat", "find"):
        return "T1083"
    if cmd in ("ps", "top"):
        return "T1057"
    if cmd in ("netstat", "ss"):
        return "T1049"
    # perintah lain dianggap eksekusi shell umum
    return "T1059.004"


class MitreProfiler:
    """Akumulasi teknik per sesi + klasifikasi aktor."""

    def __init__(self) -> None:
        self._by_session: dict[str, list[str]] = {}
        self._enrichments: list[MitreEnrichment] = []

    def clear(self) -> None:
        """Lupakan semua teknik yang terpetakan (bersama decoy.store.clear)."""
        self.__init__()

    def recent_enrichments(self) -> list[MitreEnrichment]:
        """Daftar enrichment terbaru (unik per technique_id, terbaru di depan)."""
        return list(self._enrichments)

    def session_technique_rows(self, session_id: str | None = None) -> list[tuple[str, str, str, str]]:
        """Kembalikan baris (tid, name, tactic, status) untuk laporan DFIR PDF."""
        tids: list[str] = []
        if session_id and session_id in self._by_session:
            tids = list(self._by_session[session_id])
        elif self._by_session:
            # Ambil dari sesi terakhir jika session_id spesifik belum terisi
            last_sid = next(reversed(self._by_session))
            tids = list(self._by_session[last_sid])
        rows: list[tuple[str, str, str, str]] = []
        for tid in tids:
            if tid in _TECHNIQUES:
                tactic_id, tactic_name, tech_name, _ = _TECHNIQUES[tid]
                rows.append((tid, tech_name, f"{tactic_id} ({tactic_name})", "DICEGAT & DIANALISIS"))
        return rows

    def _classify(self, techniques: list[str]) -> AttackerProfile:
        has_ics = any(t.startswith("T0") for t in techniques)
        has_cred = "T1552.001" in techniques
        n = len(techniques)
        if has_ics or n >= 4:
            actor, conf = ActorClass.APT, min(70 + n * 5, 98)
        elif n >= 2:
            actor, conf = ActorClass.ORGANIZED, 55 + n * 5
        else:
            actor, conf = ActorClass.SCRIPT_KIDDIE, 40
        intent = (
            "OT_RADAR_SABOTAGE"
            if has_ics
            else ("CREDENTIAL_EXFILTRATION" if has_cred else "RECON")
        )
        summary = (
            f"{n} teknik terpetakan. "
            + ("Menyentuh kendali OT/ICS. " if has_ics else "")
            + ("Mengincar kredensial tersimpan. " if has_cred else "")
            + "Klasifikasi berbasis rule statis (demo)."
        )
        return AttackerProfile(
            actor_classification=actor,
            confidence_pct=conf,
            primary_intent=intent,
            psychological_summary=summary,
        )

    def analyze(
        self,
        session_id: str,
        *,
        vector: str | None = None,
        command: str | None = None,
        ot_action: str | None = None,
    ) -> MitreEnrichment:
        """Petakan satu sinyal. Tepat satu dari vector/command/ot_action harus diisi."""
        if vector is not None:
            tid = _VECTOR_MAP.get(vector, "T1190")
        elif command is not None:
            tid = _command_technique(command)
        elif ot_action is not None:
            tid = _OT_MAP.get(ot_action, "T0855")
        else:
            raise ValueError(
                "analyze butuh salah satu: vector, command, atau ot_action"
            )

        tactic_id, tactic_name, technique_name, severity = _TECHNIQUES[tid]
        cumulative = self._by_session.setdefault(session_id, [])
        if tid not in cumulative:
            cumulative.append(tid)

        enrichment = MitreEnrichment(
            tactic_id=tactic_id,
            tactic_name=tactic_name,
            technique_id=tid,
            technique_name=technique_name,
            severity=severity,
            cumulative_techniques=list(cumulative),
            attacker_profile=self._classify(cumulative),
        )
        self._enrichments = [
            enrichment,
            *[x for x in self._enrichments if x.technique_id != tid],
        ]
        return enrichment


# Singleton dipakai main.py.
profiler = MitreProfiler()


# ---------------- Self-check ----------------

if __name__ == "__main__":
    p = MitreProfiler()

    e1 = p.analyze("s1", vector="SQL_INJECTION_AUTH_BYPASS")
    assert e1.technique_id == "T1190" and e1.tactic_name == "Initial Access"
    assert e1.attacker_profile.actor_classification == ActorClass.SCRIPT_KIDDIE

    e2 = p.analyze("s1", command="cat /opt/satcom/kredensial_komando.env")
    assert e2.technique_id == "T1552.001" and e2.severity == Severity.CRITICAL
    assert e2.attacker_profile.actor_classification == ActorClass.ORGANIZED

    e3 = p.analyze("s1", ot_action="OVERRIDE_VOLTAGE")
    assert e3.technique_id == "T0855"
    # kena ICS -> naik ke APT
    assert e3.attacker_profile.actor_classification == ActorClass.APT, (
        e3.attacker_profile
    )
    assert e3.cumulative_techniques == ["T1190", "T1552.001", "T0855"]

    # idempoten: teknik sama tidak dobel
    e4 = p.analyze("s1", command="whoami")
    e5 = p.analyze("s1", command="whoami")
    assert e5.cumulative_techniques.count("T1033") == 1

    print("mitre_service.py self-check OK")
