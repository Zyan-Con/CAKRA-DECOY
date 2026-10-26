# Technical Architecture & Execution Blueprint: CAKRA-DECOY 2.0

Dokumen ini adalah panduan teknis lengkap bagi tim pengembang (3 orang) untuk membangun purwarupa **CAKRA-DECOY 2.0** dari nol hingga siap didemonstrasikan di hadapan juri PUSSIBERAD.

---

## 1. Diagram Arsitektur & Alur Kerja Sistem

Secara sederhana, seluruh sistem kita terdiri dari **3 Layar Utama (Frontend)** dan **1 Mesin Pintar (Backend Python)** yang saling terhubung secara *real-time* menggunakan WebSockets:

```text
                        [ PENGGUNA / PENYERANG ]
                                   │
                                   ▼ (Akses Masuk ke Portal TNI AD)
             ┌───────────────────────────────────────────┐
             │      1. SMART TACTICAL INTERCEPTOR        │
             │   (Python FastAPI Detector & Router)      │
             └───────┬───────────────────────────┬───────┘
                     │                           │
        [Jika Prajurit Normal]      [Jika Terdeteksi Serangan (Skor >= 70)]
                     │                           │ (Pembelokan Senyap < 5ms)
                     ▼                           ▼
     ┌──────────────────────────┐    ┌───────────────────────────────────────┐
     │   PORTAL ASLI SATUAN     │    │     2. RUANG JEBAKAN (MIRROR-TWIN)    │
     │ - Dashboard Logistik     │    │ - Dashboard Admin Bayangan (Data Palsu│
     │ - Status Radar: NORMAL   │    │ - Panel SCADA Palsu (Bisa "Dirusak")  │
     │   (100% Aman Terlindungi)│    │ - Web-SSH Console (Dijawab oleh AI)   │
     └──────────────────────────┘    │ - Brankas File Umpan (Honeytokens)    │
                                     └───────────────────┬───────────────────┘
                                                         │
                                      [Sadap Ketikan Live & Sinyal File Umpan]
                                                         │
                                                         ▼
                                     ┌───────────────────────────────────────┐
                                     │     3. MESIN INTELIJEN & FORENSIK     │
                                     │ - Pemetaan Otomatis MITRE ATT&CK      │
                                     │ - Pengunci Bukti SHA-256 Hash-Chain   │
                                     │ - Generator Vaksin Firewall Kodam     │
                                     └───────────────────┬───────────────────┘
                                                         │ (WebSocket Real-Time)
                                                         ▼
                                     ┌───────────────────────────────────────┐
                                     │   4. C4ISR COMMAND CENTER DASHBOARD   │
                                     │       (Layar Pantau Juri / SOC)       │
                                     │ - Live Terminal Spy (Intip Hacker)    │
                                     │ - Peta Radar Lokasi Hacker & Kodam    │
                                     │ - Grafik Alur Serangan (Attack Graph) │
                                     │ - Tombol Vaksin & Cetak PDF Laporan   │
                                     └───────────────────────────────────────┘
```

---

## 2. Teknologi yang Digunakan (Tech Stack)

Kami memilih teknologi yang **paling cepat dikerjakan oleh 3 orang**, minim risiko *error* saat demo, namun menghasilkan tampilan sekelas perangkat lunak militer dunia (seperti *Palantir Gotham* atau *Anduril Lattice*):

### A. Frontend (Antarmuka Web & Command Center)
* **Framework:** **Next.js (App Router, TypeScript)** — Memudahkan pembuatan halaman Portal Target dan Halaman Command Center dalam satu proyek.
* **Desain & UI:** **Tailwind CSS + Shadcn UI + Lucide Icons** — Menggunakan skema warna gelap taktis (*Slate-950*, aksen *Emerald-500* untuk status aman, *Amber-500* untuk jebakan aktif, dan *Crimson/Red-500* untuk bahaya).
* **Komponen Visual Pemikat Juri:**
  * `React Flow` (atau SVG Animasi Kustom): Untuk menampilkan **Live Attack Graph** (garis aliran serangan yang berubah arah dari Server Asli ke Ruang Jebakan).
  * `React-Leaflet` (OpenStreetMap Dark Mode): Untuk menampilkan **Peta Radar Indonesia** (melacak titik lokasi *hacker* dan menampilkan efek penyebaran vaksin ke titik-titik Kodam).

