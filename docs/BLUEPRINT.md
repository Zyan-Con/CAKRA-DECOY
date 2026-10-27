# Technical Architecture & Execution Blueprint: CAKRA-DECOY 2.0

Dokumen ini adalah panduan arsitektur teknis utama (*Single Source of Truth*) bagi tim pengembang (3 orang) untuk membangun, mengintegrasikan, dan mendemonstrasikan **CAKRA-DECOY 2.0** di hadapan dewan juri **PUSSIBERAD (Kartika Cyber Hackathon 2026)**. Seluruh celah logika (*blindspots*) dari audit Red Team telah ditambal di dalam spesifikasi ini.

---

## 1. Diagram Arsitektur & Alur Kerja End-to-End

Sistem terdiri dari **2 Portal Antarmuka Terpadu (Next.js Frontend)** dan **1 Mesin Inti Pertahanan & Deception (Python FastAPI Backend)** yang disinkronkan secara *real-time* melalui **Unified C4ISR WebSocket Stream**:

```text
                             [ PENGGUNA / PENYERANG APT ]
                                          │
                                          ▼ (HTTP Request / OT Command)
             ┌─────────────────────────────────────────────────────────┐
             │         1. OPAQUE SILENT TACTICAL INTERCEPTOR           │
             │        (backend/main.py + backend/detector.py)          │
             │   - Inspeksi SQLi, RCE, Path Traversal, Anomali SCADA   │
             │   - Respons HTTP 200 OK Identik (Zero DevTools Leak!)   │
             └────────────┬───────────────────────────────┬────────────┘
                          │                               │
         [Skor Ancaman < 70: Prajurit Sah]   [Skor Ancaman >= 70: Mode DECOY]
                          │                  (Server-Side Silent Routing < 5ms)
                          ▼                               ▼
     ┌────────────────────────────────┐   ┌──────────────────────────────────────────┐
     │      PORTAL ASLI SATUAN        │   │    2. CHAMELEON AI MIRROR-TWIN SANDBOX   │
     │ - Dashboard Logistik Asli      │   │  (backend/decoy.py + ai_shell.py)        │
     │ - Pendingin Radar: 34.0°C      │   │ - Dashboard Admin Bayangan (Data Umpan)  │
     │ - Status: 100% Terisolasi Aman │   │ - Panel SCADA Palsu (Ilusi Overheat 115C)│
     └────────────────────────────────┘   │ - Hybrid Web-SSH:                        │
                                          │   * Tier-1: In-Memory VFS (< 2ms, 100%   │
                                          │     stateful untuk cd/ls/cat/pwd/whoami) │
                                          │   * Tier-2: LLM Context Shell + Fallback │
                                          │ - Dual-Vector Honeytoken (honeytoken.py):│
                                          │   * Akses_Darurat_Satelit_TNI.html       │
                                          │   * kredensial_komando.env (CLI Canary)  │
                                          └─────────────────────┬────────────────────┘
                                                                │
                                          [Sadap Aktivitas Live & Boomerang Callback]
                                                                │
                                                                ▼
                                          ┌──────────────────────────────────────────┐
                                          │   3. ASYNC INTEL & FORENSIC LEDGER       │
                                          │ - mitre_service.py (Async MITRE & APT)   │
                                          │ - forensic_chain.py (SHA-256 + Tamper UI)│
                                          │ - pdf_service.py (1-Click Military DFIR) │
                                          └─────────────────────┬────────────────────┘
                                                                │
                                          (ws.py -> /ws/command-stream + State Sync)
                                                                │
                                                                ▼
                                          ┌──────────────────────────────────────────┐
                                          │     4. C4ISR COMMAND CENTER DASHBOARD    │
                                          │      (frontend/src/app/command-center)   │
                                          │ - AttackGraph.tsx (Visualisasi Belokan)  │
                                          │ - LiveTerminalSpy.tsx (Sadap Ketikan)    │
                                          │ - MitreMatrix.tsx (Peta TTP & Psikologi) │
                                          │ - TacticalMap.tsx (Radar IP & 15 Kodam)  │
                                          │ - ForensicTable.tsx (SHA-256 & Tamper)   │
                                          └──────────────────────────────────────────┘
```

