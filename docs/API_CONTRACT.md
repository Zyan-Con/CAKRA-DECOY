# API & WebSocket Contract — CAKRA-DECOY 2.0

Dokumen untuk **frontend**. Ini sumber kebenaran soal bentuk data dari backend.
Kalau ada field yang berubah, `schema_version` naik dan dokumen ini diupdate.
Sumber tipe asli: `backend/schemas.py` (model Pydantic). `schema_version` sekarang: **2.0**.

> Prinsip: tiap pesan WS = **envelope seragam** + `payload` yang beda isi per `event_type`.
> Jadi frontend cukup `switch (event_type)` lalu baca `payload`.

---

## 1. Cara jalanin backend lokal

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env                            # lalu isi GROQ_API_KEY kalau perlu
uvicorn main:app --reload --port 8000
```

- REST base URL: `http://localhost:8000`
- WebSocket URL: `ws://localhost:8000/ws/command-stream`
- Health check: `GET http://localhost:8000/health` → `{"status":"ok"}`
- CORS: semua origin diizinkan (mode demo), jadi FE di port lain (`3000`) bisa langsung konek.

**Demo mode:** set `DEMO_EMITTER=1` di `.env`. Backend akan memancarkan sekuens
serangan palsu berulang tiap ~2 detik begitu FE connect. Jadi FE bisa dibangun
penuh **tanpa** nunggu logic backend asli jadi. Matikan dengan `DEMO_EMITTER=0`.

---

## 2. Envelope WebSocket (semua pesan ikut bentuk ini)

```jsonc
{
  "schema_version": "2.0",
  "event_id": "evt-8f92a1c4-...",   // unik per event
  "event_type": "HONEYTOKEN_TRIGGERED",
  "timestamp": "2026-11-01T14:55:12.418+07:00",
  "session_id": "ses-kdm03-9941a",  // bisa null (mis. snapshot awal)
  "seq": 42,                         // nomor urut global, naik terus
  "payload": { /* beda isi per event_type, lihat bagian 3 */ }
}
```

Alur koneksi:
1. FE buka WS ke `/ws/command-stream`.
2. Backend **langsung** kirim 1 pesan `INITIAL_STATE_SYNC` (isi snapshot penuh).
3. Setelah itu event real-time mengalir satu per satu.
4. Kalau FE refresh (F5) / reconnect, ulang dari langkah 2 — jadi layar tidak pernah kosong.

`seq` dipakai FE untuk urutan & deteksi event kelewat. Pesan dari FE ke backend
saat ini **diabaikan** (koneksi 1 arah; receive cuma jaga socket hidup).

---

## 3. Daftar `event_type` + bentuk `payload`

### `INITIAL_STATE_SYNC`
Snapshot penuh saat connect. `session_id` = null.
```jsonc
{
  "sessions": [ /* SessionState — sesi penyerang aktif, node AttackGraph */ ],
  "terminal_history": [],         // array payload TERMINAL_COMMAND_EXECUTED
  "mitre_techniques": [],         // array payload MITRE_ENRICHMENT_READY
  "kodam_nodes": [ /* KodamNode */ ],
  "forensic_ledger": [ /* ForensicBlock */ ]
}
```

> **Cabang prajurit asli:** input bersih → diarahkan ke portal asli, **tidak** disadap
> dan **tidak** muncul di Command Center. Jadi `sessions` hanya berisi sesi yang
> dibelokkan ke decoy. FE jangan nunggu event untuk login sah.

### `INTERCEPTION_ALERT`
Penyerang kedeteksi & dibelokkan ke decoy.
```jsonc
{
  "threat_score": 96,
  "entry_vector": "SQL_INJECTION_AUTH_BYPASS",
  "routing_mode": "DECOY_MIRROR_TWIN",     // atau "REAL_SYSTEM"
  "interception_latency_ms": 2.4,
  "attacker_profile": { /* AttackerProfile, bisa null */ }
}
```

