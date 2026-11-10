"""
pdf_service.py — Laporan Forensik Digital (DFIR) per sesi penyerang.

Isi disusun dengan pymupdf.Story (HTML + CSS) supaya teks panjang otomatis dibungkus dan
halaman dipecah sendiri; kop, label simulasi, dan nomor halaman ditambahkan setelahnya.

Prinsip isi:
- Hanya data sesi yang dilaporkan (ledger: genesis + blok milik sesi ini).
- Bagian yang datanya belum ada ditulis "belum ada", bukan diisi data contoh.
- Dokumen ditandai jelas sebagai SIMULASI, tanpa tanda klasifikasi atau tanda tangan fiktif.
- Semua teks berasal dari sesi (bisa berisi input penyerang), jadi wajib di-escape.
"""

from __future__ import annotations

import datetime
import html
import io
from typing import Any, Dict, Iterable, List, Optional, Sequence

import pymupdf

# Palet dokumen cetak (selaras portal instansi di frontend): biru instansi, tinta gelap, garis lembut.
BRAND = "#1D3A6B"
INK = "#1D2330"
MUTED = "#4A5363"
LINE = "#DDE2EA"
ALERT = "#C62828"
SAFE = "#1B7F4B"

# Label aktor sama dengan di Command Center (frontend MitrePanel).
ACTOR_LABEL = {
    "STATE_SPONSORED_APT": "APT disponsori negara",
    "ORGANIZED_CYBERCRIME": "Kejahatan siber terorganisir",
    "SCRIPT_KIDDIE": "Penyerang amatir",
}
SAMPLE_LEAKED_IP = "103.147.12.89"  # IP dari beacon simulasi frontend (data contoh)
PAGE = pymupdf.paper_rect("a4")
CONTENT = PAGE + (48, 66, -48, -58)  # ruang untuk kop (atas) dan nomor halaman (bawah)

CSS = f"""
body {{ font-family: sans-serif; font-size: 9.5pt; color: {INK}; line-height: 1.45; }}
h1 {{ font-size: 17pt; color: {BRAND}; margin: 0 0 4pt 0; }}
h2 {{ font-size: 11pt; color: {BRAND}; margin: 16pt 0 6pt 0; padding-bottom: 3pt;
      border-bottom: 1px solid {LINE}; }}
p {{ margin: 0 0 6pt 0; }}
.eyebrow {{ font-size: 8pt; font-weight: bold; color: {MUTED}; margin: 0 0 2pt 0; }}
.lead {{ color: {MUTED}; }}
.muted {{ color: {MUTED}; }}
.note {{ font-size: 8pt; color: {MUTED}; }}
.mono {{ font-family: monospace; font-size: 8pt; }}
.alert {{ color: {ALERT}; font-weight: bold; }}
.safe {{ color: {SAFE}; font-weight: bold; }}
.banner {{ border-left: 3px solid {SAFE}; padding: 2pt 0 2pt 8pt; margin: 8pt 0; }}
.banner-alert {{ border-left: 3px solid {ALERT}; padding: 2pt 0 2pt 8pt; margin: 8pt 0; }}
.code {{ border-left: 3px solid {LINE}; padding: 2pt 0 2pt 8pt; margin: 6pt 0; }}
.kv {{ margin: 0 0 3pt 0; }}
.k {{ color: {MUTED}; }}
table {{ width: 100%; border-collapse: collapse; margin: 2pt 0 4pt 0; }}
th {{ text-align: left; font-size: 8pt; color: {MUTED}; border-bottom: 1px solid {MUTED}; padding: 4pt 5pt; }}
td {{ vertical-align: top; border-bottom: 1px solid {LINE}; padding: 4pt 5pt; }}
tr.bad td {{ color: {ALERT}; }}
.sign td {{ border-bottom: none; padding-top: 10pt; width: 50%; }}
"""


def _e(value: Any) -> str:
    """Escape teks untuk HTML Story (input penyerang bisa berisi < > & ")."""
    return html.escape("" if value is None else str(value), quote=True)


def _enum(value: Any) -> str:
    return str(getattr(value, "value", value) or "")


def _kv_table(rows: Iterable[tuple[str, str]]) -> str:
    """Pasangan label/nilai sebagai baris biasa: MuPDF Story mengabaikan lebar kolom tabel,
    sehingga tabel dua kolom membuat label patah per kata dan menimpa nilainya."""
    return "".join(f"<p class='kv'><span class='k'>{_e(k)}:</span> {v}</p>" for k, v in rows)


