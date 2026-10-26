# Product Requirements Document (PRD): CAKRA-DECOY 2.0

## 1. Ringkasan Eksekutif (Penjelasan Sederhana)
**Apa itu CAKRA-DECOY?**
Bayangkan sebuah markas militer yang diserang penyusup. Sistem keamanan biasa ( seperti Firewall/WAF) bekerja seperti satpam yang langsung mengunci pintu dan mengusir penyusup. Masalahnya, penyusup itu akan kabur, menyamar lagi, dan mencari jalan masuk lain tanpa kita tahu siapa dia dan siapa yang menyuruhnya.

**CAKRA-DECOY bekerja seperti ruang jebakan intelijen.** Saat ada *hacker* mencoba membobol sistem TNI AD, CAKRA-DECOY **tidak memblokirnya**, melainkan secara diam-diam memindahkan si *hacker* ke dalam **"Markas Kembaran Palsu" (Ruang Ilusi AI)**. Di dalam sana:
1. *Hacker* merasa berhasil membobol sistem dan mematikan radar pangkalan, padahal sistem asli TNI AD 100% aman.
2. Semua ketikan dan teknik *hacker* direkam oleh AI untuk dianalisis.
3. *Hacker* dipancing untuk mengunduh dokumen "Sangat Rahasia" palsu. Begitu dokumen itu dibuka di laptop *hacker*, dokumen tersebut otomatis mengirimkan **lokasi koordinat dan identitas asli perangkat *hacker*** ke layar Komando PUSSIBERAD.
4. Dalam 1 detik, sistem menyebarkan "vaksin" (aturan blokir otomatis) ke seluruh markas Kodam se-Indonesia agar kebal terhadap pola serangan tersebut.

---

## 2. Identitas Produk
* **Nama Produk:** CAKRA-DECOY 2.0 (*Cyber Autonomous Kernel-less Routing & Active Deception System*)
* **Kategori Kompetisi:** 02. Defensive Shield (Penangkalan) — Kartika Cyber Hackathon 2026
* **Penyelenggara:** PUSSIBERAD (Pusat Siber Angkatan Darat) & CODEPOLITAN
* **Tagline:** *Zero-Latency Tactical Deception, AI Mirror-Twin & Automated Herd-Immunity for Military IT/OT Infrastructure.*
* **Pengguna Utama:** Operator SOC PUSSIBERAD, Tim Siber Kotama/Kodam, dan Pengelola Sistem Logistik/Alutsista (IT/OT) TNI AD.

---

## 3. Latar Belakang & Masalah Utama Militer (Military Pain Points)
1. **Kebutaan Taktis Akibat Pertahanan Pasif:**
   Sistem keamanan konvensional langsung memutus koneksi (*Block/Drop*) saat mendeteksi serangan. Akibatnya, pelaku serangan siber (*APT / State-Sponsored Hacker*) sadar dirinya ketahuan, langsung mengganti alamat IP/VPN, dan kita kehilangan jejak intelijen mengenai siapa pelakunya dan apa target utamanya.
2. **Kerentanan Sistem Fisik & Alutsista (IT/OT Convergence):**
   Fasilitas militer menggabungkan sistem informasi (IT) seperti portal logistik dengan sistem kendali mesin (OT/SCADA) seperti pendingin radar, kelistrikan pangkalan, dan telemetri komunikasi. Sistem OT sangat sensitif dan tidak bisa dipasangi antivirus berat karena dapat menyebabkan kelambatan (*latency*) operasional.
3. **Wajib Berjalan di Jaringan Tertutup (*Air-Gapped Sovereignty*):**
   Data militer bersifat rahasia dan tidak boleh dikirim ke *cloud* publik asing. Satuan TNI AD membutuhkan sistem pertahanan berbasis AI yang ringan dan mampu berjalan 100% secara mandiri di dalam server internal satuan (*On-Premise*).

---

## 4. Pemetaan Solusi Terhadap Kriteria Penilaian Juri (Total 100%)