---

## 2. Tech Stack & Kesiapan Operasi (On-Premise / Air-Gapped Ready)

### A. Frontend (`frontend/` — Next.js App Router + TypeScript)
* **Framework:** **Next.js 14+ (App Router, TypeScript)** — Menyatukan halaman `/target-portal` (Portal Logistik & SCADA TNI AD) dan `/command-center` (Layar Pantau C4ISR PUSSIBERAD) dalam satu aplikasi.
* **Desain & Estetika Militer (*Palantir Gotham / Anduril Lattice Standard*):**
  * **Tailwind CSS + Lucide Icons** dengan palet taktis kontras tinggi: `slate-950` / `zinc-950` (latar komando), `emerald-500` (sistem asli terlindungi / Kodam kebal), `amber-500` (sesi penyerang dikarantina di *Mirror-Twin*), `red-500` / `rose-600` (sabotase OT / *honeytoken* aktif / rantai bukti *tampered*).
  * Tipografi `font-mono` untuk seluruh telemetri angka, alamat IP, koordinat GPS, *log* terminal, dan segel `SHA-256`.
* **Ketahanan Demo Frontend:** Dilengkapi *WebSocket Auto-Reconnect*, *Initial State Hydration* (tahan *refresh* `F5`), serta **Offline Tactical Simulation Trigger** di UI jika jaringan panggung mengalami gangguan.

### B. Backend (`backend/` — Python 3.11+ FastAPI)
* **Framework:** **FastAPI + Uvicorn + WebSockets** — Menangani intersepsi payload, *stateful session store*, *Hybrid VFS*, dan *real-time broadcast* ke Command Center.
* **Mesin AI Hibrida (`ai_shell.py` & `mitre_service.py`):**
  * **Tier-1 (Deterministic VFS Engine):** Menjawab perintah dasar & navigasi file secara instan ($< 2\text{ ms}$) dari memori Python.
  * **Tier-2 (LLM Engine):** Mendukung **Groq API (`llama-3.3-70b-versatile`)**, **Google Gemini (`gemini-2.5-flash`)**, atau **Ollama Lokal (`qwen2.5-coder:7b`)** untuk mode *Air-Gapped* militer, lengkap dengan *automatic static fallback* jika koneksi API eksternal *timeout*.
* **Forensik & Laporan Militer (`forensic_chain.py` & `pdf_service.py`):**
  * Rantai blok kriptografi `hashlib.sha256` dengan fitur *In-Memory Snapshot & Tamper Simulation*.
  * Generator dokumen **PDF Laporan Investigasi Forensik (DFIR)** instan menggunakan `PyMuPDF` (`fitz`).

---

## 3. Struktur Direktori Repositori (100% Sinkron dengan Aktual Repo)

