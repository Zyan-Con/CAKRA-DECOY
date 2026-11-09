"""
decoy.py — State Manager Mirror-Twin.

Tanggung jawab:
1. Simpan state tiap sesi penyerang yang dibelokkan ke decoy (in-memory).
2. Sediakan data umpan untuk portal bayangan (logistik + panel SCADA palsu).
3. Hitung "ilusi sabotase" OT: layar penyerang lihat radar overheat 115.8C,
   padahal sistem asli tetap 34.0C.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from schemas import (
    AttackerProfile,
    HoneytokenTriggered,
    ImmunityBroadcasted,
    InterceptionAlert,
    KodamStatus,
    OTSabotageAttempt,
    RoutingMode,
    SessionState,
    TerminalCommandExecuted,
)

# Nilai telemetri sistem asli (yang dilindungi) — tetap aman apa pun yang penyerang tekan.
REAL_RADAR_TEMP_C = 34.0
REAL_COOLING_STATUS = "NOMINAL"

# Nilai ilusi yang ditampilkan ke penyerang saat dia pikir berhasil sabotase.
DECOY_OVERHEAT_TEMP_C = 115.8
DECOY_COOLING_STATUS = "CRITICAL_OVERHEAT_ILLUSION"


def _now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="milliseconds")


class SessionStore:
    """Registry sesi penyerang aktif + state telemetri lintas-refresh F5."""

    def __init__(self) -> None:
        self._sessions: dict[str, SessionState] = {}
        self._cwd_by_token: dict[str, str] = {}
        # Telemetri honeytoken terakhir per sesi (IP asli, fingerprint, geo).
        self._telemetry: dict[str, dict] = {}
        self._latest_telemetry: Optional[dict] = None
        # Riwayat terminal & event terakhir untuk sinkronisasi F5 / INITIAL_STATE_SYNC.
        self.terminal_history: list[TerminalCommandExecuted] = []
        self.kodam_status: dict[str, KodamStatus] = {}
        self.latest_alert: Optional[InterceptionAlert] = None
        self.latest_ot: Optional[OTSabotageAttempt] = None
        self.latest_honeytoken: Optional[HoneytokenTriggered] = None
        self.latest_immunity: Optional[ImmunityBroadcasted] = None

    def create(
        self,
        session_id: str,
        routing_mode: RoutingMode,
        threat_score: int,
        entry_vector: str,
        apparent_ip: Optional[str] = None,
        attacker_profile: Optional[AttackerProfile] = None,
    ) -> SessionState:
        """Daftarkan sesi baru. Kalau session_id sudah ada, kembalikan yang lama."""
        existing = self._sessions.get(session_id)
        if existing is not None:
            return existing
        session = SessionState(
            session_id=session_id,
            routing_mode=routing_mode,
            threat_score=threat_score,
            entry_vector=entry_vector,
            started_at=_now_iso(),
            apparent_ip=apparent_ip,
            attacker_profile=attacker_profile,
        )
        self._sessions[session_id] = session
        self._cwd_by_token[session_id] = session.cwd
        if routing_mode == RoutingMode.DECOY:
            # Tandai Kodam III/Siliwangi (unit portal target) sedang dalam mode umpan
            if self.kodam_status.get("KODAM-III") != KodamStatus.IMMUNE:
                self.kodam_status["KODAM-III"] = KodamStatus.UNDER_DECEPTION
        return session

    def get(self, session_id: str) -> Optional[SessionState]:
        return self._sessions.get(session_id)

    def get_or_latest(self, session_id: Optional[str]) -> Optional[SessionState]:
        if session_id and session_id in self._sessions:
            return self._sessions[session_id]
        active = self.all_active()
        return active[0] if active else None

    def all_active(self) -> list[SessionState]:
        """Kembalikan sesi aktif terbaru di urutan pertama (newest-first)."""
        return list(
            reversed([s for s in self._sessions.values() if s.status == "ACTIVE"])
        )

    def get_cwd(self, session_id: str, default: str = "/opt/satcom") -> str:
        s = self._sessions.get(session_id)
        if s is not None:
            return s.cwd
        return self._cwd_by_token.get(session_id, default)

    def update_cwd(self, session_id: str, cwd: str) -> None:
        self._cwd_by_token[session_id] = cwd
        s = self._sessions.get(session_id)
        if s is not None:
            s.cwd = cwd

    def add_terminal_entry(self, entry: TerminalCommandExecuted) -> None:
        self.terminal_history.append(entry)
        if len(self.terminal_history) > 100:
            self.terminal_history = self.terminal_history[-100:]

    def set_leaked_ip(self, session_id: str, real_ip: str) -> None:
        """Dipanggil honeytoken saat IP asli penyerang bocor."""
        s = self._sessions.get(session_id)
        if s is not None:
            s.real_leaked_ip = real_ip
        else:
            active = self.all_active()
            if active:
                active[0].real_leaked_ip = real_ip

    def set_telemetry(self, session_id: str, telemetry: dict[str, Any]) -> None:
        """Simpan telemetri honeytoken terakhir (dipakai PDF DFIR & atribusi sesi)."""
        self._telemetry[session_id] = telemetry
        self._latest_telemetry = telemetry
        leaked_ip = telemetry.get("real_leaked_ip")
        s = self._sessions.get(session_id)
        if s is not None:
            if leaked_ip:
                s.real_leaked_ip = leaked_ip
        else:
            # Jika dipicu dari luar sesi spesifik (mis. tiket debug default),
            # kaitkan juga ke sesi decoy terbaru agar atribusi di UI & PDF tetap utuh.
            active = self.all_active()
            if active:
                self._telemetry[active[0].session_id] = telemetry
                if leaked_ip:
                    active[0].real_leaked_ip = leaked_ip

    def get_telemetry(self, session_id: Optional[str]) -> Optional[dict[str, Any]]:
        if session_id and session_id in self._telemetry:
            return self._telemetry[session_id]
        return self._latest_telemetry

    def set_profile(self, session_id: str, profile: AttackerProfile) -> None:
        s = self._sessions.get(session_id)
        if s is not None:
            s.attacker_profile = profile
        else:
            active = self.all_active()
            if active:
                active[0].attacker_profile = profile

    def disconnect(self, session_id: str) -> None:
        s = self._sessions.get(session_id)
        if s is not None:
            s.status = "DISCONNECTED"


# ---------------- Data umpan portal ----------------


def decoy_portal_state() -> dict:
    """Data sintetis untuk dashboard bayangan. Semua fiktif, aman kalau dibocorkan."""
    return {
        "unit": "Gudang Logistik Amunisi (DECOY)",
        "logistics": [
            {"item": "Munisi Kaliber 5.56mm NATO", "stock": 48200, "depot": "DEPOT-SLW-01"},
            {"item": "Suku Cadang Radar Arhanud", "stock": 112, "depot": "DEPOT-SLW-02"},
            {"item": "Modul Transponder Ku-Band", "stock": 24, "depot": "DEPOT-SLW-03"},
        ],
        "scada": {
            "radar_cooling_temp_c": REAL_RADAR_TEMP_C,
            "cooling_status": REAL_COOLING_STATUS,
            "generator": "ONLINE",
        },
    }


def real_portal_state() -> dict:
    """Data untuk prajurit sah (juga simulasi demo, tapi 'sistem asli terlindungi')."""
    return {
        "unit": "Portal Logistik Satuan",
        "logistics": [
            {"item": "Ransum Tempur Lapangan T-2", "stock": 12500, "depot": "GUDANG-BEKANG-01"},
            {"item": "Unit Radio Taktis VHF/UHF", "stock": 340, "depot": "GUDANG-KOMLEK-02"},
            {"item": "Suku Cadang Rantis Komando", "stock": 85, "depot": "GUDANG-PAL-03"},
        ],
        "scada": {
            "radar_cooling_temp_c": REAL_RADAR_TEMP_C,
            "cooling_status": REAL_COOLING_STATUS,
            "generator": "ONLINE",
        },
    }


def ot_sabotage_illusion(target_system: str, action: str) -> dict:
    """
    Hitung tampilan yang dilihat penyerang vs status sistem asli saat dia sabotase.
    Sistem asli SELALU aman; yang 'overheat' cuma layar penyerang.
    """
    return {
        "target_system": target_system,
        "action": action,
        "real_radar_temp_c": REAL_RADAR_TEMP_C,
        "decoy_radar_temp_c": DECOY_OVERHEAT_TEMP_C,
        "real_cooling_status": REAL_COOLING_STATUS,
        "decoy_cooling_status": DECOY_COOLING_STATUS,
    }


# Singleton dipakai bersama oleh main.py (nulis) dan ws.py (baca snapshot).
store = SessionStore()


# ---------------- Self-check ----------------

if __name__ == "__main__":
    store = SessionStore()
    s = store.create("ses-test-1", RoutingMode.DECOY, 95, "SQLI")
    assert store.get("ses-test-1") is s
    assert store.create("ses-test-1", RoutingMode.DECOY, 10, "X") is s  # idempoten
    store.update_cwd("ses-test-1", "/opt/satcom")
    assert store.get("ses-test-1").cwd == "/opt/satcom"
    store.set_leaked_ip("ses-test-1", "103.147.12.89")
    assert store.get("ses-test-1").real_leaked_ip == "103.147.12.89"
    assert len(store.all_active()) == 1
    store.disconnect("ses-test-1")
    assert len(store.all_active()) == 0
    illu = ot_sabotage_illusion("RADAR_COOLING", "OVERRIDE_VOLTAGE")
    assert illu["real_radar_temp_c"] == 34.0 and illu["decoy_radar_temp_c"] == 115.8
    print("decoy.py self-check OK")