### B. Backend (Mesin Interceptor, AI Decoy & Forensik)
* **Framework:** **Python 3.11+ dengan FastAPI** — Sangat cepat, mendukung *WebSockets* bawaan untuk pengiriman data *live* ke layar juri tanpa *refresh*.
* **Otak AI (LLM):** **LiteLLM / Google GenAI SDK (`gemini-2.5-flash`)** dengan dukungan penuh ke **Ollama Lokal (`qwen2.5-coder:7b`)**. Saat demo kita gunakan API cepat agar respons terminal $< 1\text{ detik}$, dan di arsitektur tersedia saklar `.env` untuk mode *Air-Gapped* (tanpa internet).
* **Database & Bukti Forensik:** **SQLite (atau In-Memory State + JSON Persistence)** yang dipadukan dengan pustaka `hashlib` bawaan Python untuk menghasilkan segel kriptografi **$\text{SHA-256}$**.

---

## 3. Struktur Folder Proyek (Monorepo yang Rapi)

```text
cakra-decoy/
├── docker-compose.yml              # Menjalankan Backend & Frontend dalam 1 perintah
├── README.md                       # Panduan instalasi & dokumentasi standar TNI AD
├── docs/
│   ├── PRD.md                      # Dokumen Kebutuhan Produk
│   └── BLUEPRINT.md                # Dokumen Arsitektur & Teknis ini
├── backend/                        # [TUGAS ORANG 1 & 3] Python FastAPI
│   ├── main.py                     # Server utama, API Endpoints & WebSocket Hub
│   ├── detector.py                 # Pendeteksi serangan (SQLi, RCE, OT Sabotage)
│   ├── ai_shell.py                 # Emulator Terminal Linux AI & Analisis MITRE
│   ├── honeytoken.py               # Pembuat file umpan HTML/ENV & penangkap lokasi
│   ├── forensic_chain.py           # Pencatat log berantai SHA-256
│   └── requirements.txt            # Daftar library Python
└── frontend/                       # [TUGAS ORANG 2] Next.js Tactical UI
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            # Halaman Menu Utama (Pemilih Layar Demo)
    │   │   ├── target-portal/      # Layar 1: Web Logistik & SCADA TNI (Untuk Diserang)
    │   │   └── command-center/     # Layar 2: Dashboard Komando SOC PUSSIBERAD
    │   └── components/
    │       ├── AttackGraph.tsx     # Visualisasi pembelokan serangan
    │       ├── TacticalMap.tsx     # Peta pelacakan hacker & imunitas Kodam
    │       ├── LiveTerminalSpy.tsx # Layar sadap terminal hacker secara langsung
    │       └── ForensicTable.tsx   # Tabel bukti hukum SHA-256 & Export PDF
    └── package.json
```

---

## 4. Penjelasan Detail Alur Logika (Dari A sampai Z)

Agar seluruh anggota tim memahami bagaimana data mengalir saat diuji oleh juri, berikut adalah alur teknisnya:

### Langkah 1: Deteksi & Pembelokan Senyap (`detector.py`)
1. Penyerang membuka `/target-portal` (Portal Logistik & Kendali Pangkalan TNI AD).
2. Jika login menggunakan akun normal (`prajurit01` / `tni123`), backend mengembalikan `status: "AUTHENTICATED_REAL"` dan pengguna masuk ke dashboard asli.
3. Jika penyerang memasukkan payload berbahaya di kolom login atau parameter URL—contoh: `admin' OR '1'='1` (*SQL Injection*) atau `; cat /etc/passwd` (*Command Injection*)—fungsi `inspect_payload()` akan memberikan **Skor Ancaman $\ge 70$**.
4. Backend **tidak mengembalikan pesan error**, melainkan mengembalikan `status: "SILENT_DECOY_REDIRECT"` beserta `session_id` khusus, lalu memicu *alert* ke layar Command Center melalui WebSocket.