| Kriteria Penilaian | Bobot | Bagaimana CAKRA-DECOY Memenangkan Poin Ini |
| :--- | :--- | :--- |
| **1. Relevansi & Manfaat IT/OT TNI AD** | **25%** | Melindungi sistem administrasi (IT) sekaligus panel kendali fisik pangkalan/radar (OT) dengan doktrin *Active Counter-Intelligence* (jebak, sadap tekniknya, dan lacak balik lokasinya). |
| **2. Inovasi Teknis** | **25%** | Menggabungkan 4 teknologi mutakhir: *Silent Session Redirection* ($< 5\text{ ms}$), *Chameleon AI Mirror-Twin*, *WebRTC/Fingerprint Honeytoken*, dan *Cryptographic Forensic Ledger* ($\text{SHA-256}$). |
| **3. Fungsionalitas Purwarupa** | **25%** | Bukan sekadar desain tampilan (*mock-up*). Seluruh alur dari serangan masuk, pembelokan ke server palsu, interaksi terminal AI, hingga pelacakan lokasi berjalan *real-time* dan interaktif saat demo. |
| **4. Kelayakan Implementasi di Satuan** | **15%** | Dikemas menggunakan Docker yang sangat ringan, dipasang sebagai *Reverse Proxy* di depan web satuan tanpa perlu mengubah kode aplikasi lama, dan mendukung AI lokal (*Ollama*) untuk jaringan tanpa internet. |
| **5. Kualitas Dokumentasi & Video** | **10%** | Dilengkapi fitur **1-Click Military DFIR Report** yang otomatis mencetak dokumen Laporan Investigasi Forensik (PDF) berstandar komando militer. |

---

## 5. Spesifikasi Fitur Utama (Functional Requirements)

### FR-01: Gerbang Pembelok Senyap (*Silent Tactical Interceptor*)
* **Penjelasan Sederhana:** Penjaga gerbang pintar yang memeriksa setiap akses masuk. Prajurit asli dipersilakan masuk ke sistem asli, sedangkan *hacker* diam-diam dibelokkan ke ruang jebakan tanpa muncul pesan *error*.
* **Spesifikasi Teknis:**
  * Berfungsi sebagai *Reverse Proxy* yang memindai *payload* HTTP/API dan perintah kendali OT secara *real-time*.
  * Jika skor ancaman $\ge 70$ (misal: terdeteksi *SQL Injection*, *Command Injection*, *Path Traversal*, atau manipulasi ilegal pada panel SCADA), sesi pengguna otomatis dialihkan ke **Mirror Dashboard (Ruang Jebakan)** dalam waktu $< 5\text{ ms}$ tanpa mengubah URL di browser penyerang.

### FR-02: Markas Kembaran & Terminal AI (*Chameleon AI Mirror-Twin*)
* **Penjelasan Sederhana:** Ruang tiruan yang terlihat 100% mirip dengan sistem asli TNI AD, lengkap dengan panel kontrol radar palsu dan terminal Linux yang dijawab secara otomatis oleh AI.
* **Spesifikasi Teknis:**
  * Menampilkan **Halaman Admin Bayangan** berisi data logistik sintetis (jadwal pergeseran pasukan fiktif & inventaris amunisi palsu).
  * Menyediakan **Panel Simulator OT/SCADA (Sistem Pendingin Radar & Generator Pangkalan)**. Jika penyerang menekan tombol matikan pendingin, layar penyerang menampilkan animasi radar *Overheat/Rusak*, padahal radar asli di sistem utama tetap berjalan normal.
  * Menyediakan fitur **Web-SSH Diagnostic Console** (terminal Linux di dalam web). Setiap perintah yang diketik penyerang (`whoami`, `ls -la`, `cat /etc/passwd`) dijawab secara dinamis dan konsisten oleh LLM seolah-olah penyerang berada di dalam server `ubuntu@srv-kodam-logistik-01`.