### `OT_SABOTAGE_ATTEMPT`
Penyerang pencet tombol sabotase SCADA. Suhu asli vs ilusi.
```jsonc
{
  "target_system": "RADAR_COOLING",
  "action": "OVERRIDE_VOLTAGE",
  "real_radar_temp_c": 34.0,
  "decoy_radar_temp_c": 115.8,
  "real_cooling_status": "NOMINAL",
  "decoy_cooling_status": "CRITICAL_OVERHEAT_ILLUSION"
}
```

### `TERMINAL_COMMAND_EXECUTED`
Tiap perintah yang diketik penyerang di terminal palsu (buat `LiveTerminalSpy`).
```jsonc
{
  "command_id": "cmd-001",
  "cwd": "/opt/satcom",
  "prompt": "ubuntu@srv-kodam-logistik-01:/opt/satcom$",
  "raw_input": "ls -la",
  "simulated_output": "Akses_Darurat_Satelit_TNI.html\nkredensial_komando.env",
  "execution_source": "VFS_DETERMINISTIC_ENGINE",  // atau LLM_CONTEXT_SHELL / STATIC_FALLBACK
  "response_time_ms": 1.4
}
```

### `MITRE_ENRICHMENT_READY`
Hasil pemetaan MITRE (async, buat `MitreMatrix`).
```jsonc
{
  "tactic_id": "TA0006",
  "tactic_name": "Credential Access",
  "technique_id": "T1552.001",
  "technique_name": "Unsecured Credentials: Credentials In Files",
  "severity": "CRITICAL",
  "cumulative_techniques": ["T1190", "T0855", "T1059.004", "T1552.001"],
  "attacker_profile": { /* AttackerProfile, bisa null */ }
}
```

### `HONEYTOKEN_TRIGGERED`
File umpan dibuka / canary ditembak (buat `TacticalMap`).
```jsonc
{
  "vector_type": "CLI_CANARY_API_TRIGGER",   // HTML_WEBRTC_BEACON | SOURCE_COMMENT_BAIT
  "token_id": "ht-env-01",
  "token_filename": "kredensial_komando.env",
  "apparent_proxy_ip": "185.220.101.44",
  "real_leaked_ip": "103.147.12.89",
  "local_lan_ip": "192.168.1.45",            // bisa null
  "geo_location": { /* GeoLocation */ },
  "device_fingerprint": { /* DeviceFingerprint, bisa null */ }
}
```

### `IMMUNITY_BROADCASTED`
Tombol vaksin Kodam ditekan (buat `TacticalMap` + status node).
```jsonc
{
  "broadcast_active": true,
  "generated_rule": { /* GeneratedRule */ },
  "kodam_nodes_status": [ /* KodamNode, status jadi IMMUNE_PROTECTED */ ]
}
```

### `FORENSIC_INTEGRITY_ALERT`
Hasil tamper-test / restore ledger (buat `ForensicTable`).
```jsonc
{
  "block_index": 4,
  "chain_integrity": "VALID_IMMUTABLE",       // atau "TAMPERED_CRITICAL"
  "tampered_block_index": null,
  "action_summary": "HONEYTOKEN_CALLBACK tercatat ke ledger."
}
```

---

## 4. Sub-objek & nilai enum (penting buat warna/label UI)