```text
ChakraDecoy/
├── docker-compose.yml                        # Orkestrasi kontainer Backend & Frontend
├── README.md                                 # Dokumentasi instalasi & panduan demo juri
├── docs/
│   ├── PRD.md                                # Dokumen Kebutuhan Produk (Upgraded v2.0)
│   ├── BLUEPRINT.md                          # Dokumen Arsitektur & Kontrak Teknis ini
│   └── ai_agent_developer_master_prompts.md  # Panduan prompt AI untuk 3 anggota tim
├── backend/                                  # [ORANG 1 & 3] Python FastAPI Defense Engine
│   ├── __init__.py
│   ├── .env                                  # Konfigurasi lokal (di-ignore di git publik)
│   ├── .env.example                          # Template variabel lingkungan (Mode AI, Port)
│   ├── requirements.txt                      # Dependensi Python (FastAPI, Groq, PyMuPDF, dll.)
│   ├── main.py                               # Entrypoint API, CORS Config & Route Dispatcher
│   ├── detector.py                           # Inspeksi SQLi/RCE/SCADA & Threat Scoring (< 5ms)
│   ├── decoy.py                              # State Manager Mirror-Twin & Telemetri SCADA Palsu
│   ├── ai_shell.py                           # Hybrid VFS (< 2ms) + Anti-Jailbreak + LLM Shell
│   ├── honeytoken.py                         # Generator HTML WebRTC/GPU Umpan & Canary .env
│   ├── mitre_service.py                      # Async MITRE ATT&CK Mapper & APT Profiler
│   ├── forensic_chain.py                     # SHA-256 Hash-Chain Ledger & Tamper-Test Engine
│   ├── pdf_service.py                        # Generator 1-Click Military DFIR Report (PDF)
│   └── ws.py                                 # WebSocket Hub (/ws/command-stream) & State Sync
└── frontend/                                 # [ORANG 2] Next.js C4ISR & Target Portal UI
    ├── package.json
    └── src/
        ├── app/
        │   ├── layout.tsx                    # Root layout dengan tema taktis & font-mono
        │   ├── page.tsx                      # Gerbang Peluncur Demo (Split-Screen Launcher)
        │   ├── target-portal/
        │   │   └── page.tsx                  # Layar 1: Portal Logistik, SCADA & Web-SSH TNI AD
        │   └── command-center/
        │       └── page.tsx                  # Layar 2: C4ISR Command Center SOC PUSSIBERAD
        ├── components/
        │   ├── AttackGraph.tsx               # Visualisasi aliran trafik & pembelokan Mirror-Twin
        │   ├── TacticalMap.tsx               # Peta Radar Indonesia (Lokasi APT & 15 Titik Kodam)
        │   ├── LiveTerminalSpy.tsx           # Sadap ketikan Web-SSH penyerang secara live
        │   ├── MitreMatrix.tsx               # Matriks taktik MITRE ATT&CK & Profil Psikologi APT
        │   └── ForensicTable.tsx             # Tabel bukti SHA-256, Tamper-Test & Export PDF
        └── lib/
            └── websocket.ts                  # Client WebSocket, State Hydrator & Offline Fallback
```

---

## 4. Penambalan 6 Titik Buta Teknis (Red Team Audit Hardening)

Untuk memastikan sistem tidak memiliki celah saat diuji oleh juri ahli siber TNI AD, enam mekanisme berikut **wajib diterapkan**:

### 1. Opaque Session Routing & Stealth Endpoint Naming (Anti-DevTools Leak)
* **Masalah Lama:** Mengembalikan `status: "SILENT_DECOY_REDIRECT"` atau memanggil URL `/api/decoy/terminal` akan langsung membongkar jebakan jika penyerang membuka tab *Network* di browser.
* **Desain Baru (`main.py` & `detector.py`):**
  * Endpoint login `/api/auth/login` **selalu** mengembalikan struktur JSON identik baik untuk login sah maupun injeksi SQLi/RCE:
    ```json
    {
      "status": "AUTHENTICATED",
      "session_token": "ses-kdm03-9941a",
      "operator_role": "LOGISTICS_COMMAND_ADMIN",
      "clearance_level": "LEVEL_4_RESTRICTED"
    }
    ```
  * Status bahwa `ses-kdm03-9941a` adalah sesi **DECOY** disimpan sepenuhnya di `decoy.py` (di sisi server) dan hanya dikirim ke layar Command Center melalui WebSocket `/ws/command-stream`.
  * Endpoint terminal dinamai `/api/sys/console` dan endpoint penerima sinyal *honeytoken* dinamai `/api/telemetry/sync`.

