
import datetime
from typing import Any, Dict, List, Optional
import pymupdf


def generate_military_dfir_pdf(
    session_data: Optional[Dict[str, Any]] = None,
    telemetry_data: Optional[Dict[str, Any]] = None,
    ledger_blocks: Optional[List[Dict[str, Any]]] = None,
    chain_status: str = "VALID_IMMUTABLE",
    tampered_block_index: Optional[int] = None,
) -> bytes:
    """
    Generates an authentic, high-impact tactical Military Incident Report in PDF format.
    Returns the binary PDF content (bytes).
    """
    # 1. Fallback / Default Data Setup for demo resilience
    now = datetime.datetime.now()
    doc_date = now.strftime("%d %B %Y").upper()
    doc_time = now.strftime("%H:%M:%S WIB")
    doc_number = f"DFIR-PUSSIBERAD/CAKRA-{now.year}/{now.strftime('%m%d-%H%M')}"

    session = session_data or {}
    session_id = session.get("session_id", "SES-KDM03-9941A")
    threat_score = session.get("threat_score", 96)
    routing_mode = session.get("routing_mode", "DECOY_MIRROR_TWIN")
    attacker_prof = session.get("attacker_profile") or {}
    actor_class = attacker_prof.get("actor_classification", "STATE-SPONSORED APT")
    if hasattr(actor_class, "value"):
        actor_class = actor_class.value
    primary_intent = attacker_prof.get("primary_intent", "OT_RADAR_SABOTAGE_AND_SATCOM_EXFILTRATION")
    confidence_pct = attacker_prof.get("confidence_pct", 92)
    chain_is_valid = chain_status == "VALID_IMMUTABLE"

    telemetry = telemetry_data or {}
    apparent_ip = telemetry.get("apparent_proxy_ip", "185.220.101.44 (Tor/Relay Proxy)")
    real_ip = telemetry.get("real_leaked_ip", "103.147.12.89 (Indonesian ISP / Leaked)")
    geo = telemetry.get("geo_location", {})
    geo_str = f"{geo.get('city', 'Jakarta Selatan')}, {geo.get('country', 'ID')} (Lat: {geo.get('lat', -6.2146)}, Lng: {geo.get('lng', 106.8451)})"
    fingerprint = telemetry.get("device_fingerprint", {})
    gpu_str = fingerprint.get("gpu_renderer", "ANGLE (NVIDIA GeForce RTX 4070 Laptop GPU, OpenGL 4.5)")
    os_str = fingerprint.get("os", "Linux x86_64 (Kali GNU/Linux Rolling 2026)")
    canvas_hash = fingerprint.get("canvas_hash", "e4b89100a2c7f91d")

    blocks = ledger_blocks or [
        {
            "block_index": 0,
            "timestamp": "2026-10-27T14:48:00Z",
            "action_summary": "GENESIS: CAKRA-DECOY 2.0 FORENSIC CHAIN INITIALIZED",
            "current_hash": "0000a9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f",
        },
        {
            "block_index": 1,
            "timestamp": "2026-10-27T14:50:12Z",
            "action_summary": "INITIAL_INFILTRATION: SQLi Auth Bypass on Logistics Portal",
            "current_hash": "1a7c3b9f11a42e8871c0091e234b65d902a117c89b3214f665a098bc12345678",
        },
        {
            "block_index": 2,
            "timestamp": "2026-10-27T14:51:30Z",
            "action_summary": "OT_SCADA_SABOTAGE: Radar Cooling Overridden to 115.8°C",
            "current_hash": "2f8b09187a4c7e659b2feaa1c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        },
        {
            "block_index": 3,
            "timestamp": "2026-10-27T14:53:05Z",
            "action_summary": "HONEYTOKEN_TRIGGER: WebRTC Leak from Akses_Darurat_Satelit_TNI.html",
            "current_hash": "3c7b9f11a42e8871c0091e234b65d902a117c89b3214f665a098bc1234567890",
        },
    ]

    # 2. Document Creation (A4: 595 x 842 points)
    doc = pymupdf.open()

    # Color Palette: Military C4ISR Theme
    c_dark_navy = (0.05, 0.08, 0.15)
    c_gold = (0.75, 0.60, 0.20)
    c_red = (0.80, 0.15, 0.15)
    c_green = (0.05, 0.65, 0.35)
    c_gray = (0.35, 0.40, 0.45)
    c_light_bg = (0.95, 0.96, 0.98)
    c_white = (1.0, 1.0, 1.0)
    c_black = (0.05, 0.05, 0.05)

    # PAGE 1: Executive Summary, Attribution & OT Sabotage Telemetry
    page1 = doc.new_page(width=595, height=842)

    # Double Border (Outer & Inner)
    page1.draw_rect(pymupdf.Rect(20, 20, 575, 822), color=c_dark_navy, width=1.5)
    page1.draw_rect(pymupdf.Rect(24, 24, 571, 818), color=c_gold, width=0.75)

    # Top Secret Stamp / Header
    page1.draw_rect(pymupdf.Rect(25, 25, 570, 48), color=c_red, fill=c_red)
    page1.insert_text(
        pymupdf.Point(145, 42),
        "KLASIFIKASI: SANGAT RAHASIA // TOP SECRET // KARTIKA CYBER SHIELD",
        fontsize=10,
        color=c_white,
        fontname="helv",
    )
    page1.insert_text(
        pymupdf.Point(185, 56),
        "HANYA UNTUK KEPENTINGAN OPERASI PUSSIBERAD TNI AD",
        fontsize=8,
        color=c_white,
        fontname="helv",
    )

    # Official Kop Surat
    page1.insert_text(
        pymupdf.Point(155, 90),
        "TENTARA NASIONAL INDONESIA ANGKATAN DARAT",
        fontsize=13,
        color=c_dark_navy,
        fontname="helv",
    )
    page1.insert_text(
        pymupdf.Point(215, 105),
        "PUSAT SIBER TNI AD (PUSSIBERAD)",
        fontsize=12,
        color=c_dark_navy,
        fontname="helv",
    )
    page1.insert_text(
        pymupdf.Point(135, 120),
        "DETASEMEN TANGGAP INSIDEN SIBER & FORENSIK DIGITAL (CSIRT MILITER)",
        fontsize=9,
        color=c_gray,
        fontname="helv",
    )
    page1.draw_line(pymupdf.Point(40, 128), pymupdf.Point(555, 128), color=c_dark_navy, width=1.5)
    page1.draw_line(pymupdf.Point(40, 131), pymupdf.Point(555, 131), color=c_gold, width=0.75)

    # Document Metadata Box
    page1.draw_rect(pymupdf.Rect(40, 140, 555, 185), color=c_gray, fill=c_light_bg, width=0.5)
    page1.insert_text(pymupdf.Point(50, 156), f"NOMOR BERKAS  : {doc_number}", fontsize=8.5, color=c_black, fontname="courier")
    page1.insert_text(pymupdf.Point(50, 170), f"TANGGAL CETAK : {doc_date} — {doc_time}", fontsize=8.5, color=c_black, fontname="courier")
    page1.insert_text(pymupdf.Point(340, 156), f"ID SESI ANCAMAN : {session_id}", fontsize=8.5, color=c_black, fontname="courier")
    page1.insert_text(pymupdf.Point(340, 170), f"STATUS SISTEM   : DECOY ACTIVE (100% AMAN)", fontsize=8.5, color=c_green, fontname="courier")

    # Section 1: Ringkasan Eksekutif
    page1.draw_rect(pymupdf.Rect(40, 195, 555, 215), color=c_dark_navy, fill=c_dark_navy)
    page1.insert_text(pymupdf.Point(50, 209), "1. RINGKASAN EKSEKUTIF INSIDEN PERTAHANAN AKTIF", fontsize=10, color=c_white, fontname="helv")

    exec_summary_text = (
        f"Pada {doc_date}, sistem pertahanan otonom CAKRA-DECOY 2.0 mendeteksi dan mencegat upaya peretasan "
        f"kritis terhadap infrastruktur konvergensi IT/OT Komando Daerah Militer (Kodam). Vektor serangan berupa "
        f"SQL Injection pada Portal Logistik berhasil dibelokkan secara senyap (< 5ms) ke dalam lingkungan Chameleon "
        f"AI Mirror-Twin. Sistem asli TNI AD beroperasi secara nominal tanpa gangguan, sementara seluruh aktivitas penyerang "
        f"berhasil disadap, direkam secara kriptografis, dan dilacak balik ke perangkat fisik lawan."
    )
    page1.insert_textbox(pymupdf.Rect(45, 222, 550, 275), exec_summary_text, fontsize=8.5, color=c_black, fontname="helv")

    # Section 2: Profil & Pelacakan Balik Penyerang (Counter-Intel)
    page1.draw_rect(pymupdf.Rect(40, 280, 555, 300), color=c_dark_navy, fill=c_dark_navy)
    page1.insert_text(pymupdf.Point(50, 294), "2. ATRIBUSI & DATA PELACAKAN BALIK PENYERANG (HONEYTOKEN BOOMERANG)", fontsize=10, color=c_white, fontname="helv")

    # Table for Attacker Info
    y_start = 308
    intel_rows = [
        ("Klasifikasi Ancaman", f"{actor_class} (Tingkat Keyakinan: {confidence_pct}%)", c_red),
        ("Skor Ancaman / Severity", f"{threat_score} / 100 — CRITICAL LEVEL 4 RESTRICTED", c_red),
        ("IP Samaran (Proxy/Tor)", apparent_ip, c_black),
        ("IP Fisik Asli (Leaked)", f"{real_ip} (TEREKSTRAK VIA WEBRTC STUN)", c_red),
        ("Koordinat & Lokasi GPS", geo_str, c_black),
        ("Hardware / GPU Renderer", gpu_str[:58], c_black),
        ("Sistem Operasi / Target", os_str[:58], c_black),
        ("Canvas Hardware Hash", canvas_hash, c_black),
    ]

    for label, val, val_color in intel_rows:
        page1.draw_rect(pymupdf.Rect(40, y_start, 200, y_start + 18), color=c_gray, fill=c_light_bg, width=0.5)
        page1.draw_rect(pymupdf.Rect(200, y_start, 555, y_start + 18), color=c_gray, fill=c_white, width=0.5)
        page1.insert_text(pymupdf.Point(46, y_start + 12), label, fontsize=8, color=c_dark_navy, fontname="helv")
        page1.insert_text(pymupdf.Point(206, y_start + 12), val, fontsize=8, color=val_color, fontname="courier")
        y_start += 18

    # Section 3: Telemetri Deception SCADA / OT
    y_start += 10
    page1.draw_rect(pymupdf.Rect(40, y_start, 555, y_start + 20), color=c_dark_navy, fill=c_dark_navy)
    page1.insert_text(pymupdf.Point(50, y_start + 14), "3. ANALISIS SABOTASE IT/OT (PERBANDINGAN SISTEM ASLI VS ILUSI DECOY)", fontsize=10, color=c_white, fontname="helv")
    y_start += 25

    # Left Box: Decoy Illusion
    page1.draw_rect(pymupdf.Rect(40, y_start, 290, y_start + 70), color=c_red, fill=(0.99, 0.92, 0.92), width=1)
    page1.insert_text(pymupdf.Point(50, y_start + 16), "PADA MONITOR PENYERANG (RUANG ILUSI):", fontsize=8.5, color=c_red, fontname="helv")
    page1.insert_text(pymupdf.Point(50, y_start + 32), "• Status Radar   : OVERHEAT CRITICAL (115.8°C)", fontsize=8, color=c_black, fontname="courier")
    page1.insert_text(pymupdf.Point(50, y_start + 46), "• Pendingin      : OVERRIDDEN / FORCED OFF", fontsize=8, color=c_black, fontname="courier")
    page1.insert_text(pymupdf.Point(50, y_start + 60), "• Dampak Ilusi   : Penyerang berasumsi radar lumpuh", fontsize=8, color=c_black, fontname="courier")

    # Right Box: Real Military System
    page1.draw_rect(pymupdf.Rect(305, y_start, 555, y_start + 70), color=c_green, fill=(0.92, 0.99, 0.94), width=1)
    page1.insert_text(pymupdf.Point(315, y_start + 16), "PADA SISTEM ASLI SATUAN TNI AD (REAL ASSET):", fontsize=8.5, color=c_green, fontname="helv")
    page1.insert_text(pymupdf.Point(315, y_start + 32), "• Suhu Radar Riil: 34.0°C (NOMINAL / NORMAL)", fontsize=8, color=c_black, fontname="courier")
    page1.insert_text(pymupdf.Point(315, y_start + 46), "• Sirkulasi OT   : Beroperasi Penuh Tanpa Interupsi", fontsize=8, color=c_black, fontname="courier")
    page1.insert_text(pymupdf.Point(315, y_start + 60), "• Keamanan Fisik : 100% TERISOLASI & TERLINDUNGI", fontsize=8, color=c_black, fontname="courier")

    # Section 4: MITRE ATT&CK Mapping
    y_start += 82
    page1.draw_rect(pymupdf.Rect(40, y_start, 555, y_start + 20), color=c_dark_navy, fill=c_dark_navy)
    page1.insert_text(pymupdf.Point(50, y_start + 14), "4. PEMETAAN TAKTIK & TEKNIK MITRE ATT&CK (ENTERPRISE & ICS/OT)", fontsize=10, color=c_white, fontname="helv")
    y_start += 25

    mitre_headers = [("KODE TAKTIK", 80), ("NAMA TEKNIK MITRE", 190), ("KATEGORI DOMAIN", 130), ("STATUS DETEKSI", 115)]
    cur_x = 40
    for h_name, w in mitre_headers:
        page1.draw_rect(pymupdf.Rect(cur_x, y_start, cur_x + w, y_start + 16), color=c_gray, fill=c_light_bg, width=0.5)
        page1.insert_text(pymupdf.Point(cur_x + 6, y_start + 11), h_name, fontsize=7.5, color=c_dark_navy, fontname="helv")
        cur_x += w
    y_start += 16

    mitre_rows = [
        ("T1190", "Exploit Public-Facing Application", "Initial Access (IT)", "DICEGAT & DIBELOKKAN"),
        ("T0855", "Unauthorized Command Message", "Inhibit Response (OT/ICS)", "DIJEBAK DI PANEL PALSU"),
        ("T1059.004", "Unix Shell Command Execution", "Execution (Linux VFS)", "DISADAP LIVE OLEH AI"),
        ("T1552.001", "Credentials In Files (.env & Satcom)", "Credential Access", "PELACAK BUMERANG AKTIF"),
    ]
    for m_id, m_name, m_cat, m_stat in mitre_rows:
        cur_x = 40
        row_vals = [m_id, m_name, m_cat, m_stat]
        for idx, (h_name, w) in enumerate(mitre_headers):
            page1.draw_rect(pymupdf.Rect(cur_x, y_start, cur_x + w, y_start + 15), color=c_gray, fill=c_white, width=0.5)
            val = row_vals[idx]
            color = c_green if idx == 3 else c_black
            page1.insert_text(pymupdf.Point(cur_x + 6, y_start + 11), val[:34], fontsize=7.5, color=color, fontname="courier" if idx == 0 else "helv")
            cur_x += w
        y_start += 15

    # Footer Page 1
    page1.insert_text(pymupdf.Point(40, 810), "CAKRA-DECOY 2.0 // KARTIKA CYBER HACKATHON 2026 // PUSSIBERAD TNI AD", fontsize=7.5, color=c_gray, fontname="helv")
    page1.insert_text(pymupdf.Point(500, 810), "HALAMAN 1 DARI 2", fontsize=7.5, color=c_gray, fontname="helv")

    # PAGE 2: Forensic Ledger (SHA-256), Herd-Immunity & Military Signatures
    page2 = doc.new_page(width=595, height=842)
    page2.draw_rect(pymupdf.Rect(20, 20, 575, 822), color=c_dark_navy, width=1.5)
    page2.draw_rect(pymupdf.Rect(24, 24, 571, 818), color=c_gold, width=0.75)

    # Top Header Page 2
    page2.draw_rect(pymupdf.Rect(25, 25, 570, 35), color=c_dark_navy, fill=c_dark_navy)
    page2.insert_text(
        pymupdf.Point(135, 47),
        "LAMPIRAN BUKTI HUKUM FORENSIK DIGITAL & RANTAI KRIPTOGRAFI",
        fontsize=10,
        color=c_white,
        fontname="helv",
    )

    y_start2 = 75
    # Section 5: Cryptographic Chain of Custody
    page2.draw_rect(pymupdf.Rect(40, y_start2, 555, y_start2 + 20), color=c_dark_navy, fill=c_dark_navy)
    page2.insert_text(pymupdf.Point(50, y_start2 + 14), "5. BUKTI HUKUM BERANTAI SHA-256 (IMMUTABLE FORENSIC LEDGER)", fontsize=10, color=c_white, fontname="helv")
    y_start2 += 25

    # Ledger Verification Badge — cerminkan status rantai nyata
    badge_color = c_green if chain_is_valid else c_red
    badge_fill = (0.92, 0.99, 0.94) if chain_is_valid else (0.99, 0.92, 0.92)
    badge_text = (
        "STATUS KEABSAHAN HUKUM : VALID_IMMUTABLE (SEMPURNA)"
        if chain_is_valid
        else f"STATUS KEABSAHAN HUKUM : TAMPERED_CRITICAL (ANOMALI PADA BLOK #{tampered_block_index})"
    )
    page2.draw_rect(pymupdf.Rect(40, y_start2, 555, y_start2 + 35), color=badge_color, fill=badge_fill, width=1)
    page2.insert_text(pymupdf.Point(50, y_start2 + 15), badge_text, fontsize=9, color=badge_color, fontname="helv")
    page2.insert_text(pymupdf.Point(50, y_start2 + 27), "Formula Verifikasi Segel: SHA256(BlockIndex || Timestamp || SessionID || ActionSummary || PrevHash)", fontsize=7.5, color=c_black, fontname="courier")
    y_start2 += 45

    # Ledger Blocks Table
    for blk in blocks[:6]:  # Show up to 6 blocks
        idx = blk.get("block_index", 0)
        ts = blk.get("timestamp", now.isoformat())[:19]
        summary = blk.get("action_summary", "Aktivitas Terekam")
        cur_hash = blk.get("current_hash", "0" * 64)

        blk_tampered = tampered_block_index is not None and idx == tampered_block_index
        row_fill = (0.99, 0.92, 0.92) if blk_tampered else c_light_bg
        page2.draw_rect(pymupdf.Rect(40, y_start2, 555, y_start2 + 38), color=c_gray, fill=row_fill, width=0.5)
        page2.insert_text(pymupdf.Point(48, y_start2 + 13), f"BLOK #{idx} [{ts} UTC] - {summary}", fontsize=8, color=c_dark_navy, fontname="helv")
        page2.insert_text(pymupdf.Point(48, y_start2 + 25), f"HASH SHA-256: {cur_hash}", fontsize=7, color=c_black, fontname="courier")
        blk_status = (
            "STATUS INTEGRITAS: [X TAMPERED - SEGEL RUSAK]"
            if blk_tampered
            else "STATUS INTEGRITAS: [VALID & TERSEGEL]"
        )
        page2.insert_text(pymupdf.Point(48, y_start2 + 34), blk_status, fontsize=7, color=(c_red if blk_tampered else c_green), fontname="helv")
        y_start2 += 42

    # Section 6: Tactical Herd-Immunity Vaccine Deployed
    y_start2 += 10
    page2.draw_rect(pymupdf.Rect(40, y_start2, 555, y_start2 + 20), color=c_dark_navy, fill=c_dark_navy)
    page2.insert_text(pymupdf.Point(50, y_start2 + 14), "6. DISKRESI PERTAHANAN: VAKSIN HERD-IMMUNITY KODAM SE-INDONESIA", fontsize=10, color=c_white, fontname="helv")
    y_start2 += 25

    vaccine_text = (
        "Berdasarkan pola tanda tangan serangan di atas, CAKRA-DECOY 2.0 telah menerbitkan dan menyebarkan "
        "aturan kekebalan otonom ke 15 Komando Daerah Militer (Kodam Jaya, Kodam III/Siliwangi, Kodam IV/Diponegoro, "
        "Kodam V/Brawijaya, hingga Kodam XVII/Cenderawasih):\n"
        f"• Iptables Rule : iptables -A INPUT -s {real_ip.split()[0]}/32 -j DROP\n"
        "• ModSecurity   : SecRule ARGS \"@detectSQLi\" \"id:990014,phase:2,deny,status:403,msg:'CAKRA Immuno-Patch'\"\n"
        "• Status Satuan : 15 KODAM KEBAL & TERPROTEKSI DALAM < 1 DETIK."
    )
    page2.draw_rect(pymupdf.Rect(40, y_start2, 555, y_start2 + 75), color=c_gray, fill=c_light_bg, width=0.5)
    page2.insert_textbox(pymupdf.Rect(48, y_start2 + 6, 545, y_start2 + 70), vaccine_text, fontsize=7.5, color=c_black, fontname="courier")
    y_start2 += 85

    # Section 7: Military Formal Signatures
    y_start2 += 10
    page2.insert_text(pymupdf.Point(50, y_start2 + 10), "Dibuat dan Diverifikasi oleh:", fontsize=8.5, color=c_black, fontname="helv")
    page2.insert_text(pymupdf.Point(360, y_start2 + 10), "Mengetahui & Menyetujui:", fontsize=8.5, color=c_black, fontname="helv")

    page2.insert_text(pymupdf.Point(50, y_start2 + 24), "PERWIRA JAGA SOC PUSSIBERAD", fontsize=8.5, color=c_dark_navy, fontname="helv")
    page2.insert_text(pymupdf.Point(360, y_start2 + 24), "KOMANDAN DETASEMEN SIBER KODAM", fontsize=8.5, color=c_dark_navy, fontname="helv")

    # Stamp / Signature Placeholder Box
    page2.draw_rect(pymupdf.Rect(50, y_start2 + 30, 160, y_start2 + 75), color=c_gray, fill=c_white, width=0.5)
    page2.insert_text(pymupdf.Point(60, y_start2 + 55), "[ TANDA TANGAN DIGITAL ]", fontsize=7.5, color=c_green, fontname="courier")
    page2.insert_text(pymupdf.Point(60, y_start2 + 67), "KUNCI: CAKRA-SHA256-CERT", fontsize=6.5, color=c_gray, fontname="courier")

    page2.draw_rect(pymupdf.Rect(360, y_start2 + 30, 470, y_start2 + 75), color=c_gray, fill=c_white, width=0.5)
    page2.insert_text(pymupdf.Point(370, y_start2 + 55), "[ PENGESAHAN KOMANDAN ]", fontsize=7.5, color=c_green, fontname="courier")
    page2.insert_text(pymupdf.Point(370, y_start2 + 67), "STATUS: DISAHKAN UNTUK DFIR", fontsize=6.5, color=c_gray, fontname="courier")

    page2.insert_text(pymupdf.Point(50, y_start2 + 90), "LETTU INF / KAPTEN CHB", fontsize=8, color=c_black, fontname="helv")
    page2.insert_text(pymupdf.Point(50, y_start2 + 100), "NRP: 11180029310892", fontsize=7.5, color=c_gray, fontname="courier")

    page2.insert_text(pymupdf.Point(360, y_start2 + 90), "KOLONEL INF / BRIGJEN TNI", fontsize=8, color=c_black, fontname="helv")
    page2.insert_text(pymupdf.Point(360, y_start2 + 100), "PANGKAT / JABATAN RESMI", fontsize=7.5, color=c_gray, fontname="courier")

    # Footer Page 2
    page2.insert_text(pymupdf.Point(40, 810), "CAKRA-DECOY 2.0 // KARTIKA CYBER HACKATHON 2026 // PUSSIBERAD TNI AD", fontsize=7.5, color=c_gray, fontname="helv")
    page2.insert_text(pymupdf.Point(500, 810), "HALAMAN 2 DARI 2", fontsize=7.5, color=c_gray, fontname="helv")

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes
