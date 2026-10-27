# Product Requirements Document (PRD): CAKRA-DECOY 2.0

## 1. Ringkasan Eksekutif (Penjelasan Sederhana)
**Apa itu CAKRA-DECOY 2.0?**
Bayangkan sebuah markas militer yang diserang penyusup. Sistem keamanan konvensional (seperti Firewall/WAF) bekerja seperti satpam yang langsung mengunci pintu dan mengusir penyusup (*Block/Drop*). Masalahnya, penyusup tingkat tinggi (*State-Sponsored APT*) akan langsung sadar dirinya terdeteksi, memutar alamat IP/VPN, mengubah taktik, dan mencari celah masuk lain tanpa kita tahu siapa pelakunya, bagaimana tekniknya, dan apa sasaran strategisnya.

**CAKRA-DECOY 2.0 bekerja sebagai Ruang Jebakan Intelijen Aktif (*Active Counter-Intelligence & Deception System*).** Saat *hacker* mencoba membobol portal logistik atau panel kendali mesin TNI AD, CAKRA-DECOY **tidak memblokirnya**, melainkan secara diam-diam (*opaque session routing*) memindahkan sesi *hacker* ke dalam **"Markas Kembaran Palsu" (*Chameleon AI Mirror-Twin*)** tanpa mengubah URL maupun membocorkan status jebakan di *Network DevTools*:
1. **Ilusi Sabotase IT/OT:** *Hacker* merasa berhasil membobol sistem logistik dan mematikan pendingin radar pangkalan hingga *overheat* ($115^\circ\text{C}$), padahal radar asli di sistem utama tetap beroperasi normal ($34^\circ\text{C}$).
2. **Penyadapan & Pemetaan Taktis Real-Time:** Seluruh ketikan perintah di terminal Linux palsu dijawab secara *stateful* oleh gabungan *In-Memory Virtual File System (VFS)* ($< 2\text{ ms}$) dan AI, sembari dipetakan otomatis ke standar **MITRE ATT&CK (Enterprise & ICS/OT)**.
3. **Operasi Bumerang (*Dual-Vector Honeytoken*):** *Hacker* dipancing mengunduh dokumen "Sangat Rahasia" (`Akses_Darurat_Satelit_TNI.html` & `kredensial_komando.env`). Saat dibuka di laptop *hacker* atau diakses via CLI (`curl`), umpan ini menembakkan *beacon callback* yang membongkar **Alamat IP Asli (menembus proxy via WebRTC STUN Leak), identitas perangkat keras (WebGL GPU/OS/Canvas), dan titik koordinat lokasi *hacker*** ke layar Komando PUSSIBERAD.
4. **Imunitas Kawanan Nasional & Bukti Hukum Berantai:** Dalam 1 klik, komandan menyebarkan "vaksin" (aturan blokir otomatis *Iptables/ModSecurity*) ke seluruh markas Kodam se-Indonesia, memverifikasi keutuhan bukti **SHA-256 Hash-Chain** (anti-manipulasi), dan mencetak laporan resmi **1-Click Military DFIR PDF**.

---

## 2. Identitas Produk
* **Nama Produk:** CAKRA-DECOY 2.0 (*Cyber Autonomous Kernel-less Routing & Active Deception System*)
* **Kategori Kompetisi:** 02. Defensive Shield (Penangkalan) — Kartika Cyber Hackathon 2026
* **Penyelenggara:** PUSSIBERAD (Pusat Siber Angkatan Darat) & CODEPOLITAN
* **Tagline:** *Zero-Latency Tactical Deception, Stateful AI Mirror-Twin & Automated Herd-Immunity for Military IT/OT Infrastructure.*
* **Pengguna Utama:** Operator SOC PUSSIBERAD, Tim Siber Kotama/Kodam, dan Pengelola Sistem Logistik/Alutsista (IT/OT) TNI AD.

---

## 3. Latar Belakang & Masalah Utama Militer (Military Pain Points)
1. **Kebutaan Taktis Akibat Pertahanan Pasif (*Passive Defense Blindness*):**
   Sistem keamanan konvensional langsung memutus koneksi (*HTTP 403 / Drop*) saat mendeteksi eksploitasi. Akibatnya, pelaku serangan siber (*APT / State-Sponsored Hacker*) sadar dirinya ketahuan, langsung mengganti infrastruktur serangan, dan satuan kehilangan intelijen berharga mengenai TTP (*Tactics, Techniques, and Procedures*) lawan.
