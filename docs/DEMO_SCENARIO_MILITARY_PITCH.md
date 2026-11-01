# Panduan Skenario Demo & Naskah Presentasi Militer (Juara 1 Mutlak)
## CAKRA-DECOY 2.0 — Kartika Cyber Hackathon 2026 (PUSSIBERAD TNI AD)

---

## 1. Setup Panggung & Layar (Split-Screen Tactical Configuration)

Untuk menghasilkan efek kejut maksimal bagi dewan juri PUSSIBERAD dalam 30 detik pertama:
* **Layar Kiri (Display Hacker / Penyerang APT):**
  * Membuka peramban di `/target-portal` (Portal Logistik & SCADA Kodam TNI AD).
  * Menampilkan terminal Kali Linux penyerang yang siap mengeksekusi *exploit* dan `curl`.
* **Layar Kanan (Display Dewan Juri / SOC PUSSIBERAD):**
  * Membuka `/command-center` (Dashboard Komando C4ISR).
  * Menampilkan *Live Attack Graph*, *Tactical Radar Map Indonesia*, *Live Terminal Spy*, *Matriks MITRE ATT&CK*, dan *SHA-256 Forensic Table*.

---

## 2. Naskah Presentasi & Urutan Aksi (Minute-by-Minute Pitch Script)

### [MENIT 00:00 - 01:00] PEMBUKAAN & PERNYATAAN DOKTRIN MILITER
**Presenter (Sikap Tegak, Suara Berwibawa & Tegas):**
> *"Siap! Yang kami hormati Komandan Pusat Siber TNI Angkatan Darat, para dewan juri perwira ahli siber, dan seluruh hadirin.*
>
> *Doktrin pertahanan siber konvensional selama ini bersifat PASIF. Saat musuh menyerang, firewall langsung memblokir. Akibatnya, pelaku serangan APT memutar IP, mengganti taktik, dan kita kehilangan jejak intelijen.*
>
> *Hari ini, kami mempersembahkan **CAKRA-DECOY 2.0**: Cyber Autonomous Kernel-less Routing & Active Deception System. Kami tidak lagi memblokir musuh di depan pintu. Kami menjebak mereka ke dalam ruang ilusi AI, menyadap ketikannya, memancing identitas aslinya keluar lewat operasi bumerang, dan menyebarkan vaksin ke seluruh markas Kodam di Indonesia dalam hitungan detik. Mari kita buktikan secara langsung!"*

---

### [MENIT 01:00 - 02:30] TAHAP 1 & 2: INFILTRASI SENYAP & SABOTASE OT
**Aksi di Layar Kiri (Laptop Hacker):**
1. Penyerang memasukkan *payload* SQL Injection pada form login: `admin' OR '1'='1 --`.
2. Klik **MASUK**. Browser langsung menampilkan Dashboard Admin TNI AD (HTTP `200 OK`, tanpa *error*, tanpa tulisan "decoy" di Network DevTools).
3. Penyerang membuka panel **"Sistem Pendingin Radar Pertahanan Udara"**, lalu menekan tombol **"OVERRIDE VOLTASE / MATIKAN PENDINGIN"**.
4. Layar penyerang berubah merah menyala: `PERINGATAN KRITIS: SUHU RADAR 115.8°C — SISTEM LUMPUH / OVERHEAT!`.

**Presenter (Menunjuk ke Layar Kanan - SOC PUSSIBERAD):**
> *"Perhatikan layar komando PUSSIBERAD di sebelah kanan!*
>
> *Dalam waktu kurang dari 5 milidetik, mesin Tactical Interceptor CAKRA mendeteksi skor ancaman 96. Penyerang TIDAK diblokir, melainkan dibelokkan secara senyap ke dalam Chameleon AI Mirror-Twin.*
>
> *Di layar kiri, penyerang merasa telah berhasil melumpuhkan radar pangkalan kita hingga suhu 115.8°C. Namun lihat telemetri riil di layar komando: **Suhu radar asli di pangkalan tetap 34.0°C dalam kondisi nominal dan 100% terlindungi.** Kita telah memenangkan waktu taktis!"*

---

### [MENIT 02:30 - 04:00] TAHAP 3 & 4: WEB-SSH, OPERASI BUMERANG & UNMASKING APT
**Aksi di Layar Kiri (Laptop Hacker):**
1. Penyerang membuka tab **Web-SSH Console**, mengetik:
   - `whoami` -> output: `ubuntu`
   - `pwd` -> output: `/opt/satcom`
   - `ls -la /opt/satcom` -> muncul file `kredensial_komando.env` dan `Akses_Darurat_Satelit_TNI.html`.
2. Penyerang mengetik: `cat /opt/satcom/kredensial_komando.env`.
   - Terbaca konfigurasi `SATCOM_VAULT_URL` dan `SATCOM_BEARER_TOKEN` berformat JWT.
3. Penyerang menguji kunci tersebut langsung dari terminal Kali Linux-nya:
   ```bash
   curl -H "Authorization: Bearer eyJhbG..." http://<IP_SERVER>:8000/api/v1/satcom/keys
   ```

**Presenter (Suara Ditinggikan, Mengarahkan Perhatian ke Radar Map):**
> *"BOOM! Umpan Bumerang telah meledak!*
>
> *Di dalam terminal penyerang, mesin In-Memory VFS CAKRA merespons dalam 1.8 milidetik tanpa jeda. Penyerang menemukan kredensial satelit palsu bertanda tangan JWT asli. Begitu penyerang mengeksekusi curl dari laptop aslinya, IP fisik asli penyerang yang berada di balik proxy Tor/VPN seketika terbongkar!*
>
> *Lihat peta radar Indonesia di layar komando: Titik koordinat GPS penyerang di Jakarta Selatan langsung terkunci, lengkap dengan GPU Hardware Fingerprint RTX 4070 dan sistem operasi Kali Linux yang dia gunakan. Musuh yang mengira dirinya anonim, kini telah teridentifikasi secara telanjang di hadapan kita!"*

