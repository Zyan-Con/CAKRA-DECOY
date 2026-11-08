"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/lib/icon";
import {
  api,
  ApiError,
  type ConsoleResponse,
  type LoginResponse,
  type OtControlResponse,
  type PortalState,
} from "@/lib/api";
import type { ExecutionSource, TerminalCommandExecuted } from "@/lib/types";

const QUICK_CMDS = [
  "whoami",
  "ls -la /opt/satcom",
  "cat /opt/satcom/kredensial_komando.env",
  "cat /etc/passwd",
  "uname -a",
];

export default function TargetPortalPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<LoginResponse | null>(null);
  const [portal, setPortal] = useState<PortalState | null>(null);
  const [ot, setOt] = useState<OtControlResponse | null>(null);
  const [history, setHistory] = useState<TerminalCommandExecuted[]>([]);
  const [command, setCommand] = useState("");
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);

  const doLogin = async (u: string, p: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.login(u, p);
      setAuth(res);
      setPortal(await api.portalState(res.session_token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Koneksi ke gateway logistik gagal. Pastikan server operasional.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = (e?: FormEvent) => {
    if (e) e.preventDefault();
    void doLogin(username, password);
  };
  const fillAndLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    void doLogin(u, p);
  };

  const handleOT = async () => {
    if (!auth) return;
    try {
      setOt(await api.otControl(auth.session_token, "OVERRIDE_VOLTAGE", "RADAR_COOLING"));
    } catch {
      /* stream akan koreksi */
    }
  };

  const handleCommand = async (raw: string) => {
    if (!auth) return;
    const cmd = raw.trim();
    if (!cmd) return;
    setBusy(true);
    try {
      const res: ConsoleResponse = await api.sysConsole(auth.session_token, cmd);
      setHistory((prev) => [
        ...prev,
        {
          command_id: res.command_id || `cmd-${Date.now()}`,
          cwd: res.cwd,
          prompt: res.prompt,
          raw_input: cmd,
          simulated_output: res.output,
          execution_source: (res.execution_source as ExecutionSource) || "VFS_DETERMINISTIC_ENGINE",
          response_time_ms: 0,
        },
      ]);
    } catch {
      /* abaikan */
    } finally {
      setBusy(false);
    }
  };

  const triggerTelemetry = async () => {
    if (!auth) return;
    setTriggerStatus("Mengirim...");
    try {
      const beacon = {
        session_id: auth.session_token,
        webrtc_ip: "103.147.12.89",
        gpu: "ANGLE (NVIDIA GeForce RTX 4070 Laptop GPU, OpenGL 4.5)",
        canvas_hash: "e4b89100a2c7f91d",
        os: "Mozilla/5.0 (X11; Linux x86_64) Chrome/131.0.0.0",
        screen: "1920x1080",
      };
      const b64 = btoa(JSON.stringify(beacon));
      const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const res = await fetch(`${base}/api/telemetry/sync?b=${encodeURIComponent(b64)}`);
      setTriggerStatus(res.ok ? "Telemetri terkirim ke C4ISR" : "Gagal");
      if (res.ok) setTimeout(() => setTriggerStatus(null), 3200);
    } catch {
      setTriggerStatus("Gagal koneksi");
    }
  };

  const radarTemp = ot?.radar_cooling_temp_c ?? portal?.scada?.radar_cooling_temp_c ?? 34.0;
  const radarStatus = ot?.cooling_status ?? portal?.scada?.cooling_status ?? "NOMINAL";
  const overheat = radarTemp > 60;

  return (
    <main className="min-h-screen">
      {/* Bar presenter (scaffolding demo, bukan bagian portal operasional) */}
      <div className="border-b border-warn/25 bg-warn-weak">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 py-2 text-[11px] text-warn">
          <Icon name="flag-banner" className="h-3.5 w-3.5" />
          <span className="font-mono tracking-milli">PANEL DEMO PRESENTER</span>
          <span className="text-ink-mute">· bukan bagian portal operasional</span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => fillAndLogin("kopda_budi", "RahasiaKuat123")}
              className="rounded-md border border-border bg-white px-2 py-1 text-[11px] font-medium text-accent-deep transition-colors hover:border-accent"
            >
              Login prajurit sah
            </button>
            <button
              onClick={() => fillAndLogin("admin' OR '1'='1 --", "bypass")}
              className="rounded-md border border-border bg-white px-2 py-1 text-[11px] font-medium text-danger transition-colors hover:border-danger/50"
            >
              Login payload SQLi
            </button>
            {auth && (
              <button
                onClick={triggerTelemetry}
                className="rounded-md border border-border bg-white px-2 py-1 text-[11px] font-medium text-warn transition-colors hover:border-warn/50"
              >
                Picu telemetri → C4ISR
              </button>
            )}
          </div>
        </div>
        {triggerStatus && <div className="mx-auto max-w-5xl px-5 pb-1.5 font-mono text-[10px] text-warn">{triggerStatus}</div>}
      </div>

      {/* Header portal (tampak sistem produksi) */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
              <Icon name="shield-check" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-sm font-semibold text-ink">Portal Logistik &amp; Kendali SCADA Kodam</h1>
              <p className="font-mono text-[10px] tracking-milli text-ink-mute">
                KOMANDO DAERAH MILITER · SISTEM PERTAHANAN LOGISTIK TERPADU
              </p>
            </div>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-accent-line bg-accent-weak px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-accent-deep">
            <span className="dot dot-live" /> Level 4 · Rahasia
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6">
        {!auth ? (
          <div className="mx-auto max-w-md">
            <div className="card card-raised p-7">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                <Icon name="lock-key" className="h-5 w-5 text-accent" />
                Otorisasi Operator Militer
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                Sistem resmi PUSSIBERAD / DISINFOLAHTAD TNI AD. Akses terbatas personel bersertifikasi. Seluruh
                aktivitas diaudit kriptografis.
              </p>

              <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-ink-mute">ID Personel / NRP</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mis. kopda_budi"
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-[13px] text-ink outline-none transition-colors focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-ink-mute">Kata Sandi Operasional</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-[13px] text-ink outline-none transition-colors focus:border-accent"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-deep disabled:opacity-50"
                >
                  <Icon name={busy ? "spinner-gap" : "lock-key-open"} className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
                  {busy ? "Memverifikasi" : "Autentikasi akses"}
                </button>
              </form>
              {error && <p className="mt-3 text-[12px] text-danger">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px]">
              <span className="flex items-center gap-2">
                <span className="dot dot-live" />
                <span className="text-ink-mute">Sesi:</span>
                <span className="font-semibold text-ink">{auth.operator_role}</span>
              </span>
              <span className="flex items-center gap-4 font-mono text-[11px] text-ink-mute">
                <span>
                  CLEARANCE <span className="text-accent-deep">{auth.clearance_level}</span>
                </span>
                <span className="truncate">TOKEN {auth.session_token}</span>
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* SCADA */}
              <section className="card p-5">
                <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <Icon name="thermometer-simple" className="h-4 w-4 text-warn" />
                  Kendali SCADA Radar
                </h2>
                <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">Sensor pendingin generator radar</p>
                  <p className={`mt-2 font-mono text-3xl font-bold ${overheat ? "text-danger" : "text-accent"}`}>{radarTemp.toFixed(1)}°C</p>
                  <p className="mt-1 text-[11px] text-ink-mute">
                    Status PLC: <span className="font-semibold text-ink">{radarStatus}</span>
                  </p>
                </div>
                {ot && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-weak p-3">
                    <Icon name="warning-octagon" className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                    <p className="text-[11px] leading-relaxed text-danger">
                      Alarm kritis: overheat. Tegangan PLC melampaui toleransi, otomasi pendingin gagal.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleOT}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger-weak px-3 py-2.5 text-[12px] font-medium text-danger transition-colors hover:border-danger/50"
                >
                  <Icon name="lightning" className="h-4 w-4" />
                  Override tegangan / nonaktifkan pendingin
                </button>
              </section>

              {/* Logistik */}
              <section className="card p-5">
                <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <Icon name="truck" className="h-4 w-4 text-accent" />
                  Inventaris Logistik
                </h2>
                <div className="mt-3 space-y-2">
                  {(portal?.logistics ?? []).length === 0 && (
                    <p className="rounded-lg border border-dashed border-border bg-surface-2 px-3 py-3 text-[12px] text-ink-mute">
                      Tidak ada data inventaris untuk clearance sesi ini.
                    </p>
                  )}
                  {(portal?.logistics ?? []).map((row) => (
                    <div key={`${row.depot}-${row.item}`} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px]">
                      <span className="text-ink-soft">{row.item}</span>
                      <span className="font-mono text-[11px] text-ink-mute">
                        {row.depot} · <span className="font-semibold text-accent-deep">{row.stock}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Berkas SATCOM (tampak legit, tanpa label jebakan) */}
              <section className="card p-5">
                <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <Icon name="file-lock" className="h-4 w-4 text-info" />
                  Berkas Darurat SATCOM
                </h2>
                <p className="mt-1 text-[12px] text-ink-mute">Dokumen pemulihan &amp; konfigurasi kanal satelit (klasifikasi rahasia).</p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-border bg-surface-2 p-3">
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
                      <Icon name="file-text" className="h-4 w-4 text-warn" />
                      Akses_Darurat_Satelit_TNI.html
                    </div>
                    <p className="mt-1 text-[11px] text-ink-mute">Konsol diagnostik darurat Garuda-2 (offline bundle).</p>
                    <a
                      href={api.honeytokenDownloadUrl("Akses_Darurat_Satelit_TNI.html", auth.session_token)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-info/30 bg-info-weak px-2 py-1.5 text-[11px] font-medium text-info transition-colors hover:border-info/50"
                    >
                      <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
                      Buka berkas
                    </a>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-2 p-3">
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
                      <Icon name="key" className="h-4 w-4 text-accent" />
                      kredensial_komando.env
                    </div>
                    <p className="mt-1 text-[11px] text-ink-mute">Konfigurasi gateway relay SATCOM (bearer token).</p>
                    <a
                      href={api.honeytokenDownloadUrl("kredensial_komando.env", auth.session_token)}
                      download="kredensial_komando.env"
                      className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-accent-line bg-accent-weak px-2 py-1.5 text-[11px] font-medium text-accent-deep transition-colors hover:border-accent"
                    >
                      <Icon name="download-simple" className="h-3.5 w-3.5" />
                      Unduh konfigurasi
                    </a>
                  </div>
                </div>
              </section>

              {/* Web-SSH */}
              <section className="card overflow-hidden p-0 lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
                  <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <Icon name="terminal-window" className="h-4 w-4 text-accent" />
                    Konsol Web-SSH Operasional
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_CMDS.map((cmd) => (
                      <button
                        key={cmd}
                        onClick={() => handleCommand(cmd)}
                        disabled={busy}
                        className="rounded-md border border-border bg-white px-2 py-0.5 font-mono text-[10px] text-ink-soft transition-colors hover:border-accent hover:text-accent-deep disabled:opacity-50"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto bg-white p-3">
                  {history.length === 0 && (
                    <div className="font-mono text-[11px] text-ink-mute">Sesi SSH aktif. Ketik perintah atau pilih pintasan di atas.</div>
                  )}
                  {history.map((h) => (
                    <div key={h.command_id} className="rounded-lg border border-border bg-surface-2 p-3 font-mono text-[11px]">
                      <div className="text-accent">{h.prompt}</div>
                      <div className="font-semibold text-ink">
                        <span className="text-ink-faint">$</span> {h.raw_input}
                      </div>
                      <div className="mt-1 whitespace-pre-wrap break-all text-ink-soft">{h.simulated_output}</div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCommand(command);
                    setCommand("");
                  }}
                  className="flex items-center gap-2 border-t border-border bg-surface-2 px-4 py-2.5"
                >
                  <span className="shrink-0 font-mono text-xs text-accent">
                    {history[history.length - 1]?.prompt ?? "ubuntu@srv-kodam-logistik-01:/opt/satcom$"}
                  </span>
                  <input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    disabled={busy}
                    className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-ink-faint disabled:opacity-50"
                    placeholder="ketik perintah: ls /opt/satcom, cat ..."
                    spellCheck={false}
                    aria-label="Input perintah Web-SSH"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white transition-colors hover:bg-accent-deep disabled:opacity-50"
                  >
                    Eksekusi
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