2. **Kerentanan Konvergensi Sistem Informasi & Alutsista (IT/OT Convergence):**
   Fasilitas militer menggabungkan sistem informasi (IT) seperti portal logistik amunisi dengan sistem kendali fisik (OT/SCADA) seperti pendingin radar pertahanan udara, generator pangkalan, dan telemetri satelit. Sistem OT sangat sensitif terhadap *latency* dan tidak bisa dipasangi *agent* EDR berat.
3. **Kedaulatan Jaringan Tertutup (*Air-Gapped Sovereignty*):**
   Data operasi militer bersifat rahasia dan dilarang keluar ke *cloud* publik asing pada operasi sesungguhnya. Satuan TNI AD membutuhkan sistem pertahanan berbasis AI yang ringan (*kernel-less reverse proxy*) dan mampu berjalan 100% mandiri di dalam server internal satuan (*On-Premise / Air-Gapped* via *Ollama* + *Deterministic VFS Engine*).

---

## 4. Pemetaan Solusi Terhadap Kriteria Penilaian Juri (Total 100%)

| Kriteria Penilaian | Bobot | Bagaimana CAKRA-DECOY 2.0 Memenangkan Poin Ini Secara Mutlak |
| :--- | :--- | :--- |
| **1. Relevansi & Manfaat IT/OT TNI AD** | **25%** | Melindungi sistem administrasi logistik (IT) sekaligus panel kendali fisik pangkalan/radar (OT) dengan doktrin *Active Counter-Intelligence* (jebak secara senyap, sadap TTP-nya, dan lacak balik lokasinya). |
| **2. Inovasi Teknis** | **25%** | Menggabungkan 5 terobosan: *Opaque Silent Session Routing* ($< 5\text{ ms}$ tanpa bocor di DevTools), *Hybrid VFS + AI Mirror-Twin Shell*, *Dual-Vector Honeytoken* (HTML WebRTC/GPU + CLI Canary), *Asynchronous MITRE Profiler*, dan *Interactive SHA-256 Forensic Ledger*. |
| **3. Fungsionalitas Purwarupa** | **25%** | 100% interaktif dan *demo-resilient*. Seluruh alur dari injeksi SQLi/RCE, sabotase SCADA palsu, navigasi direktori terminal AI yang *stateful*, pelacakan lokasi *real-time*, simulasi *tamper test* bukti hukum, hingga *fallback offline* berjalan mulus tanpa *crash*. |
| **4. Kelayakan Implementasi di Satuan** | **15%** | Dikemas dalam kontainer Docker ringan sebagai *Reverse Proxy* di depan web satuan tanpa menyentuh *source code* aplikasi lama, serta mendukung mode *Air-Gapped* penuh (VFS deterministik + *Ollama* lokal). |
| **5. Kualitas Dokumentasi & Video** | **10%** | Dilengkapi fitur **1-Click Military DFIR Report (`pdf_service.py`)** yang otomatis menghasilkan dokumen Laporan Investigasi Forensik (PDF) berstandar komando militer lengkap dengan segel SHA-256. |

---

## 5. Spesifikasi Fitur Utama (Functional Requirements — Telah Diperkuat dari Audit Red Team)

### FR-01: Gerbang Pembelok Senyap Anti-Deteksi (*Opaque Silent Tactical Interceptor*)
* **Penjelasan Sederhana:** Penjaga gerbang pintar yang memeriksa setiap akses masuk. Prajurit asli masuk ke sistem asli, sedangkan *hacker* diam-diam dibelokkan ke ruang jebakan tanpa perubahan URL dan **tanpa jejak mencurigakan di Network DevTools / Burp Suite**.
* **Spesifikasi Teknis (`detector.py` & `main.py`):**
  * Memindai *payload* HTTP/API dan perintah kendali OT secara *real-time* (SQL Injection, Command Injection, Path Traversal, XSS, dan anomali parameter SCADA) dalam waktu $< 5\text{ ms}$.
  * **Zero-Leak HTTP Response:** Jika skor ancaman $\ge 70$, backend **TIDAK PERNAH** mengembalikan status bertuliskan `"DECOY"` ke browser penyerang. Baik prajurit asli maupun penyerang yang terintersepsi sama-sama menerima respons identik `HTTP 200 OK` dengan `{"status": "AUTHENTICATED", "session_token": "...", "role": "LOGISTICS_ADMIN"}`.
  * **Server-Side Deception State & Stealth Endpoints:** Status bahwa sesi tersebut berada dalam mode `DECOY_MIRROR_TWIN` disimpan 100% di memori server dan hanya disiarkan ke layar Command Center melalui WebSocket (`/ws/command-stream`). Seluruh endpoint menggunakan penamaan operasional tersamar (`/api/auth/login`, `/api/ot/control`, `/api/sys/console`, `/api/telemetry/sync`).