### 2. Hybrid In-Memory VFS + Context-Injected LLM (`ai_shell.py`)
* **Masalah Lama:** Mengandalkan LLM murni untuk terminal membuat perintah `cd`, `pwd`, dan `ls` lambat ($> 1\text{ detik}$) dan sering berhalusinasi (lupa direktori atau menghilangkan file umpan).
* **Desain Baru (`ai_shell.py`):**
  * Setiap sesi memiliki objek `VirtualFileSystem` di memori yang menyimpan `cwd` (default: `/opt/satcom`) dan pohon file palsu termasuk `/opt/satcom/Akses_Darurat_Satelit_TNI.html`, `/opt/satcom/kredensial_komando.env`, `/opt/scada/radar_cooling.conf`, dan `/etc/passwd`.
  * Perintah `pwd`, `cd`, `ls`, `cat`, `whoami`, `id`, `uname`, `hostname`, `env`, `help`, `clear` dieksekusi langsung oleh VFS Python dalam **$< 2\text{ ms}$**.
  * Perintah lain divalidasi oleh *Anti-Jailbreak Regex Filter* terlebih dahulu. Jika valid, dikirim ke LLM dengan menyertakan `cwd` dan daftar file VFS agar balasan LLM 100% konsisten.

### 3. Dynamic Host Injection & CORS-Proof Dual-Transport Honeytoken (`honeytoken.py`)
* **Masalah Lama:** File `.html` yang dibuka dari folder *Downloads* lokal berjalan di `Origin: null` sehingga `fetch()` ke backend sering terkena blokir *CORS Preflight*, atau gagal jika URL backend di-*hardcode* ke `localhost`.
* **Desain Baru (`honeytoken.py`):**
  * Saat file diunduh via `GET /api/vfs/download/Akses_Darurat_Satelit_TNI.html?session_id=...`, `honeytoken.py` menyuntikkan URL server aktual (`request.base_url`) dan `session_id` langsung ke dalam skrip HTML sebelum dikirim ke browser penyerang.
  * Skrip pelacak di dalam HTML mengirimkan data menggunakan **Dual-Transport**:
    1. `fetch(SYNC_URL, { method: "POST", mode: "cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(payload) })` — Penggunaan `text/plain` menjadikan request ini sebagai *CORS Simple Request* yang **tidak memicu OPTIONS preflight** meskipun berasal dari `Origin: null` (`file://`).
    2. Fallback `new Image().src = SYNC_URL + "?b=" + encodeURIComponent(btoa(JSON.stringify(payload)))` (`GET /api/telemetry/sync`) untuk jaminan tembus 100% di semua browser.
  * Di file kedua (`kredensial_komando.env`), terdapat URL Canary `/api/v1/satcom/keys?token=HT-SATCOM-9921` yang jika diakses via `curl` atau terminal Web-SSH akan langsung memicu *alert* Honeytoken kedua.

### 4. Asynchronous MITRE ATT&CK Enrichment (`mitre_service.py`)
* Analisis psikologi APT dan pemetaan teknik MITRE dijalankan di latar belakang (`asyncio.create_task`) sehingga balasan terminal ke penyerang tidak pernah tertahan oleh proses analisis intelijen.

### 5. WebSocket Initial State Hydrator (`ws.py`)
* Setiap kali halaman `/command-center` terhubung ke `/ws/command-stream`, server langsung mengirimkan pesan `INITIAL_STATE_SYNC` berisi seluruh status sesi, riwayat terminal, daftar teknik MITRE, koordinat *honeytoken*, status 15 Kodam, dan seluruh blok SHA-256.

### 6. Interactive Forensic Tamper-Test & Restore (`forensic_chain.py`)
* Menyediakan endpoint `POST /api/forensic/tamper-test` (mengubah 1 byte data pada blok tengah secara sengaja untuk mendemonstrasikan deteksi `TAMPERED_CRITICAL` di layar juri) dan `POST /api/forensic/restore` (memulihkan kembali dari *verified cryptographic snapshot*).

---

## 5. Daftar Endpoint API & WebSocket (Kontrak Backend & Frontend)

