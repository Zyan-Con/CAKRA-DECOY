"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCode2,
  KeyRound,
  Lock,
  Play,
  Radar,
  Shield,
  ShieldAlert,
  Terminal,
  Truck,
} from "lucide-react";
import {
  api,
  ApiError,
  type ConsoleResponse,
  type LoginResponse,
  type OtControlResponse,
  type PortalState,
} from "@/lib/api";
import type {
  ExecutionSource,
  TerminalCommandExecuted,
} from "@/lib/types";

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

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.login(username, password);
      setAuth(res);
      const state = await api.portalState(res.session_token);
      setPortal(state);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Koneksi ke sistem komando logistik gagal — pastikan gateway operasional.",
      );
    } finally {
      setBusy(false);
    }
  };

  const fillAndLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setBusy(true);
    setError(null);
    try {
      const res = await api.login(u, p);
      setAuth(res);
      const state = await api.portalState(res.session_token);
      setPortal(state);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Koneksi ke sistem komando logistik gagal — pastikan gateway operasional.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleOT = async () => {
    if (!auth) return;
    try {
      const res = await api.otControl(auth.session_token, "OVERRIDE_VOLTAGE", "RADAR_COOLING");
      setOt(res);
    } catch {
      // stream akan mengoreksi status telemetry
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
          execution_source: "VFS_DETERMINISTIC_ENGINE" as ExecutionSource,
          response_time_ms: 0,
        },
      ]);
    } catch {
      // abaikan error lokal
    } finally {
      setBusy(false);
    }
  };

  const triggerHoneytokenSimulation = async () => {
    if (!auth) return;
    setTriggerStatus("MENGIRIM TELEMETRI...");
    try {
      const sampleBeacon = {
        session_id: auth.session_token,
        event: "WEB_PAGE_OPENED",
        client_timestamp: new Date().toISOString(),
        gpu_unmasked: "ANGLE (NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0)",
        canvas_hash: "a4f891b2c5e3d744",
        screen_geometry: "1920x1080x24",
        timezone_offset_minutes: -420,
        detected_vpn: true,
        webrtc_local_candidates: ["192.168.1.105", "10.8.0.42"],
      };
      const b64Payload = btoa(JSON.stringify(sampleBeacon));
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8001"}/api/telemetry/sync?b=${encodeURIComponent(b64Payload)}`
      );
      if (res.ok) {
        setTriggerStatus("TELEMETRI BERHASIL DIKIRIM KE C4ISR");
        setTimeout(() => setTriggerStatus(null), 3500);
      } else {
        setTriggerStatus("GAGAL");
      }
    } catch {
      setTriggerStatus("GAGAL KONEKSI");
    }
  };

  const radarTemp = ot?.radar_cooling_temp_c ?? portal?.scada?.radar_cooling_temp_c ?? 34.0;
  const radarStatus = ot?.cooling_status ?? portal?.scada?.cooling_status ?? "NOMINAL";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      {/* Header Militer */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="flex items-center gap-2 font-mono text-lg font-bold tracking-widest text-slate-100">
              <Shield className="h-5 w-5 text-emerald-400" />
              PORTAL LOGISTIK &amp; KENDALI SCADA KODAM
            </h1>
            <p className="font-mono text-[10px] tracking-[0.25em] text-emerald-500/80">
              KOMANDO DAERAH MILITER // SISTEM PERTAHANAN LOGISTIK TERPADU
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              SISTEM LEVEL 4 // RAHASIA
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {!auth ? (
          <div className="mx-auto max-w-md">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
              <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                <Lock className="h-4 w-4 text-emerald-400" />
                Otorisasi Akses Operator Militer
              </h2>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-400">
                Sistem Resmi PUSSIBERAD / DISINFOLAHTAD TNI AD. Akses terbatas khusus personel bersertifikasi.
                Seluruh aktivitas terpantau dan diaudit secara kriptografis.
              </p>

              <form onSubmit={handleLogin} className="mt-5 space-y-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-slate-400">
                    ID Personel / NIK Militer
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="misal: prajurit01 atau admin"
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-slate-400">
                    Kata Sandi Operasional
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded border border-emerald-500/50 bg-emerald-500/20 px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5" />
                  {busy ? "Memverifikasi..." : "Autentikasi Akses"}
                </button>
              </form>

              {error && (
                <p className="mt-3 font-mono text-[10px] text-rose-400">{error}</p>
              )}

              {/* Quick Fill Demo Helper Pills */}
              <div className="mt-6 border-t border-slate-800 pt-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Aksi Uji Coba Cepat (Demo Presidium):
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillAndLogin("prajurit01", "tni123")}
                    className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/60 px-2 py-1.5 font-mono text-[10px] text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Prajurit Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => fillAndLogin("admin' OR '1'='1 --", "bypass")}
                    className="flex items-center justify-center gap-1 rounded border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 font-mono text-[10px] text-rose-300 hover:bg-rose-500/20"
                  >
                    <ShieldAlert className="h-3 w-3 text-rose-400" />
                    Injeksi SQLi (Serangan)
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-slate-400">SESI TERVERIFIKASI:</span>
                <span className="font-bold text-slate-200">{auth.operator_role}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-slate-400">
                  TINGKAT CLEARANCE: <span className="text-emerald-400">{auth.clearance_level}</span>
                </span>
                <span className="text-slate-500">TOKEN: {auth.session_token}</span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* SCADA panel */}
              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                  <Radar className="h-4 w-4 text-amber-400" />
                  Kendali SCADA Radar Early-Warning
                </h2>
                <div className="mt-4 rounded border border-slate-800 bg-slate-950/60 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Sensor Suhu Pendingin Generator Radar
                  </p>
                  <p
                    className={`mt-2 font-mono text-3xl font-bold ${
                      radarTemp > 60 ? "text-rose-400 animate-pulse" : "text-emerald-400"
                    }`}
                  >
                    {radarTemp.toFixed(1)}°C
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Status Telemetri PLC: <span className="text-slate-200 font-semibold">{radarStatus}</span>
                  </p>
                </div>

                {ot && (
                  <div className="mt-3 rounded border border-rose-500/60 bg-rose-500/20 p-3 animate-pulse">
                    <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-widest text-rose-300">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                      ALARM KRITIS: OVERHEAT DETECTED
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-rose-200">
                      Tegangan PLC dipaksa melampaui toleransi operasional. Sistem otomatisasi pendingin gagal!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleOT}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-rose-500/50 bg-rose-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/20"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Override Tegangan PLC / Nonaktifkan Pendingin
                </button>
              </section>

              {/* Logistics inventory */}
              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                  <Truck className="h-4 w-4 text-emerald-400" />
                  Inventaris Logistik Kodam
                </h2>
                <div className="mt-3 space-y-2">
                  {(portal?.logistics ?? []).map((row) => (
                    <div
                      key={`${row.depot}-${row.item}`}
                      className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/60 px-3 py-2 font-mono text-[10px]"
                    >
                      <span className="text-slate-300">{row.item}</span>
                      <span className="text-slate-400">
                        {row.depot} — <span className="text-emerald-400 font-semibold">{row.stock}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Restricted Satcom Honeytoken Vault */}
              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                  <FileCode2 className="h-4 w-4 text-sky-400" />
                  Brankas Berkas Satkom Darurat
                </h2>
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  Dokumen sandi &amp; konfigurasi kanal satelit darurat (Klasifikasi Rahasia):
                </p>

                <div className="mt-3 space-y-2 font-mono text-[10px]">
                  {/* Trap File 1: HTML Chameleon */}
                  <div className="rounded border border-slate-800 bg-slate-950/60 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                        <ExternalLink className="h-3 w-3" />
                        Akses_Darurat_Satelit_TNI.html
                      </span>
                      <span className="text-[9px] text-slate-500">HTML UMPAN</span>
                    </div>
                    <p className="mt-1 text-slate-400">
                      Pelacak WebGL, GPU unmasking &amp; WebRTC STUN. 0% dialog izin browser.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={api.honeytokenDownloadUrl("Akses_Darurat_Satelit_TNI.html", auth.session_token)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 rounded border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-sky-300 hover:bg-sky-500/20"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Buka / Uji Umpan
                      </a>
                    </div>
                  </div>

                  {/* Trap File 2: Canary ENV */}
                  <div className="rounded border border-slate-800 bg-slate-950/60 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                        <KeyRound className="h-3 w-3" />
                        kredensial_komando.env
                      </span>
                      <span className="text-[9px] text-slate-500">JWT CANARY</span>
                    </div>
                    <p className="mt-1 text-slate-400">
                      Token JWT valid Base64 berisi payload jebakan SATCOM-ACCESS.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={api.honeytokenDownloadUrl("kredensial_komando.env", auth.session_token)}
                        download="kredensial_komando.env"
                        className="flex flex-1 items-center justify-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-300 hover:bg-emerald-500/20"
                      >
                        <Download className="h-3 w-3" />
                        Unduh Kredensial
                      </a>
                    </div>
                  </div>

                  {/* Direct Telemetry Trigger Button for Live Demo */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={triggerHoneytokenSimulation}
                      className="flex w-full items-center justify-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-amber-300 hover:bg-amber-500/20"
                    >
                      <Play className="h-3 w-3" />
                      Simulasi Telemetri Umpan ke C4ISR
                    </button>
                    {triggerStatus && (
                      <p className="mt-1 text-center text-[10px] text-amber-400 animate-pulse">
                        {triggerStatus}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Web-SSH terminal */}
              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    Konsol Web-SSH Operasional
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "ls /opt/satcom",
                      "cat /opt/satcom/kredensial_komando.env",
                      "cat /etc/shadow",
                      "uname -a",
                      "whoami",
                    ].map((cmd) => (
                      <button
                        key={cmd}
                        onClick={() => handleCommand(cmd)}
                        disabled={busy}
                        className="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-50"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 rounded border border-slate-800 bg-slate-950 p-3">
                  {history.length === 0 && (
                    <div className="font-mono text-[10px] text-slate-600">
                      // Sesi SSH aktif. Ketik perintah di bawah atau pilih pintasan perintah di atas...
                    </div>
                  )}
                  {history.map((h) => (
                    <div
                      key={h.command_id}
                      className="rounded border border-slate-800 bg-slate-900/40 p-2.5 font-mono text-[11px]"
                    >
                      <div className="text-emerald-400/90">{h.prompt}</div>
                      <div className="text-slate-200 font-semibold">$ {h.raw_input}</div>
                      <div className="mt-1 whitespace-pre-wrap text-slate-400">
                        {h.simulated_output}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCommand(command);
                    setCommand("");
                  }}
                  className="mt-3 flex items-center gap-2"
                >
                  <span className="font-mono text-xs text-emerald-400">
                    {history[history.length - 1]?.prompt ??
                      "ubuntu@srv-kodam-logistik-01:/opt/satcom$"}
                  </span>
                  <input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-slate-200 outline-none placeholder:text-slate-600"
                    placeholder="ketik perintah Linux: ls /opt/satcom, cat /etc/shadow ..."
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded border border-emerald-500/50 bg-emerald-500/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
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
