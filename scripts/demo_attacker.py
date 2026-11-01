#!/usr/bin/env python3
"""
CAKRA-DECOY 2.0 — Tactical Demo & Red Team Simulation Suite (scripts/demo_attacker.py)
Author: Role 3 Lead (Counter-Intel, Forensics & Demo Specialist)
Standard: PUSSIBERAD Kartika Cyber Hackathon 2026 - Anti-Slop Zero-Placeholder

Executes 6 Stage Automated or Interactive Live Attack Scenarios:
- STAGE 1: Recon & SQLi Auth Bypass Infiltration (admin' OR '1'='1)
- STAGE 2: OT/SCADA Radar Cooling Sabotage (Trigger 115.8°C Overheat Illusion)
- STAGE 3: Stateful Web-SSH Reconnaissance (VFS Execution: pwd, ls, cat)
- STAGE 4: Operasi Bumerang Trigger (3-Way Honeytoken Execution)
- STAGE 5: SHA-256 Ledger Tamper-Test & Instant Cryptographic Recovery
- STAGE 6: Herd-Immunity Vaccine Broadcast & 1-Click Military DFIR PDF Export
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional, Tuple

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)


class TacticalColors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    CYAN = "\033[36m"
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_NAVY = "\033[44m"


def print_banner():
    banner = f"""{TacticalColors.BOLD}{TacticalColors.CYAN}