def _session_blocks(
    blocks: Sequence[Dict[str, Any]], session_id: Optional[str]
) -> List[Dict[str, Any]]:
    """Genesis + blok milik sesi ini saja: laporan satu sesi tidak memuat aksi sesi lain."""
    return [
        b
        for b in blocks
        if b.get("block_index") == 0
        or (session_id and b.get("session_id") == session_id)
    ]


def _has(blocks: Sequence[Dict[str, Any]], prefix: str) -> bool:
    return any(str(b.get("action_summary", "")).startswith(prefix) for b in blocks)


def _section_summary(
    sid: str,
    session: Dict[str, Any],
    blocks: List[Dict[str, Any]],
    telemetry: Optional[Dict[str, Any]],
) -> str:
    vector = _e(session.get("entry_vector") or "pola serangan")
    score = session.get("threat_score")
    score_txt = (
        f" dengan skor ancaman <b>{_e(score)}/100</b>" if score is not None else ""
    )
    commands = sum(
        1
        for b in blocks
        if str(b.get("action_summary", "")).startswith("TERMINAL_COMMAND")
    )
    facts = [
        "Penyerang dibelokkan ke portal jebakan (Mirror-Twin); sistem asli tidak tersentuh.",
        f"{commands} perintah terminal penyerang tersadap."
        if commands
        else "Belum ada perintah terminal yang tercatat.",
        "Percobaan sabotase radar dijawab dengan ilusi; radar asli tetap normal."
        if _has(blocks, "OT_SCADA_SABOTAGE")
        else "Tidak ada percobaan sabotase OT pada sesi ini.",
        "File umpan terbuka dan mengirim balik identitas penyerang."
        if telemetry
        else "Belum ada file umpan yang dibuka pada sesi ini.",
        "Vaksin (rule blokir) disebarkan ke 15 Kodam."
        if _has(blocks, "HERD_IMMUNITY_BROADCAST")
        else "Vaksin belum disebarkan.",
    ]
    items = "".join(f"<li>{f}</li>" for f in facts)
    return (
        "<h2>1. Ringkasan</h2>"
        f"<p>Sesi <span class='mono'>{_e(sid)}</span> terdeteksi sebagai {vector}{score_txt}.</p>"
        f"<ul>{items}</ul>"
    )


def _section_attacker(
    session: Dict[str, Any], telemetry: Optional[Dict[str, Any]]
) -> str:
    out = "<h2>2. Identitas penyerang</h2>"
    profile = session.get("attacker_profile") or {}
    if profile:
        out += _kv_table(
            [
                (
                    "Klasifikasi aktor (rule statis)",
                    f"{_e(ACTOR_LABEL.get(_enum(profile.get('actor_classification')), _enum(profile.get('actor_classification'))))} "
                    f"<span class='muted'>({_e(profile.get('confidence_pct'))}% keyakinan)</span>",
                ),
            ]
        )
    if not telemetry:
        return (
            out
            + "<p class='muted'>Belum ada file umpan yang dibuka, jadi identitas asli penyerang belum terbongkar.</p>"
        )
    geo = telemetry.get("geo_location") or {}
    fp = telemetry.get("device_fingerprint") or {}
    rows = [
        (
            "IP yang terlihat (proxy)",
            f"<span class='mono'>{_e(telemetry.get('apparent_proxy_ip', '-'))}</span>",
        ),
        (
            "IP asli",
            f"<span class='mono alert'>{_e(telemetry.get('real_leaked_ip', '-'))}</span>",
        ),
        ("Lokasi (tingkat kota, dari IP)", _e(geo.get("city", "-"))),
        ("Perangkat (GPU)", _e(fp.get("gpu_renderer", "-"))),
        ("Sistem operasi / browser", _e(fp.get("os", "-"))),
        ("Sidik canvas", f"<span class='mono'>{_e(fp.get('canvas_hash', '-'))}</span>"),
        (
            "Berkas umpan",
            f"<span class='mono'>{_e(telemetry.get('token_filename', '-'))}</span>",
        ),
    ]
    out += _kv_table(rows)
    if telemetry.get("real_leaked_ip") == SAMPLE_LEAKED_IP:
        out += "<p class='note'>Data di atas berasal dari beacon simulasi (data contoh), bukan perangkat sungguhan.</p>"
    return out


def _section_ot(blocks: List[Dict[str, Any]]) -> str:
    out = "<h2>3. Sabotase OT/SCADA</h2>"
    if not _has(blocks, "OT_SCADA_SABOTAGE"):
        return (
            out + "<p class='muted'>Tidak ada percobaan sabotase OT pada sesi ini.</p>"
        )
    return out + (
        "<table><tr><th>Yang dilihat penyerang</th><th>Kondisi asli</th></tr>"
        "<tr><td><span class='alert'>115.8°C · overheat kritis</span><br/>Pendingin tampak dimatikan.</td>"
        "<td><span class='safe'>34.0°C · normal</span><br/>Perintah tidak pernah sampai ke radar.</td></tr></table>"
    )


def _section_mitre(rows: Optional[Sequence[Sequence[str]]]) -> str:
    out = "<h2>4. Pemetaan MITRE ATT&amp;CK</h2>"
    if not rows:
        return (
            out
            + "<p class='muted'>Belum ada teknik yang terpetakan untuk sesi ini.</p>"
        )
    body = "".join(
        f"<tr><td class='mono'>{_e(r[0])}</td><td>{_e(r[1])}</td><td>{_e(r[2])}</td></tr>"
        for r in rows
    )
    return (
        out + f"<table><tr><th>ID</th><th>Teknik</th><th>Taktik</th></tr>{body}</table>"
    )


def _section_ledger(
    blocks: List[Dict[str, Any]], chain_status: str, tampered: Optional[int]
) -> str:
    valid = chain_status == "VALID_IMMUTABLE"
    banner = (
        "<div class='banner'><span class='safe'>Rantai bukti utuh.</span> "
        "Setiap blok terkunci hash SHA-256 dan menunjuk hash blok sebelumnya.</div>"
        if valid
        else f"<div class='banner-alert'><span class='alert'>Rantai bukti rusak: Blok #{_e(tampered)} dimanipulasi.</span> "
        "Hash blok itu tidak cocok lagi dengan isinya.</div>"
    )
    rows = []
    for b in blocks:
        idx = b.get("block_index", 0)
        bad = tampered is not None and idx == tampered
        ts = _e(str(b.get("timestamp", ""))[:19].replace("T", " "))
        rows.append(
            f"<tr class='{'bad' if bad else ''}'><td class='mono'>#{_e(idx)}</td><td class='mono'>{ts}</td>"
            f"<td>{_e(b.get('action_summary', ''))}<br/><span class='mono muted'>{_e(b.get('current_hash', ''))}</span></td></tr>"
        )
    return (
        "<h2>5. Ledger bukti forensik (SHA-256)</h2>"
        f"{banner}"
        f"<table><tr><th>Blok</th><th>Waktu (UTC)</th><th>Aksi dan hash</th></tr>{''.join(rows)}</table>"
        "<p class='note'>Rumus segel: SHA256(index | waktu | sesi | aksi | hash sebelumnya). "
        "Ditampilkan: blok genesis dan blok milik sesi ini.</p>"
    )


def _section_vaccine(
    blocks: List[Dict[str, Any]], telemetry: Optional[Dict[str, Any]]
) -> str:
    out = "<h2>6. Vaksin ke Kodam</h2>"
    if not _has(blocks, "HERD_IMMUNITY_BROADCAST"):
        return out + "<p class='muted'>Vaksin belum disebarkan pada sesi ini.</p>"
    ip = (telemetry or {}).get("real_leaked_ip") or SAMPLE_LEAKED_IP
    return out + (
        "<p>Rule blokir dibuat otomatis dari pola serangan dan IP asli penyerang, lalu disebarkan ke 15 Kodam (simulasi).</p>"
        f"<div class='code'><span class='mono'>iptables -A INPUT -s {_e(ip)}/32 -m string --algo bm "
        f"--string \"OR '1'='1\" -j DROP</span><br/>"
        '<span class=\'mono\'>SecRule ARGS "@detectSQLi" "id:990014,phase:2,deny,status:403"</span></div>'
    )


def _section_sign() -> str:
    return (
        "<h2>7. Pengesahan</h2>"
        "<table class='sign'><tr>"
        "<td>Disusun oleh<br/><br/><br/>______________________<br/><span class='muted'>Nama / NRP</span></td>"
        "<td>Mengetahui<br/><br/><br/>______________________<br/><span class='muted'>Nama / Jabatan</span></td>"
        "</tr></table>"
    )