| Metode | URL Endpoint | Input (Request Body / Query) | Fungsi & Efek Sistem |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `{username, password}` | Memeriksa payload dengan `detector.py`. Mengembalikan `status: "AUTHENTICATED"` + `session_token`. Jika skor $\ge 70$, menandai sesi sebagai `DECOY` di server & memancarkan `INTERCEPTION_ALERT` ke WS. |
| `GET` | `/api/portal/state` | `?session_token=...` | Mengambil data dashboard logistik & status panel SCADA (mengembalikan data asli untuk prajurit, atau data umpan untuk sesi *Decoy*). |
| `POST` | `/api/ot/control` | `{session_token, action, target_system}` | Menerima aksi manipulasi pendingin radar/generator. Jika sesi *Decoy*, mengembalikan ilusi `CRITICAL_OVERHEAT (115.8°C)` ke penyerang & memancarkan `OT_SABOTAGE_ATTEMPT` ke WS. |
| `POST` | `/api/sys/console` | `{session_token, command}` | Mengeksekusi perintah di Hybrid VFS (`< 2ms`) atau LLM Shell, mencatat blok SHA-256, memancarkan `TERMINAL_COMMAND_EXECUTED` + *async* `MITRE_ENRICHMENT_READY` ke WS. |
| `GET` | `/api/vfs/download/{filename}` | `?session_token=...` | Mengunduh file umpan (`Akses_Darurat_Satelit_TNI.html` atau `kredensial_komando.env`) dengan injeksi URL server & `session_token` dinamis. |
| `POST` / `GET` | `/api/telemetry/sync` | JSON string (`text/plain`) atau `?b=<base64>` | Endpoint penerima *callback* bumerang dari file HTML umpan. Membongkar IP asli, GPU, OS, dan lokasi penyerang, lalu memancarkan `HONEYTOKEN_TRIGGERED` ke WS. |
| `GET` | `/api/v1/satcom/keys` | `?token=HT-SATCOM-9921` | Canary endpoint dari file `kredensial_komando.env`. Jika diakses via browser/`curl`, langsung memicu `HONEYTOKEN_TRIGGERED`. |
| `POST` | `/api/immunity/broadcast` | `{session_token}` | Menghasilkan aturan *Iptables* & *ModSecurity WAF*, mengubah seluruh 15 titik Kodam menjadi `IMMUNE_PROTECTED`, dan memancarkan `IMMUNITY_BROADCASTED` ke WS. |
| `POST` | `/api/forensic/tamper-test` | `{block_index}` | Mensimulasikan modifikasi ilegal pada log blok ke-`block_index`, memvalidasi ulang rantai SHA-256, dan memancarkan `FORENSIC_INTEGRITY_ALERT` (`TAMPERED_CRITICAL`) ke WS. |
| `POST` | `/api/forensic/restore` | `{}` | Memulihkan rantai bukti forensik ke snapshot asli yang sah (`VALID_IMMUTABLE`) dan menyinkronkan ulang WS. |
| `GET` | `/api/forensic/export-pdf` | `?session_token=...` | Menghasilkan dan mengunduh dokumen resmi **Laporan Investigasi Forensik (DFIR) PUSSIBERAD** dalam format `.pdf`. |
| `WS` | `/ws/command-stream` | *WebSocket Connection* | Saluran *real-time* satu pintu yang mengirimkan **Unified C4ISR Telemetry Envelope** ke halaman `/command-center`. |

---

## 6. Kontrak Data Utama: Unified C4ISR Telemetry Envelope (WebSocket Schema v2.0)

Seluruh pesan WebSocket dari `backend/ws.py` ke `frontend/src/lib/websocket.ts` **WAJIB** mematuhi skema JSON berikut agar tidak terjadi *mismatch* properti antara Backend dan Frontend:

