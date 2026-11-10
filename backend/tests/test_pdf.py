"""
Test laporan DFIR PDF: isi harus utuh (tidak terpotong), jujur (tanpa data palsu bila data belum ada),
dan rapi (tanpa glyph pengganti, setiap halaman bernomor).
"""

import re

import pymupdf

import pdf_service

LONG_SUMMARY = (
    "TERMINAL_COMMAND: 'cat /opt/satcom/kredensial_komando.env' executed in /opt/satcom "
    "(VFS_DETERMINISTIC_ENGINE) dengan keluaran panjang yang wajib dibungkus ke baris berikutnya"
)


def _blocks(extra_summary: str = LONG_SUMMARY):
    return [
        {
            "block_index": 0,
            "timestamp": "2026-11-10T14:53:46Z",
            "action_summary": "GENESIS_BLOCK",
            "current_hash": "a" * 64,
            "session_id": "SYSTEM_CORE",
        },
        {
            "block_index": 1,
            "timestamp": "2026-11-10T14:54:58Z",
            "action_summary": "INITIAL_INFILTRATION: Threat Score 70 via SQL_INJECTION_AUTH_BYPASS",
            "current_hash": "b" * 64,
            "session_id": "ses-a",
        },
        {
            "block_index": 2,
            "timestamp": "2026-11-10T14:55:01Z",
            "action_summary": extra_summary,
            "current_hash": "c" * 64,
            "session_id": "ses-a",
        },
    ]


def _text(pdf: bytes) -> list[str]:
    with pymupdf.open("pdf", pdf) as doc:
        return [page.get_text() for page in doc]


def _flat(pages: list[str]) -> str:
    return re.sub(r"\s+", " ", " ".join(pages))


def _render(**kw) -> list[str]:
    args = {
        "session_data": {"session_id": "ses-a", "threat_score": 70},
        "ledger_blocks": _blocks(),
    }
    args.update(kw)
    return _text(pdf_service.generate_military_dfir_pdf(**args))


def test_long_ledger_summary_is_not_clipped():
    # Bandingkan tanpa whitespace: pembungkusan baris boleh menyisipkan spasi, tapi tidak boleh ada yang hilang.
    squash = lambda t: re.sub(r"\s+", "", t)  # noqa: E731
    assert squash(LONG_SUMMARY) in squash(_flat(_render()))


def test_no_replacement_glyphs():
    flat = _flat(
        _render(
            telemetry_data={
                "real_leaked_ip": "203.0.113.7",
                "apparent_proxy_ip": "198.51.100.2",
            }
        )
    )
    assert "�" not in flat
    assert " ? " not in flat


def test_every_page_is_numbered():
    pages = _render(
        ledger_blocks=_blocks()
        + [
            {
                "block_index": i,
                "timestamp": "2026-11-10T15:00:00Z",
                "action_summary": f"TERMINAL_COMMAND: ls {i}",
                "current_hash": f"{i:064d}",
                "session_id": "ses-a",
            }
            for i in range(3, 40)
        ]
    )
    assert len(pages) >= 2
    for n, text in enumerate(pages, start=1):
        assert f"Halaman {n} dari {len(pages)}" in re.sub(r"\s+", " ", text)


def test_report_is_marked_as_simulation():
    assert "SIMULASI" in _flat(_render()).upper()


def test_missing_telemetry_does_not_invent_attacker_ip():
    flat = _flat(_render(telemetry_data=None))
    assert "103.147.12.89" not in flat
    assert "185.220.101.44" not in flat


def test_tampered_block_is_reported():
    flat = _flat(_render(chain_status="TAMPERED_CRITICAL", tampered_block_index=2))
    assert "Blok #2" in flat


def test_ledger_shows_only_genesis_and_reported_session():
    blocks = _blocks() + [
        {
            "block_index": 3,
            "timestamp": "2026-11-10T15:00:00Z",
            "action_summary": "TERMINAL_COMMAND: milik-sesi-lain",
            "current_hash": "d" * 64,
            "session_id": "ses-b",
        },
    ]
    flat = _flat(_render(ledger_blocks=blocks))
    assert "milik-sesi-lain" not in flat
    assert "GENESIS_BLOCK" in flat


def test_actor_class_is_human_readable():
    flat = _flat(
        _render(
            session_data={
                "session_id": "ses-a",
                "attacker_profile": {"actor_classification": "STATE_SPONSORED_APT", "confidence_pct": 90},
            }
        )
    )
    assert "APT disponsori negara" in flat
    assert "STATE_SPONSORED_APT" not in flat