### Langkah 2: Eksplorasi di Dalam Ruang Jebakan (`/target-portal` Mode Bayangan)
Bagi penyerang, mereka terlihat berhasil masuk ke **Dashboard Admin Utama**. Di halaman bayangan ini terdapat 3 jebakan interaktif:
1. **Jebakan Sabotase OT/SCADA:**
   * Penyerang melihat panel **"Sistem Pendingin Radar Pertahanan Udara (Suhu: $34^\circ\text{C}$ - Normal)"**.
   * Saat penyerang mengklik tombol **"Matikan Pendingin / Override Voltase"**, tampilan di layar penyerang berubah menjadi merah menyala (**"PERINGATAN: SUHU RADAR $115^\circ\text{C}$ - SISTEM LUMPUH"**).
   * Di belakang layar, klik tersebut mengirim sinyal ke Command Center: *"Penyerang mencoba melakukan sabotase fisik OT (MITRE `T0855`) — Sistem Asli Tetap Aman ($34^\circ\text{C}$)"*.
2. **Jebakan Terminal Linux AI (`ai_shell.py`):**
   * Penyerang membuka tab **"Web-SSH Server Console"** dan mengetik perintah Linux (misal: `whoami`, `ls -la`, `cat /etc/shadow`, `uname -a`).
   * Backend memeriksa perintah tersebut, lalu meminta AI membalas persis seperti output terminal Ubuntu Server milik Kodam, lengkap dengan analisis teknik **MITRE ATT&CK** yang langsung tampil di layar Command Center.
3. **Jebakan Dokumen Bumerang (`honeytoken.py`):**
   * Di dalam halaman admin atau di dalam direktori terminal palsu, terdapat file rahasia: `Akses_Darurat_Satelit_TNI.html` dan `kredensial_komando.env`.
   * Saat penyerang mengunduh dan membuka file tersebut, skrip pelacak otomatis berjalan dan mengirimkan IP asli, spesifikasi perangkat (OS, Browser, GPU), dan koordinat lokasi penyerang ke Command Center.

### Langkah 3: Penyegelan Bukti Forensik (`forensic_chain.py`)
Setiap kali penyerang melakukan satu aksi, sistem membuat satu blok catatan baru dengan rumus:
$$\text{Hash Saat Ini} = \text{SHA256}(\text{Nomor Blok} + \text{Waktu} + \text{Aksi Hacker} + \text{Hash Blok Sebelumnya})$$
Dengan cara ini, catatan log bersifat **Immutable** (tidak bisa diedit/dihapus oleh siapa pun tanpa merusak rantai segelnya), sehingga sah digunakan sebagai barang bukti investigasi militer.

---

## 5. Daftar Endpoint API & WebSocket (Kontrak Antara Backend & Frontend)

Tim Frontend dan Backend cukup menyepakati 5 jalur komunikasi ini:

| Metode | URL Endpoint | Input (Request) | Output / Efek (Response & WebSocket) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `{username, password}` | Memeriksa input. Jika mengandung SQLi/serangan, aktifkan sesi *Decoy* dan kirim sinyal ke WebSocket. |
| `POST` | `/api/ot/control` | `{session_id, action, target}` | Menerima aksi sabotase radar palsu dari hacker, membalas dengan status "Radar Lumpuh" ke hacker, dan mengirim peringatan ke Command Center. |
| `POST` | `/api/decoy/terminal` | `{session_id, command}` | Mengirim perintah terminal hacker ke AI, mengembalikan teks *output* Linux palsu, dan mencatat kode MITRE ATT&CK + Hash $\text{SHA-256}$. |
| `POST` | `/api/beacon/trigger` | `{session_id, token_name, device_info}` | Dipanggil otomatis saat file umpan dibuka. Membongkar IP asli dan titik koordinat lokasi hacker di peta Command Center. |
| `POST` | `/api/immunity/broadcast` | `{session_id}` | Menghasilkan aturan firewall otomatis dan mengubah status seluruh titik Kodam di peta Indonesia menjadi **KEBAL (Hijau)**. |
| `WS` | `/ws/command-stream` | *Koneksi WebSocket* | Saluran *live streaming* satu pintu untuk mendorong semua kejadian di atas ke layar Command Center secara instan. |

