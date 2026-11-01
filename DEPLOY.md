# Deploy — CAKRA-DECOY 2.0 (full-stack di Oracle server)

Auto-deploy: push ke `main` → CI jalan (test) → kalau lolos, `deploy` SSH ke server
lewat Tailscale, `git pull` + `docker compose up -d --build`. URL publik:
**https://cakra.polije.app** (Cloudflare Tunnel → host `127.0.0.1:8181`).

Arsitektur: `cloudflared → 127.0.0.1:8181 → caddy:8080 → backend:8000` (+ frontend:3000 nanti).
caddy diikat ke `127.0.0.1` jadi hanya cloudflared yang bisa akses; tidak terbuka
langsung ke internet.

---

## Setup sekali (manual — tidak bisa diotomasi)

### 1. Server (sudah: Docker terpasang)

```bash
git clone https://github.com/Zyan-Con/CAKRA-DECOY.git ~/CAKRA-DECOY
cd ~/CAKRA-DECOY/backend
cp .env.example .env
# isi GROQ_API_KEY kalau mau LLM tier-2; DEMO_EMITTER sudah di-set compose
```

Test manual:
```bash
cd ~/CAKRA-DECOY
docker compose up -d --build
curl -fsS http://127.0.0.1:8181/health   # harus {"status":"ok"...}
```

### 2. Cloudflare Tunnel (dashboard Zero Trust)

Pakai pola yang sama dgn tunnel lain di server (token + systemd):
1. Zero Trust → Networks → Tunnels → **Create tunnel** (cloudflared), nama `cakra`.
2. Install connector di server: jalankan perintah `cloudflared service install <TOKEN>`
   yang ditampilkan dashboard (bikin systemd unit sendiri).
3. Tab **Public Hostname** → Add:
   - Subdomain `cakra`, domain `polije.app`
   - Service: `HTTP` → `localhost:8181`
4. Simpan. `https://cakra.polije.app` langsung hidup.

> Tanpa login gate (juri tinggal buka). Endpoint honeytoken hanya nembak saat
> trigger demo spesifik, jadi aman untuk dinilai. Tambahkan banner "DEMO —
> data simulasi" di FE.

### 3. GitHub Secrets (Settings → Secrets and variables → Actions)

| Secret | Isi |
|---|---|
| `SERVER_HOST` | `100.93.61.70` (IP tailnet server) |
| `SSH_KEY` | private key SSH; pubkey-nya masuk `~/.ssh/authorized_keys` server |
| `TS_AUTHKEY` | Tailscale **ephemeral** auth key (Admin → Settings → Keys) |

Bikin keypair SSH khusus CI:
```bash
ssh-keygen -t ed25519 -f cakra_ci -N ""
# cakra_ci.pub -> tambahkan ke ~/.ssh/authorized_keys di server
# isi cakra_ci (private) -> GitHub secret SSH_KEY
```

### 4. Tailscale ACL

Izinkan node CI (tag `tag:ci`) SSH ke server:
```jsonc
"acls": [
  { "action": "accept", "src": ["tag:ci"], "dst": ["100.93.61.70:22"] }
]
```
Pastikan `tag:ci` terdaftar di `tagOwners`, dan ephemeral key boleh pakai tag itu.

---

## Setelah frontend teammate siap

1. FE pakai Next.js dengan `output: 'standalone'` di `next.config.js`.
2. Uncomment service `frontend` di `docker-compose.yml`.
3. Uncomment `handle { reverse_proxy frontend:3000 }` di `Caddyfile`,
   hapus blok holding page.
4. Push → auto-deploy.

## Operasional

- Logs: `docker compose logs -f backend`
- Restart: `docker compose restart`
- Disk server 77% penuh — `deploy.yml` sudah `docker image prune -f` tiap deploy.
- Rollback cepat: `git checkout <commit-lama> && docker compose up -d --build`.