---

### [MENIT 04:00 - 05:30] TAHAP 5 & 6: UJI BUKTI HUKUM SHA-256, VAKSIN & CETAK DFIR PDF
**Aksi di Layar Kanan (SOC PUSSIBERAD):**
1. Klik tombol **"Simulasi Manipulasi Bukti (Tamper-Test)"**:
   - Status rantai bukti seketika menyala merah: `TAMPERED_CRITICAL — INTEGRITAS BLOK #1 RUSAK!`.
2. Klik tombol **"Pulihkan Rantai Sah (Restore Snapshot)"**:
   - Status kembali hijau: `VALID_IMMUTABLE (SEMPURNA)`.
3. Klik tombol **"Broadcast Vaksin Kodam"**:
   - Garis pertahanan menyebar di peta Indonesia, seluruh 15 titik Kodam berubah menjadi hijau (`IMMUNE_PROTECTED`).
4. Klik tombol **"Export Laporan DFIR (PDF)"**:
   - Mengunduh file resmi `Laporan_DFIR_PUSSIBERAD_TNI_AD.pdf` dan membukanya di depan juri.

**Presenter (Menutup Presentasi dengan Gagah):**
> *"Para jenderal dan dewan juri, di era perang siber modern, bukti hukum harus sah di Mahkamah Militer. CAKRA-DECOY mengunci setiap detik pergerakan musuh dengan Rantai Kriptografi SHA-256.*
>
> *Jika ada oknum atau musuh yang mencoba mengubah satu karakter saja di database log kita, sistem otomatis mendeteksi TAMPERED. Dan hanya dengan satu klik pada tombol Broadcast Vaksin Kodam, seluruh 15 markas Kodam se-Indonesia dari Kodam Iskandar Muda hingga Kodam Cenderawasih seketika mendapatkan aturan firewall otomatis untuk menangkal pola serangan tersebut.*
>
> *Terakhir, komandan satuan tidak perlu menunggu berhari-hari untuk laporan insiden. Dalam 1 klik, Laporan Forensik Resmi berstandar militer langsung tercetak rapi siap dimeja-hijaukan.*
>
> *Inilah **CAKRA-DECOY 2.0**: Dari Pertahanan Pasif Menjadi Keunggulan Intelijen Aktif. Siap menerima pertanyaan!"*

---

## 3. Tactical Cheat-Sheet: Jawaban Telak untuk Pertanyaan Mematikan Dewan Juri

| Pertanyaan Penguji / Juri TNI AD | Jawaban Taktis & Solusi Teknis Kita |
| :--- | :--- |
| **"Bagaimana kalau hacker curiga dan tidak mau membuka file HTML, tapi cuma membaca kodenya pakai `cat`?"** | *"Izin menjawab Komandan. Kami telah merancang Operasi Bumerang Tiga Jalur. Jika penyerang curiga dan membaca source code HTML, di bagian atas kami sengaja menaruh komentar 'kelalaian developer militer' berisi URL tiket debug. Penyerang yang merasa menemukan celah bypass akan langsung menembak URL tersebut via curl, dan sinyal pelacak bumerang tetap terpicu 100%!"* |
| **"Bagaimana kalau hacker membuka file HTML dalam keadaan offline / jaringan tertutup?"** | *"Izin Komandan, jika dibuka offline, skrip di dalam file HTML secara otomatis merekam WebGL GPU hardware hash, resolusi layar, dan canvas fingerprint ke dalam browser storage lokal. Begitu perangkat tersebut kembali terhubung ke jaringan internet apa pun, transmisi beacon otomatis tertembak ke server kita."* |
| **"Kenapa tidak langsung memblokir serangan dengan WAF biasa seperti Cloudflare atau Fortinet?"** | *"Izin Jenderal. Firewall konvensional hanya memberi tahu musuh bahwa pintunya terkunci. Pelaku kelas APT akan langsung memutar proxy, mengganti malware, dan mencari pintu belakang lain tanpa kita tahu siapa mereka. Doktrin CAKRA-DECOY adalah Counter-Intelligence: kita biarkan mereka masuk ke ruangan palsu agar TTP (Tactics, Techniques, and Procedures), payload, dan identitas perangkat keras mereka berhasil kita sita."* |
| **"Apakah sistem ini berat jika dipasang di server pangkalan Kodam yang fasilitasnya terbatas?"** | *"Izin Komandan, CAKRA-DECOY dirancang Kernel-less dan berbasis In-Memory Virtual File System (VFS). Latensi intersepsi berada di bawah 2 milidetik dan konsumsi memori hanya sekitar 120 MB RAM. Sistem ini dapat berjalan di server mini intelijen lapangan tanpa membutuhkan GPU khusus untuk fungsi dasarnya."* |
| **"Bagaimana menjamin keabsahan bukti log ini di pengadilan militer jika database server diretas?"** | *"Izin Jenderal. Setiap aksi penyerang disegel menggunakan Rantai Kriptografi SHA-256 berantai di mana hash blok n bergantung pada hash blok n-1. Jika ada pihak yang memodifikasi log satu baris saja, seluruh rantai segel akan runtuh dan memicu status TAMPERED_CRITICAL, persis seperti yang baru saja kami demonstrasikan."* |