```json
{
  "schema_version": "2.0",
  "event_id": "evt-8f92a1c4-77b1-4d3a-9e12-001928374655",
  "event_type": "HONEYTOKEN_TRIGGERED",
  "timestamp": "2026-10-27T14:55:12.418+07:00",
  "session": {
    "session_id": "ses-kdm03-9941a",
    "routing_mode": "DECOY_MIRROR_TWIN",
    "interception_latency_ms": 2.4,
    "threat_score": 96,
    "entry_vector": "SQL_INJECTION_AUTH_BYPASS",
    "attacker_profile": {
      "actor_classification": "STATE_SPONSORED_APT",
      "confidence_pct": 92,
      "primary_intent": "OT_RADAR_SABOTAGE_AND_SATCOM_EXFILTRATION",
      "psychological_summary": "Penyerang memahami topologi SCADA militer dan mengincar kredensial komunikasi satelit setelah gagal melumpuhkan pendingin radar secara permanen."
    }
  },
  "routing_graph": {
    "source_node": "ATTACKER_INGRESS",
    "interceptor_node": "CAKRA_TACTICAL_PROXY",
    "active_target_node": "AI_MIRROR_TWIN_SANDBOX",
    "real_system_status": "PROTECTED_ISOLATED",
    "ot_telemetry": {
      "real_radar_temp_c": 34.0,
      "decoy_radar_temp_c": 115.8,
      "real_cooling_status": "NOMINAL",
      "decoy_cooling_status": "CRITICAL_OVERHEAT_ILLUSION"
    }
  },
  "terminal_activity": {
    "command_id": "cmd-004",
    "cwd": "/opt/satcom",
    "prompt": "ubuntu@srv-kodam-logistik-01:/opt/satcom$",
    "raw_input": "cat kredensial_komando.env",
    "simulated_output": "SATCOM_MASTER_KEY=TNIAD-DEC-99812-X\nSATCOM_API_URL=http://localhost:8000/api/v1/satcom/keys?token=HT-SATCOM-9921\nEMERGENCY_PORTAL_FILE=/opt/satcom/Akses_Darurat_Satelit_TNI.html",
    "execution_source": "VFS_DETERMINISTIC_ENGINE",
    "response_time_ms": 1.4
  },
  "mitre_intelligence": {
    "tactic_id": "TA0006",
    "tactic_name": "Credential Access",
    "technique_id": "T1552.001",
    "technique_name": "Unsecured Credentials: Credentials In Files",
    "severity": "CRITICAL",
    "cumulative_techniques": [
      "T1190",
      "T0855",
      "T1059.004",
      "T1552.001"
    ]
  },
  "boomerang_telemetry": {
    "triggered": true,
    "vector_type": "HTML_WEBRTC_BEACON",
    "token_id": "ht-satelit-01",
    "token_filename": "Akses_Darurat_Satelit_TNI.html",
    "apparent_proxy_ip": "185.220.101.44",
    "real_leaked_ip": "103.147.12.89",
    "local_lan_ip": "192.168.1.45",
    "geo_location": {
      "lat": -6.2146,
      "lng": 106.8451,
      "city": "Jakarta Selatan (APT Relay Node)",
      "country": "ID",
      "accuracy_radius_m": 150
    },
    "device_fingerprint": {
      "os": "Linux x86_64 (Kali GNU/Linux Rolling)",
      "browser": "Mozilla/5.0 (X11; Linux x86_64) Chrome/131.0.0.0",
      "gpu_renderer": "ANGLE (NVIDIA Corporation, NVIDIA GeForce RTX 4070 Laptop GPU, OpenGL 4.5)",
      "screen_resolution": "1920x1080",
      "webrtc_stun_leak": true,
      "canvas_hash": "e4b89100a2c7f91d"
    }
  },
  "forensic_block": {
    "block_index": 4,
    "timestamp": "2026-10-27T14:55:12.418+07:00",
    "action_summary": "HONEYTOKEN_CALLBACK: Akses_Darurat_Satelit_TNI.html opened from 103.147.12.89",
    "previous_hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "current_hash": "3c7b9f11a42e8871c0091e234b65d902a117c89b3214f665a098bc1234567890",
    "chain_integrity": "VALID_IMMUTABLE",
    "tampered_block_index": null
  },
  "herd_immunity": {
    "broadcast_active": false,
    "generated_rule": {
      "rule_id": "CAKRA-VAC-2026-004",
      "iptables_cmd": "iptables -A INPUT -s 103.147.12.89/32 -m string --algo bm --string \"OR '1'='1\" -j DROP",
      "modsec_rule": "SecRule ARGS \"@detectSQLi\" \"id:990014,phase:2,deny,status:403,msg:'CAKRA Herd Immunity Auto-Patch'\""
    },
    "kodam_nodes_status": [
      { "kodam_id": "KODAM-III", "name": "Kodam III/Siliwangi", "lat": -6.9175, "lng": 107.6191, "status": "UNDER_DECEPTION" },
      { "kodam_id": "KODAM-JAYA", "name": "Kodam Jaya/Jayakarta", "lat": -6.2250, "lng": 106.8700, "status": "STANDBY" },
      { "kodam_id": "KODAM-IV", "name": "Kodam IV/Diponegoro", "lat": -7.0491, "lng": 110.4150, "status": "STANDBY" }
    ]
  },
  "state_snapshot": {
    "terminal_history": [],
    "forensic_ledger": []
  }
}
```

