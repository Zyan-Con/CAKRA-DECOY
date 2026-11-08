"""
detector.py — Threat scoring gaya WAF untuk gerbang intersepsi.

Pindai input HTTP/perintah OT, cari pola serangan umum, kembalikan skor 0-100
plus label vektor. main.py pakai hasil ini: skor >= THRESHOLD -> sesi dibelokkan
ke decoy; di bawah itu -> diteruskan ke portal asli.

Catatan jujur (untuk pitch): deteksi berbasis regex/pola GAMPANG dilewati penyerang
yang teliti (encoding, obfuscation). Ini known limitation, bukan deteksi sempurna.
Lihat to-fix.md.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass, field

# skor >= ini dianggap serangan -> belokkan ke decoy. Bisa diatur via env.
THRESHOLD = int(os.getenv("THREAT_SCORE_THRESHOLD", "70"))

# Tiap pola: (regex, bobot, label_vektor). Bobot ditumpuk; vektor dari match terberat.
_PATTERNS: list[tuple[re.Pattern[str], int, str]] = [
    # SQL injection
    (
        re.compile(
            r"('|%27)\s*(or|and)\s*('?\d+'?\s*=\s*'?\d+|'[^']*'\s*=\s*'[^']*')", re.I
        ),
        70,
        "SQL_INJECTION_AUTH_BYPASS",
    ),
    (re.compile(r"\bunion\s+select\b", re.I), 70, "SQL_INJECTION_UNION"),
    (
        re.compile(r"(;|--|#|/\*).*\b(drop|insert|update|delete)\b", re.I),
        60,
        "SQL_INJECTION",
    ),
    (re.compile(r"\bor\s+1\s*=\s*1\b", re.I), 65, "SQL_INJECTION_AUTH_BYPASS"),
    # Command / RCE injection
    (
        re.compile(r"[;&|`]\s*(cat|ls|id|whoami|wget|curl|nc|bash|sh|python)\b", re.I),
        70,
        "COMMAND_INJECTION",
    ),
    (re.compile(r"\$\(.*\)|`.*`"), 60, "COMMAND_INJECTION"),
    # Path traversal
    (re.compile(r"(\.\./|\.\.\\|%2e%2e%2f){2,}", re.I), 65, "PATH_TRAVERSAL"),
    (re.compile(r"/etc/passwd|/etc/shadow|boot\.ini", re.I), 55, "PATH_TRAVERSAL"),
    # XSS
    (re.compile(r"<script\b|onerror\s*=|javascript:", re.I), 50, "XSS"),
    # Anomali parameter SCADA/OT (nilai di luar rentang wajar)
    (
        re.compile(r"\b(voltage|temp|rpm|setpoint)\s*=\s*-?\d{4,}", re.I),
        60,
        "SCADA_PARAM_ANOMALY",
    ),
]


@dataclass
class ThreatResult:
    score: int
    entry_vector: str
    matched: list[str] = field(default_factory=list)

    @property
    def is_attack(self) -> bool:
        return self.score >= THRESHOLD


def score_payload(*parts: str) -> ThreatResult:
    """
    Skor gabungan dari satu atau beberapa potongan input (mis. username+password+body).
    Skor di-cap 100. entry_vector diambil dari pola dengan bobot tertinggi yang match.
    """
    haystack = " ".join(p for p in parts if p)
    total = 0
    matched: list[str] = []
    best_weight = 0
    best_vector = "CLEAN"
    for pattern, weight, vector in _PATTERNS:
        if pattern.search(haystack):
            total += weight
            matched.append(vector)
            if weight > best_weight:
                best_weight = weight
                best_vector = vector
    return ThreatResult(
        score=min(total, 100), entry_vector=best_vector, matched=matched
    )


# ---------------- Self-check ----------------

if __name__ == "__main__":
    # Input bersih -> prajurit asli (skor rendah, tidak dibelokkan).
    clean = score_payload("kopda_budi", "RahasiaKuat123")
    assert not clean.is_attack, clean
    assert clean.entry_vector == "CLEAN"

    # SQLi auth bypass -> serangan.
    sqli = score_payload("admin' OR '1'='1", "x")
    assert sqli.is_attack and sqli.entry_vector.startswith("SQL_INJECTION"), sqli

    # Command injection.
    rce = score_payload("; cat /etc/passwd")
    assert rce.is_attack and rce.entry_vector in (
        "COMMAND_INJECTION",
        "PATH_TRAVERSAL",
    ), rce

    # Path traversal.
    pt = score_payload("../../../../etc/passwd")
    assert pt.is_attack and pt.entry_vector == "PATH_TRAVERSAL", pt

    # Skor di-cap 100.
    combo = score_payload("admin' OR '1'='1 UNION SELECT", "; cat /etc/passwd")
    assert combo.score == 100, combo

    print("detector.py self-check OK")
