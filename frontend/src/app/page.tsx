import Link from "next/link";
import { ArrowRight, Crosshair, Radar, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "CAKRA-DECOY 2.0",
  description:
    "Cyber Autonomous Kernel-less Routing & Active Deception System — PUSSIBERAD Kartika Cyber Hackathon 2026.",
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-mono text-xs tracking-[0.3em] text-emerald-400">
            CAKRA-DECOY // PUSSIBERAD
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-slate-500">
            KARTIKA CYBER HACKATHON 2026
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-mono text-xs tracking-[0.3em] text-amber-400">
          // DEFENSIVE SHIELD // CATEGORY 02
        </p>
        <h1 className="mt-4 font-mono text-5xl font-bold tracking-tight text-slate-100 sm:text-6xl">
          CAKRA<span className="text-emerald-400">-DECOY</span>{" "}
          <span className="text-2xl font-semibold text-slate-400 sm:text-3xl">
            2.0
          </span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-400">
          Cyber Autonomous Kernel-less Routing &amp; Active Deception System —
          penghalang siber aktif yang diam-diam membawa sesi penyerang ke
          ruang jebakan AI Mirror-Twin, menyadap TTP-nya, dan membongkar identitas
          aslinya lewat operasi bumerang.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link
            href="/target-portal"
            className="group rounded-lg border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <Crosshair className="h-6 w-6 text-amber-400" />
              <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-slate-100">
                Layar 1 — Portal Decoy
              </h2>
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-slate-400">
              Portal Logistik &amp; Sistem Kendali SCADA TNI AD (sandbox mode).
              Termasuk terminal Web-SSH yang mengeksekusi perintah penyerang,
              panel ilusi sabotase pendingin radar, dan manajemen sesi.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-400">
              Buka Layar 1 <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/command-center"
            className="group rounded-lg border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <Radar className="h-6 w-6 text-emerald-400" />
              <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-slate-100">
                Layar 2 — Command Center
              </h2>
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-slate-400">
              Dashboard C4ISR PUSSIBERAD — attack graph real-time, tactical map
              radar, live terminal spy, MITRE ATT&amp;CK matrix, dan forensic ledger
              SHA-256.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-400">
              Buka Layar 2 <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        <div className="mt-14 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-100">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            Ringkasan Teknis
          </h2>
          <div className="mt-4 grid gap-4 font-mono text-xs text-slate-400 md:grid-cols-3">
            <div>
              <p className="text-slate-200">Opaque Silent Tactical Interceptor</p>
              <p className="mt-1 text-slate-500">
                Deteksi SQLi / RCE / Path Traversal / sabotase OT &lt; 5ms, tanpa
                membocorkan status &quot;DECOY&quot; di DevTools.
              </p>
            </div>
            <div>
              <p className="text-slate-200">Chameleon AI Mirror-Twin</p>
              <p className="mt-1 text-slate-500">
                Terminal Web-SSH hibrida (VFS deterministic &lt; 2ms + LLM context
                shell + static fallback).
              </p>
            </div>
            <div>
              <p className="text-slate-200">Dual-Vector Boomerang Honeytoken</p>
              <p className="mt-1 text-slate-500">
                Operasi bumerang 3 jalur (HTML WebRTC / CLI Canary / Source Bait)
                untuk unmask IP asli penyerang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