### Daftar Standar `event_type`:
1. `INITIAL_STATE_SYNC` — Dikirim otomatis saat Command Center terhubung ke WebSocket (memuat `state_snapshot` penuh).
2. `INTERCEPTION_ALERT` — Saat `detector.py` mendeteksi skor ancaman $\ge 70$ dan mengaktifkan sesi `DECOY_MIRROR_TWIN`.
3. `OT_SABOTAGE_ATTEMPT` — Saat penyerang menekan tombol sabotase pendingin radar/generator di halaman bayangan.
4. `TERMINAL_COMMAND_EXECUTED` — Saat perintah di `/api/sys/console` selesai dieksekusi oleh VFS atau LLM.
5. `MITRE_ENRICHMENT_READY` — Update *asynchronous* hasil pemetaan taktik MITRE ATT&CK & profil psikologi APT.
6. `HONEYTOKEN_TRIGGERED` — Saat file `.html` dibuka atau *Canary URL* di `.env` ditembak oleh penyerang.
7. `IMMUNITY_BROADCASTED` — Saat tombol **Broadcast Vaksin Kodam** ditekan dan seluruh titik Kodam berubah menjadi `IMMUNE_PROTECTED`.
8. `FORENSIC_INTEGRITY_ALERT` — Saat fitur **Tamper-Test** atau **Restore Verified Chain** dijalankan pada buku bukti SHA-256.

---

## 7. Pembagian Tugas Tim (3 Orang) & Sinkronisasi Modul

* **Orang 1 (Backend, Interceptor & AI Engine):**
  * Bertanggung jawab atas `backend/main.py`, `backend/detector.py`, `backend/decoy.py`, `backend/ai_shell.py`, `backend/mitre_service.py`, dan `backend/ws.py`.
* **Orang 2 (Frontend, C4ISR Command Center & Target Portal UI):**
  * Bertanggung jawab atas `frontend/src/app/target-portal/page.tsx`, `frontend/src/app/command-center/page.tsx`, `frontend/src/lib/websocket.ts`, serta 5 komponen utama (`AttackGraph.tsx`, `TacticalMap.tsx`, `LiveTerminalSpy.tsx`, `MitreMatrix.tsx`, `ForensicTable.tsx`).
* **Orang 3 (Honeytoken Counter-Intelligence, Forensic Ledger & Military DFIR PDF):**
  * Bertanggung jawab atas `backend/honeytoken.py`, `backend/forensic_chain.py`, `backend/pdf_service.py`, skrip simulasi serangan demo, dan narasi presentasi doktrin militer PUSSIBERAD.