def _decorate(pdf: bytes, doc_number: str) -> bytes:
    """Kop dan nomor halaman di setiap halaman (Story tidak punya header/footer berulang)."""
    with pymupdf.open("pdf", pdf) as doc:
        total = doc.page_count
        for page in doc:
            w = page.rect.width
            page.insert_text(
                (48, 34),
                "CAKRA-DECOY 2.0 · Laporan Forensik Digital (DFIR)",
                fontsize=8,
                fontname="hebo",
                color=pymupdf.pdfcolor["black"],
            )
            label = "DOKUMEN SIMULASI · Kartika Cyber Hackathon 2026"
            page.insert_text(
                (w - 48 - pymupdf.get_text_length(label, "helv", 8), 34),
                label,
                fontsize=8,
                fontname="helv",
                color=(0.78, 0.16, 0.16),
            )
            page.draw_line((48, 42), (w - 48, 42), color=(0.87, 0.89, 0.92), width=0.6)
            y = page.rect.height - 32
            page.draw_line(
                (48, y - 10), (w - 48, y - 10), color=(0.87, 0.89, 0.92), width=0.6
            )
            page.insert_text(
                (48, y),
                doc_number,
                fontsize=7.5,
                fontname="helv",
                color=(0.29, 0.33, 0.39),
            )
            num = f"Halaman {page.number + 1} dari {total}"
            page.insert_text(
                (w - 48 - pymupdf.get_text_length(num, "helv", 7.5), y),
                num,
                fontsize=7.5,
                fontname="helv",
                color=(0.29, 0.33, 0.39),
            )
        doc.subset_fonts()
        return doc.tobytes(deflate=True, garbage=3)


def generate_military_dfir_pdf(
    session_data: Optional[Dict[str, Any]] = None,
    telemetry_data: Optional[Dict[str, Any]] = None,
    ledger_blocks: Optional[List[Dict[str, Any]]] = None,
    chain_status: str = "VALID_IMMUTABLE",
    tampered_block_index: Optional[int] = None,
    custom_mitre_rows: Optional[List[Any]] = None,
) -> bytes:
    """Bangun laporan DFIR (PDF, A4) untuk satu sesi. Mengembalikan bytes PDF."""
    now = datetime.datetime.now()
    doc_number = f"DFIR/CAKRA-{now:%Y}/{now:%m%d-%H%M}"
    session = session_data or {}
    sid = str(session.get("session_id") or "-")
    blocks = _session_blocks(ledger_blocks or [], session.get("session_id"))

    body = (
        "<p class='eyebrow'>LAPORAN FORENSIK DIGITAL · DOKUMEN SIMULASI</p>"
        "<h1>Laporan insiden: penyerang dibelokkan dan dibongkar</h1>"
        "<p class='lead'>Disusun otomatis oleh CAKRA-DECOY 2.0 dari rekaman satu sesi penyerang. "
        "Dokumen simulasi untuk demonstrasi Kartika Cyber Hackathon 2026, bukan dokumen resmi.</p>"
        + _kv_table(
            [
                ("Nomor laporan", f"<span class='mono'>{_e(doc_number)}</span>"),
                ("Dibuat", _e(f"{now:%d-%m-%Y %H:%M} WIB")),
                ("ID sesi", f"<span class='mono'>{_e(sid)}</span>"),
                (
                    "Status rantai bukti",
                    "<span class='safe'>Utuh</span>"
                    if chain_status == "VALID_IMMUTABLE"
                    else f"<span class='alert'>Rusak (Blok #{_e(tampered_block_index)})</span>",
                ),
            ]
        )
        + _section_summary(sid, session, blocks, telemetry_data)
        + _section_attacker(session, telemetry_data)
        + _section_ot(blocks)
        + _section_mitre(custom_mitre_rows)
        + _section_ledger(blocks, chain_status, tampered_block_index)
        + _section_vaccine(blocks, telemetry_data)
        + _section_sign()
    )

    story = pymupdf.Story(html=f"<body>{body}</body>", user_css=CSS)
    buffer = io.BytesIO()
    writer = pymupdf.DocumentWriter(buffer)
    more = True
    while more:
        device = writer.begin_page(PAGE)
        more, _ = story.place(CONTENT)
        story.draw(device)
        writer.end_page()
    writer.close()
    return _decorate(buffer.getvalue(), doc_number)