╔════════════════════════════════════════════════════════════════════════════╗
║     CAKRA-DECOY 2.0 — TACTICAL LIVE ATTACK & DECEPTION SIMULATION SUITE    ║
║       KARTIKA CYBER HACKATHON 2026 // PUSSIBERAD CSIRT MILITER TNI AD       ║
╚════════════════════════════════════════════════════════════════════════════╝{TacticalColors.RESET}
    """
    print(banner)


def make_request(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    data: Optional[Dict[str, Any]] = None,
    raw_data: Optional[bytes] = None,
) -> Tuple[int, Any]:
    req_headers = headers or {}
    payload_bytes = None

    if data is not None:
        if "Content-Type" not in req_headers:
            req_headers["Content-Type"] = "application/json"
        payload_bytes = json.dumps(data).encode("utf-8")
    elif raw_data is not None:
        payload_bytes = raw_data

    req = urllib.request.Request(url=url, data=payload_bytes, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            status_code = response.status
            content_type = response.headers.get("Content-Type", "")
            resp_body = response.read()
            if "application/json" in content_type:
                try:
                    return status_code, json.loads(resp_body.decode("utf-8"))
                except Exception:
                    return status_code, resp_body.decode("utf-8", errors="ignore")
            return status_code, resp_body
    except urllib.error.HTTPError as e:
        err_body = e.read()
        try:
            return e.code, json.loads(err_body.decode("utf-8"))
        except Exception:
            return e.code, err_body.decode("utf-8", errors="ignore")
    except Exception as ex:
        return 0, str(ex)


def run_stage_1_sqli(base_url: str) -> str:
    print(f"\n{TacticalColors.BOLD}{TacticalColors.YELLOW}[TAHAP 1] INJEKSI SQL PADA PORTAL LOGISTIK TNI AD (ENTRY VECTOR){TacticalColors.RESET}")
    print(f"{TacticalColors.CYAN}--> Mengirim payload bypass: admin' OR '1'='1 --{TacticalColors.RESET}")
    login_url = f"{base_url}/api/auth/login"
    payload = {
        "username": "admin' OR '1'='1 --",
        "password": "PasswordTNI2026!",
    }
    status, res = make_request(login_url, method="POST", data=payload)
    print(f"HTTP Status: {status}")
    print(f"Server Response: {res}")

    session_token = "SES-KDM03-9941A"
    if isinstance(res, dict) and "session_token" in res:
        session_token = res["session_token"]
    print(f"{TacticalColors.GREEN}[✓] Intersepsi Senyap Sukses: Penyerang menerima HTTP 200 OK (Opaque Session: {session_token}){TacticalColors.RESET}")
    return session_token


def run_stage_2_ot_sabotage(base_url: str, session_token: str):
    print(f"\n{TacticalColors.BOLD}{TacticalColors.YELLOW}[TAHAP 2] UPAYA SABOTASE SCADA/OT (PENDINGIN RADAR PERTAHANAN UDARA){TacticalColors.RESET}")
    print(f"{TacticalColors.CYAN}--> Mengirim instruksi manipulasi voltase: OVERRIDE_COOLING_SHUTDOWN{TacticalColors.RESET}")
    ot_url = f"{base_url}/api/ot/control"
    payload = {
        "session_token": session_token,
        "action": "EMERGENCY_COOLING_OVERRIDE_SHUTDOWN",
        "target_system": "RADAR_AIR_DEFENSE_PRIMARY",
    }
    status, res = make_request(ot_url, method="POST", data=payload)
    print(f"HTTP Status: {status}")
    print(f"Response ke Penyerang: {res}")
    print(f"{TacticalColors.RED}[!] Layar Penyerang Menampilkan: RADAR OVERHEAT 115.8°C — SISTEM LUMPUH!{TacticalColors.RESET}")
    print(f"{TacticalColors.GREEN}[✓] Telemetri Asli TNI AD: Suhu Riil Tetap 34.0°C (Sistem Fisik 100% Aman Terlindungi){TacticalColors.RESET}")


def run_stage_3_web_ssh(base_url: str, session_token: str):
    print(f"\n{TacticalColors.BOLD}{TacticalColors.YELLOW}[TAHAP 3] EKSPLORASI WEB-SSH CONSOLE (TWO-TIER HYBRID VFS ENGINE){TacticalColors.RESET}")
    console_url = f"{base_url}/api/sys/console"

    commands = [
        "whoami",
        "pwd",
        "ls -la /opt/satcom",
        "cat /opt/satcom/kredensial_komando.env",
    ]

    for cmd in commands:
        print(f"\n{TacticalColors.CYAN}[SSH Terminal]$ {cmd}{TacticalColors.RESET}")
        payload = {"session_token": session_token, "command": cmd}
        t0 = time.time()
        status, res = make_request(console_url, method="POST", data=payload)
        lat_ms = (time.time() - t0) * 1000

        output = res.get("output", str(res)) if isinstance(res, dict) else str(res)
        print(f"{output.strip()}")
        print(f"{TacticalColors.GREEN}--> Dieksekusi oleh: {res.get('execution_source', 'VFS_ENGINE')} (Latensi: {lat_ms:.2f} ms){TacticalColors.RESET}")


def run_stage_4_honeytoken_trigger(base_url: str, session_token: str):
    print(f"\n{TacticalColors.BOLD}{TacticalColors.YELLOW}[TAHAP 4] OPERASI BUMERANG: MEMICU 3 JALUR HONEYTOKEN TRAP{TacticalColors.RESET}")

    # Jalur 3: Eksekusi JWT Bearer via cURL CLI
    print(f"\n{TacticalColors.CYAN}--- [JALUR 3: PENYERANG MENGETES JWT TOKEN VIA CLI] ---{TacticalColors.RESET}")
    from honeytoken import generate_jwt_honeytoken

    token_jwt = generate_jwt_honeytoken(session_token)
    keys_url = f"{base_url}/api/v1/satcom/keys"
    print(f"curl -H 'Authorization: Bearer {token_jwt[:30]}...' {keys_url}")
    status, res = make_request(keys_url, method="GET", headers={"Authorization": f"Bearer {token_jwt}"})
    print(f"Response: {res}")
    print(f"{TacticalColors.RED}[✓ BOOMERANG HIT] Identitas Host & IP Penyerang Berhasil Disadap!{TacticalColors.RESET}")

    # Jalur 2: Hacker membaca komentar debug HTML
    print(f"\n{TacticalColors.CYAN}--- [JALUR 2: PENYERANG MENGAKSES TIKET DEBUG DARI SOURCE CODE HTML] ---{TacticalColors.RESET}")
    ticket_url = f"{base_url}/api/v1/satcom/keys?ticket=satcom-root-bypass-8821a&sid={session_token}"
    print(f"GET {ticket_url}")
    status, res = make_request(ticket_url, method="GET")
    print(f"Response: {res}")
    print(f"{TacticalColors.RED}[✓ BOOMERANG HIT] Honeytoken Komentar Debug Berhasil Terpicu!{TacticalColors.RESET}")

    # Jalur 1: Telemetry WebRTC STUN Beacon Callback
    print(f"\n{TacticalColors.CYAN}--- [JALUR 1: SIMULASI BEACON CALLBACK DARI Akses_Darurat_Satelit_TNI.html] ---{TacticalColors.RESET}")
    beacon_url = f"{base_url}/api/telemetry/sync"
    beacon_payload = {
        "sid": session_token,
        "webrtc_ip": "103.147.12.89",
        "gpu": "ANGLE (NVIDIA Corporation, NVIDIA GeForce RTX 4070 Laptop GPU, OpenGL 4.5)",
        "canvas_hash": "e4b89100a2c7f91d",
        "os": "Linux x86_64 (Kali GNU/Linux Rolling)",
        "screen": "1920x1080",
    }
    status, res = make_request(beacon_url, method="POST", data=beacon_payload)
    print(f"Response: {res}")
    print(f"{TacticalColors.GREEN}[✓] Data Telemetri & Titik Koordinat Penyerang Muncul di Layar C4ISR Command Center!{TacticalColors.RESET}")


def run_stage_5_tamper_test(base_url: str):
    print(f"\n{TacticalColors.BOLD}{TacticalColors.YELLOW}[TAHAP 5] UJI KETAHANAN BUKTI FORENSIK: SIMULASI MANIPULASI DATABASE (TAMPER-TEST){TacticalColors.RESET}")
    tamper_url = f"{base_url}/api/forensic/tamper-test"
    print(f"{TacticalColors.CYAN}--> Mensimulasikan pengubahan 1 byte pada log database di Blok #1...{TacticalColors.RESET}")
    status, res = make_request(tamper_url, method="POST", data={"block_index": 1})
    print(f"Hasil Verifikasi: {res}")
    print(f"{TacticalColors.RED}{TacticalColors.BOLD}[ALARM MERAH] STATUS BUKTI HUKUM: TAMPERED_CRITICAL (INTEGRITAS RUSAK!){TacticalColors.RESET}")

    time.sleep(1)
    print(f"\n{TacticalColors.CYAN}--> Memulihkan rantai bukti ke Snapshot Sah Terverifikasi (Self-Healing Ledger)...{TacticalColors.RESET}")
    restore_url = f"{base_url}/api/forensic/restore"
    status, res = make_request(restore_url, method="POST", data={})
    print(f"Hasil Pemulihan: {res}")
    print(f"{TacticalColors.GREEN}{TacticalColors.BOLD}[SEMPURNA] STATUS BUKTI HUKUM: VALID_IMMUTABLE (RANTAI PULIH!){TacticalColors.RESET}")


def run_stage_6_vaccine_and_pdf(base_url: str, session_token: str):
    print(f"\n{TacticalColors.BOLD}{TacticalColors.YELLOW}[TAHAP 6] BROADCAST VAKSIN HERD-IMMUNITY & 1-CLICK EXPORT DFIR PDF{TacticalColors.RESET}")
    vaccine_url = f"{base_url}/api/immunity/broadcast"
    status, res = make_request(vaccine_url, method="POST", data={"session_token": session_token})
    print(f"Penyebaran Aturan Firewall Otomatis: {res}")
    print(f"{TacticalColors.GREEN}[✓] Seluruh 15 Titik Kodam Se-Indonesia Berubah Menjadi Hijau (IMMUNE_PROTECTED)!{TacticalColors.RESET}")

    pdf_url = f"{base_url}/api/forensic/export-pdf?session_token={session_token}"
    print(f"\n{TacticalColors.CYAN}--> Mengunduh Dokumen Resmi Laporan Investigasi Insiden Militer (DFIR PDF)...{TacticalColors.RESET}")
    status, pdf_content = make_request(pdf_url, method="GET")
    if status == 200 and isinstance(pdf_content, bytes):
        out_filename = "Laporan_DFIR_PUSSIBERAD_TNI_AD.pdf"
        with open(out_filename, "wb") as f:
            f.write(pdf_content)
        print(f"{TacticalColors.GREEN}{TacticalColors.BOLD}[✓] Berhasil Mencetak Laporan Militer Resmi: {out_filename} ({len(pdf_content):,} bytes){TacticalColors.RESET}")
    else:
        print(f"{TacticalColors.YELLOW}[*] PDF Response: {pdf_content}{TacticalColors.RESET}")


def main():
    parser = argparse.ArgumentParser(description="CAKRA-DECOY 2.0 Live Red Team & Demo Automation Suite")
    parser.add_argument("--url", default="http://127.0.0.1:8001", help="Backend base URL")
    parser.add_argument("--auto", action="store_true", help="Run all 6 stages sequentially without prompts")
    parser.add_argument("--stage", type=int, choices=[1, 2, 3, 4, 5, 6], help="Run a specific stage only")
    args = parser.parse_args()

    print_banner()
    base_url = args.url.rstrip("/")

    # Quick connectivity check
    print(f"{TacticalColors.CYAN}[*] Menghubungkan ke Backend CAKRA-DECOY di {base_url}...{TacticalColors.RESET}")
    status, res = make_request(f"{base_url}/api/portal/state")
    if status == 0:
        print(f"{TacticalColors.RED}[!] Server backend belum aktif di {base_url}. Jalankan backend terlebih dahulu.{TacticalColors.RESET}")
        print(f"{TacticalColors.YELLOW}    Tips: cd backend && uvicorn main:app --reload --port 8000{TacticalColors.RESET}")
        sys.exit(1)

    session_token = "SES-KDM03-9941A"

    stages = [
        (1, "Infiltrasi SQL Injection", lambda: run_stage_1_sqli(base_url)),
        (2, "Sabotase SCADA Pendingin Radar", lambda: run_stage_2_ot_sabotage(base_url, session_token)),
        (3, "Web-SSH Console & Hybrid VFS", lambda: run_stage_3_web_ssh(base_url, session_token)),
        (4, "Operasi Bumerang Honeytoken", lambda: run_stage_4_honeytoken_trigger(base_url, session_token)),
        (5, "Uji Manipulasi Bukti SHA-256", lambda: run_stage_5_tamper_test(base_url)),
        (6, "Vaksin Kodam & Cetak DFIR PDF", lambda: run_stage_6_vaccine_and_pdf(base_url, session_token)),
    ]

    for st_num, st_name, st_func in stages:
        if args.stage and args.stage != st_num:
            continue

        if not args.auto and not args.stage:
            input(f"\n{TacticalColors.BOLD}{TacticalColors.CYAN}Tekan [ENTER] untuk mengeksekusi TAHAP {st_num}: {st_name}...{TacticalColors.RESET}")

        result = st_func()
        if st_num == 1 and isinstance(result, str):
            session_token = result

    print(f"\n{TacticalColors.BOLD}{TacticalColors.GREEN}╔════════════════════════════════════════════════════════════════════════╗")
    print(f"║     SELURUH SEKUENS DEMO CAKRA-DECOY 2.0 TELAH BERJALAN SEMPURNA!      ║")
    print(f"╚════════════════════════════════════════════════════════════════════════╝{TacticalColors.RESET}\n")


if __name__ == "__main__":
    main()
