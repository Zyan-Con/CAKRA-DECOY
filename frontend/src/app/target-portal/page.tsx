"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Crosshair,
  Lock,
  Radar,
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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
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
          : "Koneksi ke backend gagal — pastikan FastAPI berjalan di :8000.",
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
      // abaikan — stream akan mengoreksi
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
          command_id: `cmd-${Date.now()}`,
          cwd: res.cwd,
          prompt: res.prompt,
          raw_input: cmd,
          simulated_output: res.output,
          execution_source: "VFS_DETERMINISTIC_ENGINE" as ExecutionSource,
          response_time_ms: 0,
        },
      ]);
    } catch {
      // abaikan
    } finally {
      setBusy(false);
    }
  };

  const radarTemp = ot?.radar_cooling_temp_c ?? portal?.scada?.radar_cooling_temp_c ?? 34.0;
  const radarStatus = ot?.cooling_status ?? portal?.scada?.cooling_status ?? "NOMINAL";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="flex items-center gap-2 font-mono text-lg font-bold tracking-widest text-slate-100">
              <Crosshair className="h-5 w-5 text-amber-400" />
              PORTAL LOGISTIK &amp; SISTEM KENDALI SCADA
            </h1>
            <p className="font-mono text-[10px] tracking-[0.25em] text-slate-500">
              TNI AD // SATUAN LOGISTIK — MODE SANDBOX DECOY_MIRROR_TWIN
            </p>
          </div>
          <span className="flex items-center gap-2 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-amber-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Decoy Mirror Twin
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {!auth ? (
          <div className="mx-auto max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
              <Lock className="h-4 w-4 text-emerald-400" />
              Operator Authentication
            </h2>
            <p className="mt-2 font-mono text-[10px] text-slate-500">
              // Login selalu mengembalikan HTTP 200 OK dengan status{" "}
              <span className="text-slate-300">AUTHENTICATED</span>. Jika skor
              ancaman melebihi 70, sesi akan dialihkan ke sandbox secara senyap.
            </p>
            <form onSubmit={handleLogin} className="mt-5 space-y-3">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full rounded border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500/60"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full rounded border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500/60"
              />
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 font-mono text-xs uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" />
                Initiate Access
              </button>
            </form>
            {error && (
              <p className="mt-3 font-mono text-[10px] text-rose-400">{error}</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* SCADA panel */}
            <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                <Radar className="h-4 w-4 text-amber-400" />
                SCADA Control
              </h2>
              <div className="mt-4 rounded border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Radar Cooling — Attacker View
                </p>
                <p className="mt-2 font-mono text-3xl font-bold text-rose-400">
                  {radarTemp.toFixed(1)}°C
                </p>
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  Status: {radarStatus}
                </p>
              </div>
              {ot && (
                <div className="mt-3 rounded border border-rose-500/40 bg-rose-500/10 p-3">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-rose-300">
                    <AlertTriangle className="h-3 w-3" />
                    Critical Overheat Illusion
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-300">
                    Sistem real tetap terlindungi: 34.0°C NOMINAL.
                  </p>
                </div>
              )}
              <button
                onClick={handleOT}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-rose-500/50 bg-rose-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/20"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Override Voltage / Kill Cooling
              </button>
            </section>

            {/* Logistics inventory */}
            <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                <Truck className="h-4 w-4 text-emerald-400" />
                Logistics Inventory
              </h2>
              <div className="mt-3 space-y-2">
                {(portal?.logistics ?? []).map((row) => (
                  <div
                    key={`${row.depot}-${row.item}`}
                    className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/60 px-3 py-2 font-mono text-[10px]"
                  >
                    <span className="text-slate-300">{row.item}</span>
                    <span className="text-slate-400">
                      {row.depot} — <span className="text-emerald-400">{row.stock}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Web-SSH terminal */}
            <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 lg:col-span-2">
              <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Web-SSH Console — Attacker Session
              </h2>
              <div className="mt-3 space-y-2">
                {history.length === 0 && (
                  <div className="rounded border border-slate-800 bg-slate-950/60 p-3 font-mono text-[10px] text-slate-600">
                    // menunggu perintah...
                  </div>
                )}
                {history.map((h) => (
                  <div
                    key={h.command_id}
                    className="rounded border border-slate-800 bg-slate-950/60 p-3 font-mono text-[10px]"
                  >
                    <div className="text-emerald-400/90">{h.prompt}</div>
                    <div className="text-slate-200">$ {h.raw_input}</div>
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
                  placeholder="ketik perintah: ls /opt/satcom"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  Execute
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