### FR-02: Markas Kembaran & Terminal AI Stateful (*Chameleon AI Mirror-Twin + Hybrid VFS*)
* **Penjelasan Sederhana:** Ruang tiruan yang terlihat 100% identik dengan sistem asli TNI AD, lengkap dengan panel kontrol radar palsu dan terminal Linux yang memiliki memori direktori nyata (*tidak pikun/halusinasi*).
* **Spesifikasi Teknis (`decoy.py` & `ai_shell.py`):**
  * **Halaman Admin Bayangan:** Menampilkan data logistik sintetis (jadwal pergeseran pasukan fiktif & inventaris amunisi umpan).
  * **Simulator Sabotase OT/SCADA:** Menyediakan panel **Sistem Pendingin Radar Pertahanan Udara & Generator Pangkalan**. Saat penyerang menekan tombol **"Matikan Pendingin / Override Voltase"**, layar penyerang menampilkan peringatan kritis (`SUHU RADAR 115.8°C - OVERHEAT / SISTEM LUMPUH`), sementara telemetri ke Command Center mengonfirmasi sistem asli tetap aman (`34.0°C - NOMINAL`).
  * **Two-Tier Stateful Web-SSH Console (`ai_shell.py`):**
    1. **Tier-1 Deterministic In-Memory VFS ($< 2\text{ ms}$):** Setiap `session_id` memiliki *state* direktori kerja (`cwd`), variabel lingkungan (`env`), dan pohon file virtual (`/home/ubuntu`, `/opt/satcom/Akses_Darurat_Satelit_TNI.html`, `/opt/satcom/kredensial_komando.env`, `/opt/scada/radar_cooling.conf`, `/etc/passwd`). Perintah navigasi & baca cepat (`pwd`, `cd`, `ls`, `cat`, `whoami`, `id`, `uname`, `hostname`, `clear`) dijawab instan oleh mesin VFS Python tanpa menunggu LLM, menjamin konsistensi 100% dan ketahanan penuh saat *offline*.
    2. **Tier-2 Context-Aware LLM Engine (`< 800\text{ ms}`):** Perintah eksplorasi sistem lanjutan (`ps aux`, `netstat`, `find`, `ss`, `iptables`, `crontab`) diteruskan ke LLM (Groq / Gemini 2.5 Flash / Ollama lokal `qwen2.5-coder:7b`) dengan menyuntikkan *state* `cwd` dan isi direktori VFS saat ini, dilindungi oleh **Pre-Flight Anti-Jailbreak Filter**.

### FR-03: Operasi Bumerang Ganda (*Dual-Vector Active Honeytoken & CORS-Proof Beacon*)
* **Penjelasan Sederhana:** Dua lapis umpan "Sangat Rahasia" di dalam ruang jebakan (file portal HTML dan file konfigurasi `.env`) yang otomatis membongkar identitas perangkat serta koordinat lokasi *hacker* baik saat dibuka di browser maupun saat ditembak via terminal.
* **Spesifikasi Teknis (`honeytoken.py`):**
  * **Vektor 1 — Dokumen Umpan Browser (`Akses_Darurat_Satelit_TNI.html`):**
    * Saat diunduh melalui `/api/vfs/download/Akses_Darurat_Satelit_TNI.html`, backend secara dinamis menyuntikkan `session_id` penyerang dan URL server aktif (`request.base_url`) ke dalam file HTML sehingga tetap berfungsi meskipun diuji lintas laptop pada jaringan LAN/Hotspot.
    * Saat dibuka di komputer penyerang (meskipun dari `file://` yang menghasilkan `Origin: null`), skrip internal mengekstrak **IP Asli via WebRTC STUN Leak**, **GPU Renderer (WebGL)**, **Canvas Hardware Hash**, **OS/CPU Threads**, dan **Koordinat Lokasi**, lalu menembakkan sinyal ke `/api/telemetry/sync` menggunakan *Dual-Transport* (`fetch` dengan `Content-Type: text/plain` bebas *CORS preflight* + *fallback* `Image()` pixel beacon).
  * **Vektor 2 — Umpan Kredensial CLI (`kredensial_komando.env`):**
    * Berisi kunci API satelit palsu dan *Canary Endpoint* internal (`/api/v1/satcom/keys?token=HT-SATCOM-9921`). Jika penyerang mengeksekusi `curl` atau mengakses URL tersebut, sistem langsung memicu *alert* Honeytoken ke Command Center.