### FR-03: Operasi Bumerang (*Active Honeytoken & Pelacak Balik*)
* **Penjelasan Sederhana:** Dokumen umpan "Sangat Rahasia" yang ditaruh di ruang jebakan. Saat diunduh dan dibuka oleh *hacker*, dokumen ini menjadi bumerang yang membongkar lokasi dan identitas perangkat si *hacker*.
* **Spesifikasi Teknis:**
  * Menyediakan file umpan di dalam ruang jebakan, seperti `Akses_Darurat_Satelit_TNI.html` (dokumen portal cadangan offline) dan `kredensial_komando.env` (berisi kunci API palsu).
  * Saat file `.html` dibuka di laptop penyerang, skrip pelacak tersembunyi (*WebRTC STUN Leak* + *Canvas/GPU Hardware Fingerprinting*) otomatis menembakkan sinyal balik (*callback*) ke server CAKRA-DECOY.
  * Sistem langsung mendapatkan **Alamat IP Asli** (menembus proxy aplikasi biasa), jenis Sistem Operasi, kartu grafis (GPU), resolusi layar, dan titik koordinat lokasi penyerang di peta.

### FR-04: Analisis Psikologi Hacker & Pemetaan MITRE ATT&CK
* **Penjelasan Sederhana:** AI asisten intelijen yang menonton aksi *hacker* dan langsung memberi tahu komandan: *"Hacker ini kelas berat, teknik yang dipakai adalah X, dan tujuannya mencuri data Y."*
* **Spesifikasi Teknis:**
  * Setiap perintah yang dimasukkan penyerang dianalisis secara *asynchronous* untuk dipetakan ke kode standar internasional **MITRE ATT&CK** (contoh: `T1059 - Command Execution`, `T1003 - Credential Dumping`, `T0855 - Unauthorized Command Message`).
  * Menampilkan estimasi tingkat keahlian penyerang (*Script Kiddie*, *Organized Cybercrime*, atau *State-Sponsored APT*) beserta analisis tujuan serangannya.

### FR-05: Vaksin Imunitas Nasional & Bukti Hukum Berantai (*Herd-Immunity & Forensic Ledger*)
* **Penjelasan Sederhana:** Satu tombol untuk menyebarkan kekebalan ke seluruh markas TNI AD di Indonesia, ditambah buku catatan bukti kejahatan yang dikunci dengan segel kriptografi agar tidak bisa dipalsukan di pengadilan militer.
* **Spesifikasi Teknis:**
  * Setiap log tindakan penyerang disimpan dan diikat dengan rantai kriptografi **$\text{SHA-256}$ Hash-Chain** (seperti *blockchain* ringan). Jika ada 1 huruf saja diubah di database, status validitas bukti akan berubah menjadi *TAMPERED/RUSAK*.
  * Tombol **"Broadcast Vaksin Kodam"** otomatis menghasilkan aturan blokir (*WAF Rule / Iptables script*) berdasarkan pola serangan yang baru saja terjadi dan menyebarkannya ke seluruh titik satuan di peta Indonesia.
  * Tombol **"Export Laporan DFIR (PDF)"** otomatis mengunduh dokumen laporan insiden resmi siap cetak untuk komandan satuan.

---

## 6. Kebutuhan Non-Fungsional (Standar Militer)
1. **Kecepatan Respons:** Proses deteksi dan pembelokan sesi ke ruang jebakan wajib berlangsung di bawah $10\text{ ms}$ agar penyerang tidak curiga.
2. **Dukungan Operasi Tanpa Internet (*Air-Gap Ready*):** Sistem AI dapat dijalankan menggunakan model lokal (via *Ollama* seperti `qwen2.5-coder` atau `llama3`) maupun *Cloud API* cepat (seperti *Gemini 2.5 Flash*) untuk keperluan demonstrasi.
3. **Anti-Jailbreak pada AI:** Terminal AI dilengkapi filter ketat agar penyerang tidak bisa mengajak AI mengobrol di luar konteks terminal Linux.