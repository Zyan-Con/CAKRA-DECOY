# TO-FIX — CAKRA-DECOY 2.0

Catatan perbaikan untuk PRD, BLUEPRINT, dan isi repo.
Urut dari yang paling penting. Centang kalau sudah beres.

Konteks: sekarang 31 Okt 2026, deadline submit 15 Nov 2026 (sisa ~15 hari).
Status repo: semua file kode masih 0 byte, baru dokumen. Belum mulai ngoding.

---

## P0 — Wajib, kerjakan duluan

- [ ] **Potong scope jadi 3 tingkat.** Jangan kejar semua fitur sekaligus.
  - Inti (harus jalan buat video): interceptor, terminal palsu versi VFS saja, panel SCADA palsu, 1 jebakan file (`.env` JWT, paling gampang), Command Center minimal (layar sadap terminal + feed event).
  - Menengah: terminal pakai LLM + fallback, pemetaan MITRE (cukup tabel, tanpa AI), ledger SHA-256 + tombol tamper-test.
  - Terakhir (kalau sempat): jebakan file HTML, peta 15 Kodam, tombol broadcast vaksin, PDF DFIR, profil "psikologi APT".

- [ ] **Bikin `.gitignore` SEKARANG, sebelum ada yang isi API key.** Repo publik, belum ada `.gitignore`, dan `backend/.env` sudah ikut masuk git (sekarang masih kosong).
  Isi minimal: `.env`, `node_modules/`, `__pycache__/`, `*.pyc`, `.next/`, `venv/`.
  Kalau sempat ada API key ke-commit dan ke-push, anggap key itu bocor — langsung ganti/rotate.

- [ ] **Freeze kontrak API/WebSocket di hari 1.** Baru mulai ngoding setelah itu. Backend bikin stub yang kirim event dummy dulu, biar orang frontend bisa jalan tanpa nunggu backend jadi.

- [ ] **Perbaiki versi di `backend/requirements.txt`.** Semua ketinggalan jauh. Yang paling bahaya: `groq==0.4.2` — versi sekarang 1.7.0, API-nya beda total, kode contoh dari AI bakal pakai gaya 1.x dan error di versi lama.

  | Paket | Di repo | Terbaru | Catatan |
  |---|---|---|---|
  | fastapi | 0.110.0 | 0.162.0 | |
  | uvicorn | 0.28.0 | 0.54.0 | |
  | groq | 0.4.2 | 1.7.0 | beda API besar, wajib naik |
  | httpx | 0.27.0 | 0.28.1 | |
  | python-dotenv | 1.0.1 | 1.2.4 | |
  | pymupdf | 1.23.26 | 2.0 | naik versi mayor, cek API `fitz` |
  | pydantic | 2.6.4 | 2.14.2 | |
  | websockets | 12.0 | 17.4 | |

  Pilih: samakan ke versi terbaru dan pakai Python 3.11+ (pymupdf 2.0 & websockets 17 butuh 3.11).

- [ ] **Lengkapi dependency yang hilang.** `.env.example` sebut mode `gemini` dan `ollama`, tapi `requirements.txt` cuma ada `groq`. Tambah `google-genai` kalau mau pakai Gemini. Ollama bisa lewat `httpx` biasa (tak wajib library).

---

## P1 — Perbaikan teknis di BLUEPRINT

- [ ] **Sederhanakan skema WebSocket.** Sekarang tiap event bawa satu objek raksasa berisi semua field — gampang bikin frontend & backend tidak cocok. Ganti jadi `{schema_version, event_type, timestamp, session_id, payload}`, di mana `payload` beda isi per `event_type`. Snapshot penuh cukup dikirim sekali pas `INITIAL_STATE_SYNC`.

- [ ] **Tulis tipe data sekali saja.** Bikin model Pydantic di backend, lalu generate tipe TypeScript dari situ. Jangan tulis tipe dua kali (backend dan frontend), pasti miss.

- [ ] **Simpan state ke file, jangan cuma di memori.** Ledger dan sesi sekarang hilang kalau backend restart. Fatal kalau kejadian pas demo. Pakai SQLite atau file JSON.

- [ ] **Tentukan perilaku kalau salah tangkap (false positive).** User sah yang kebetulan ngetik karakter aneh bisa ikut kebelok ke jebakan. Siapkan minimal catatan/log yang bisa direview di Command Center.

- [ ] **Isi `docker-compose.yml`** (sekarang kosong). Ini bukti poin "kelayakan implementasi" (bobot 15%), juri suka yang tinggal `docker compose up`.

---

## P2 — Turunkan klaim berlebihan (juri praktisi siber bakal menguji)

- [ ] **Perbaiki klaim akurasi lokasi.** Lokasi penyerang dari alamat IP itu cuma akurat tingkat kota (radius puluhan km), bukan presisi. Contoh `accuracy_radius_m: 150` di BLUEPRINT tidak realistis — ganti ke level kota dan sebutkan sumber datanya.

- [ ] **Ganti kata "mutlak/100%/zero".** "Tanpa jejak sama sekali", "100% konsisten", "menang mutlak" gampang dipatahkan. Pakai "dirancang untuk meminimalkan indikator". Hapus frasa "memenangkan poin secara mutlak" dari PRD.

- [ ] **Klaim "<5 ms" boleh, asal diukur.** Tampilkan angka latency asli di dashboard sebagai bukti, jangan cuma ditulis di dokumen.

- [ ] **Akui batas detektor.** Deteksi berbasis pola/regex gampang dilewati. Sebut sendiri sebagai keterbatasan yang diketahui sebelum juri yang nemu.

- [ ] **Jujur soal simulasi.** Portal "asli", broadcast ke 15 Kodam, dan sabotase radar semuanya simulasi (tidak jalankan perintah sistem beneran). Katakan terang-terangan di presentasi, jangan sampai terkesan mengaku sistem produksi.

---

## P3 — Kebersihan repo & pitch

- [ ] **Samakan nama.** Struktur folder di BLUEPRINT ditulis `ChakraDecoy/`, nama repo `CAKRA-DECOY`. Pilih satu.

- [ ] **Bersihkan `.vscode/settings.json`.** Isinya setting ekstensi "animeCompanion"/openrouter yang tidak ada hubungan dengan proyek. Hapus.

- [ ] **Selaraskan master prompts.** `ai_agent_developer_master_prompts.md` masih menanam klaim berlebihan yang sama ("Juara 1 Mutlak", "stealth guarantee"). Rapikan setelah poin P2 beres biar AI tidak ikut menulis klaim itu.

- [ ] **Siapkan 1 slide dasar hukum & aturan main (ROE)** untuk pengumpulan data penyerang. Juri dari militer kemungkinan besar nanya ini.

- [ ] **Siapkan semua berkas submit.** Situs menyebut: link project, video, slide — plus di bagian lain proposal & dokumentasi teknis. Siapkan kelimanya.

---

## Jadwal kasar

- Hari 1–2: freeze kontrak, backend stub kirim event dummy.
- Hari 3–9: kerjakan Inti, lanjut Menengah.
- Hari 10–11: integrasi end-to-end + latihan skrip demo.
- Hari 12–13: rekam video, susun slide & dokumentasi.
- Hari 14–15: cadangan. Jangan tambah fitur di 2 hari ini.