### FR-04: Analisis Psikologi APT & Pemetaan MITRE ATT&CK Asynchronous
* **Penjelasan Sederhana:** Mesin intelijen latar belakang yang menganalisis setiap langkah *hacker* tanpa memperlambat terminal, lalu memetakan teknik serangan ke matriks standar militer internasional.
* **Spesifikasi Teknis (`mitre_service.py` & `MitreMatrix.tsx`):**
  * Berjalan secara *non-blocking* (`asyncio.create_task`) setiap kali ada aktivitas di interceptor, panel OT, maupun terminal Web-SSH.
  * Memetakan serangan ke kode **MITRE ATT&CK Enterprise & ICS/OT** (contoh: `T1190 - Exploit Public-Facing Application`, `T0855 - Unauthorized Command Message`, `T1059.004 - Unix Shell`, `T1552.001 - Credentials In Files`).
  * Mengirimkan *event* `MITRE_ENRICHMENT_READY` ke Command Center berisi klasifikasi aktor (*Script Kiddie*, *Organized Cybercrime*, atau *State-Sponsored APT*), tingkat keyakinan (*confidence %*), dan ringkasan psikologi/tujuan taktis penyerang.

### FR-05: Vaksin Imunitas Nasional, Bukti Hukum Berantai & Uji Integritas Live (*Herd-Immunity, SHA-256 Ledger & DFIR PDF*)
* **Penjelasan Sederhana:** Satu tombol untuk menyebarkan kekebalan otomatis ke seluruh markas Kodam di Indonesia, dilengkapi buku bukti kriptografi yang memiliki fitur simulasi anti-manipulasi (*Tamper-Test*) dan cetak laporan PDF instan.
* **Spesifikasi Teknis (`forensic_chain.py` & `pdf_service.py`):**
  * **Immutable SHA-256 Hash-Chain:** Setiap kejadian diikat dengan rumus $\text{Hash}_n = \text{SHA256}(\text{Index}_n \parallel \text{Timestamp}_n \parallel \text{SessionID}_n \parallel \text{Action}_n \parallel \text{Hash}_{n-1})$.
  * **Interactive Tamper-Test & Restore:** Menyediakan fitur demonstrasi di layar Command Center untuk mensimulasikan pengubahan 1 karakter pada log database (`/api/forensic/tamper-test`), yang seketika memicu alarm merah `TAMPERED_CRITICAL` pada blok terkait, beserta tombol pemulihan snapshot sah (`/api/forensic/restore`).
  * **Broadcast Vaksin Kodam (`/api/immunity/broadcast`):** Menghasilkan aturan *Iptables* dan *ModSecurity WAF* spesifik terhadap vektor dan IP penyerang, lalu menyebarkannya secara visual ke seluruh titik Kodam di peta Indonesia (`TacticalMap.tsx`).
  * **1-Click Military DFIR Report (`/api/forensic/export-pdf`):** Menghasilkan dokumen PDF Laporan Investigasi Insiden Siber berstandar PUSSIBERAD menggunakan `PyMuPDF` (`fitz`) lengkap dengan tabel bukti berantai SHA-256.

---

## 6. Kebutuhan Non-Fungsional & Standar Ketahanan Demo (Military & Hackathon Guardrails)
1. **Kecepatan Respons Intersepsi & VFS:** Deteksi *payload* dan pembelokan sesi wajib $< 5\text{ ms}$; perintah dasar terminal VFS wajib $< 2\text{ ms}$.
2. **Sinkronisasi State Anti-Refresh (`INITIAL_STATE_SYNC`):** Saat layar Command Center dibuka atau di-*refresh* (`F5`), WebSocket otomatis mendorong seluruh *snapshot* sesi aktif, histori terminal, matriks MITRE, status Kodam, dan rantai blok SHA-256 agar tampilan juri tidak pernah kosong.
3. **Kesiapan Operasi Tanpa Internet (*Air-Gap Ready* & *Demo Fallback*):** Mendukung pergantian mesin AI melalui `.env` (`GROQ` / `GEMINI` / `OLLAMA` lokal) dan menyediakan *Deterministic Fallback* otomatis apabila koneksi API eksternal terputus saat demonstrasi.
4. **Anti-Jailbreak Ketat pada Terminal AI:** Menerapkan *allowlist/pattern check* sintaks perintah Linux sebelum memanggil LLM; input percakapan di luar konteks terminal langsung ditolak dengan `bash: <input>: command not found` dalam $< 1\text{ ms}$.