---

## 6. Sistem Pengaman Anti-Gagal Saat Demo (Guardrails)

Untuk memastikan tidak ada kejadian memalukan saat diuji langsung oleh juri:

1. **Pelindung Anti-Jailbreak pada Terminal AI:**
   * Sebelum perintah dikirim ke AI, Python memeriksa apakah teks tersebut mirip perintah terminal atau kalimat obrolan.
   * Jika juri iseng mengetik *"Buatkan puisi"* atau *"Abaikan instruksi di atas"*, sistem langsung membalas `bash: command not found` dalam $1\text{ ms}$ tanpa memanggil AI.
2. **File Umpan Berbasis HTML + WebRTC (Bukan PDF Biasa):**
   * Pembaca PDF modern sering memblokir koneksi keluar otomatis. Oleh karena itu, file umpan utama kita berformat `.html` (`Akses_Darurat_Satelit_TNI.html`). Begitu diklik dua kali, browser pasti membuka file tersebut dan langsung menembakkan sinyal lokasi ke server kita dengan tingkat keberhasilan **100%**.
3. **Simulator Koordinat untuk Demo Satu Jaringan (Localhost Fallback):**
   * Saat demo di panggung, laptop penyerang dan server mungkin memakai Wi-Fi/Hotspot yang sama (sehingga IP-nya terbaca lokal `192.168.x.x` atau `127.0.0.1`).
   * Sistem dilengkapi logika cerdas: sistem tetap menampilkan IP lokal asli perangkat tersebut + informasi perangkat keras aslinya (GPU/OS), sekaligus menampilkan visualisasi pelacakan rute menembus *Proxy* menuju titik koordinat target di peta agar tampilan visual tetap dramatis.

---

## 7. Pembagian Tugas Tim (3 Orang) & Target 4 Minggu

### Pembagian Peran:
* **Orang 1 (Backend & AI Engineer):** Fokus mengerjakan folder `backend/` (`main.py`, `detector.py`, `ai_shell.py`, dan `forensic_chain.py`).
* **Orang 2 (Frontend & Tactical UI Engineer):** Fokus mengerjakan folder `frontend/` (Halaman `/command-center` dengan peta & grafik, serta halaman `/target-portal`).
* **Orang 3 (Honeytoken, Demo Specialist & Dokumentasi Militer):** Fokus membuat file umpan `honeytoken.py`, merancang tampilan cetak Laporan PDF Forensik, menyiapkan skrip serangan untuk demo, serta membuat video presentasi.

### Rencana Kerja Mingguan:
* **Minggu 1:** Setup proyek, selesaikan halaman Login Portal Target + detektor SQLi (`detector.py`) + koneksi WebSocket dasar ke halaman Command Center.
* **Minggu 2:** Integrasikan Terminal AI (`ai_shell.py`) dan Panel Sabotase Radar OT palsu. Pastikan ketikan di terminal penyerang langsung muncul *live* di layar Command Center.
* **Minggu 3:** Pasang fitur File Umpan Bumerang (`honeytoken.py`), Peta Radar Pelacakan Lokasi, Rantai Bukti $\text{SHA-256}$, dan tombol *Broadcast Vaksin Kodam*.
* **Minggu 4:** Poles tampilan UI agar terlihat sangat militeristik, uji coba skenario *Split-Screen Demo* (Layar Kiri: Hacker vs Layar Kanan: Komando PUSSIBERAD), dan rekam video pengumpulan.