**SessionState** — satu sesi penyerang (node AttackGraph / baris daftar sesi).
```jsonc
{ "session_id": "ses-kdm03-9941a", "routing_mode": "DECOY_MIRROR_TWIN",
  "threat_score": 96, "entry_vector": "SQL_INJECTION_AUTH_BYPASS",
  "cwd": "/opt/satcom", "status": "ACTIVE",          // ACTIVE | DISCONNECTED
  "started_at": "2026-11-01T14:55:00.000+07:00",
  "apparent_ip": "185.220.101.44", "real_leaked_ip": null,  // real_leaked_ip terisi setelah honeytoken kena
  "attacker_profile": { /* AttackerProfile, bisa null */ } }
```
**AttackerProfile**
```jsonc
{ "actor_classification": "STATE_SPONSORED_APT", "confidence_pct": 92,
  "primary_intent": "OT_RADAR_SABOTAGE", "psychological_summary": "..." }
```
**GeoLocation** — `accuracy_radius_m` tingkat kota (puluhan km), bukan GPS.
```jsonc
{ "lat": -6.21, "lng": 106.84, "city": "Jakarta", "country": "ID", "accuracy_radius_m": 25000 }
```
**DeviceFingerprint**
```jsonc
{ "os": "Linux x86_64", "browser": "Chrome/131.0.0.0",
  "gpu_renderer": "ANGLE (NVIDIA RTX 4070)", "screen_resolution": "1920x1080",
  "webrtc_stun_leak": true, "canvas_hash": "e4b89100a2c7f91d" }
```
**KodamNode**
```jsonc
{ "kodam_id": "KODAM-JAYA", "name": "Kodam Jaya/Jayakarta",
  "lat": -6.225, "lng": 106.87, "status": "STANDBY" }
```
**ForensicBlock**
```jsonc
{ "block_index": 4, "timestamp": "...", "action_summary": "...",
  "previous_hash": "9f86d0...", "current_hash": "3c7b9f...", "chain_integrity": "VALID_IMMUTABLE" }
```
**GeneratedRule**
```jsonc
{ "rule_id": "CAKRA-VAC-2026-004", "iptables_cmd": "iptables -A INPUT -s ...",
  "modsec_rule": "SecRule ARGS ..." }
```

Nilai enum (string pasti):

| Enum | Nilai | Saran warna UI |
|---|---|---|
| `routing_mode` | `REAL_SYSTEM` / `DECOY_MIRROR_TWIN` | emerald / amber |
| `actor_classification` | `SCRIPT_KIDDIE` / `ORGANIZED_CYBERCRIME` / `STATE_SPONSORED_APT` | — |
| `execution_source` | `VFS_DETERMINISTIC_ENGINE` / `LLM_CONTEXT_SHELL` / `STATIC_FALLBACK` | — |
| `severity` | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` | — → red |
| `chain_integrity` | `VALID_IMMUTABLE` / `TAMPERED_CRITICAL` | emerald / rose |
| `kodam status` | `STANDBY` / `UNDER_DECEPTION` / `IMMUNE_PROTECTED` | slate / amber / emerald |
| `vector_type` | `HTML_WEBRTC_BEACON` / `CLI_CANARY_API_TRIGGER` / `SOURCE_COMMENT_BAIT` | — |

---

## 5. REST endpoint (dipakai Target Portal & tombol aksi)

Semua ini **memicu** event WS di atas sebagai efek samping. Status/body final masih bisa berubah.

| Method | Path | Request | Efek |
|---|---|---|---|
| `GET` | `/health` | — | cek server hidup |
| `POST` | `/api/auth/login` | `{username, password}` | login; selalu balas `200` `{status:"AUTHENTICATED", session_token}` → memicu `INTERCEPTION_ALERT` kalau payload serangan |
| `GET` | `/api/portal/state` | `?session_token=` | data dashboard logistik + status SCADA |
| `POST` | `/api/ot/control` | `{session_token, action, target_system}` | aksi sabotase → `OT_SABOTAGE_ATTEMPT` |
| `POST` | `/api/sys/console` | `{session_token, command}` | eksekusi perintah terminal → `TERMINAL_COMMAND_EXECUTED` (+ async `MITRE_ENRICHMENT_READY`) |
| `GET` | `/api/vfs/download/{filename}` | `?session_token=` | unduh file umpan |
| `POST` | `/api/immunity/broadcast` | `{session_token}` | vaksin Kodam → `IMMUNITY_BROADCASTED` |
| `POST` | `/api/forensic/tamper-test` | `{block_index}` | → `FORENSIC_INTEGRITY_ALERT` (`TAMPERED_CRITICAL`) |
| `POST` | `/api/forensic/restore` | `{}` | → `FORENSIC_INTEGRITY_ALERT` (`VALID_IMMUTABLE`) |
| `GET` | `/api/forensic/export-pdf` | `?session_token=` | unduh PDF DFIR (`application/pdf`) |

> Catatan: endpoint REST di tabel ini **belum** diimplementasi di scaffold (baru `/health`
> + WebSocket + demo emitter). FE bisa mulai dari stream WS demo dulu; endpoint REST
> menyusul. Begitu ada yang jadi, status "belum/ sudah" diupdate di sini.
