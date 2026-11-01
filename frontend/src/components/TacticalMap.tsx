"use client";

import { useState } from "react";
import { Radar, ShieldCheck, Sparkles } from "lucide-react";
import type { HoneytokenTriggered, ImmunityBroadcasted, KodamNode } from "@/lib/types";

interface TacticalMapProps {
  kodamNodes: KodamNode[];
  honeytoken: HoneytokenTriggered | null;
  onImmunityBroadcast?: () => Promise<void>;
  broadcast?: ImmunityBroadcasted | null;
  busy?: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  STANDBY: "bg-slate-500",
  UNDER_DECEPTION: "bg-amber-400 shadow-amber-400/50",
  IMMUNE_PROTECTED: "bg-emerald-400 shadow-emerald-400/50",
};

function project(lat: number, lng: number) {
  const x = 60 + ((lng - 95) / (141 - 95)) * 680;
  const y = 30 + ((90 - lat) / (90 - (-12))) * (460 - 60);
  return { x, y };
}

export default function TacticalMap({
  kodamNodes,
  honeytoken,
  onImmunityBroadcast,
  broadcast,
  busy = false,
}: TacticalMapProps) {
  const [broadcasting, setBroadcasting] = useState(false);
  const geo = honeytoken?.geo_location;
  const pos = geo ? project(geo.lat, geo.lng) : null;

  const immuneCount = kodamNodes.filter((k) => k.status === "IMMUNE_PROTECTED").length;
  const deceptionCount = kodamNodes.filter((k) => k.status === "UNDER_DECEPTION").length;
  const standbyCount = kodamNodes.length - immuneCount - deceptionCount;

  const handleBroadcast = async () => {
    if (!onImmunityBroadcast) return;
    setBroadcasting(true);
    try {
      await onImmunityBroadcast();
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
          <Radar className="h-4 w-4 text-emerald-400" />
          Peta Taktis Kodam Nusantara
        </h2>
        {honeytoken ? (
          <span className="flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
            Pelacak Honeytoken Aktif
          </span>
        ) : (
          <span className="rounded border border-slate-700 bg-slate-800/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Siaga Pemantauan
          </span>
        )}
      </header>

      {/* Radar Canvas Viewport */}
      <div className="relative aspect-[800/460] overflow-hidden rounded border border-slate-800 bg-slate-950/80">
        {/* graticule */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(51,65,85,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(51,65,85,0.35) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* radar rings */}
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/30" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/20" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/10" />
        <div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/20" />
        <div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 -translate-y-1/2 bg-emerald-500/20" />
        {/* radar sweep */}
        <div
          className="absolute inset-0 animate-radar-sweep rounded-full pointer-events-none"
          style={{
            background: "conic-gradient(rgba(52, 211, 153, 0.28) 0deg, transparent 90deg)",
            maskImage: "radial-gradient(circle, black 0%, transparent 72%)",
          }}
        />
        {/* center */}
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400" />

        {/* attacker marker */}
        {pos && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${(pos.x / 800) * 100}%`, top: `${(pos.y / 460) * 100}%` }}
          >
            <span className="absolute h-4 w-4 -translate-x-0.5 -translate-y-0.5 animate-ping rounded-full bg-rose-500 opacity-70" />
            <span className="relative block h-3 w-3 rounded-full bg-rose-500 ring-2 ring-rose-400/80 shadow-lg" />
            <span className="absolute left-4 top-0 whitespace-nowrap rounded bg-slate-950/90 px-1.5 py-0.5 font-mono text-[9px] text-rose-300 border border-rose-500/40">
              TARGET: {honeytoken?.real_leaked_ip || honeytoken?.apparent_proxy_ip || "TERDETEKSI"}
            </span>
          </div>
        )}

        {/* kodam markers */}
        {kodamNodes.map((k) => (
          <div
            key={k.kodam_id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${((k.lng - 95) / 46) * 100}%`, top: `${((90 - k.lat) / 102) * 100}%` }}
          >
            <span
              className={`block h-2.5 w-2.5 rounded-full shadow-sm transition-all duration-300 ${
                STATUS_COLOR[k.status] ?? "bg-slate-400"
              } ${k.status === "IMMUNE_PROTECTED" ? "ring-2 ring-emerald-400/40 scale-125" : ""}`}
            />
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 hidden whitespace-nowrap rounded bg-slate-900/90 px-1 py-0.5 font-mono text-[8px] text-slate-200 border border-slate-700 group-hover:block z-20">
              {k.kodam_id}: {k.status}
            </span>
          </div>
        ))}
      </div>

      {/* Nodes Counter Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-center">
          <div className="text-emerald-400 font-bold text-sm">{immuneCount}</div>
          <div className="text-emerald-300/80 uppercase text-[9px]">Vaksin Terpasang</div>
        </div>
        <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-center">
          <div className="text-amber-400 font-bold text-sm">{deceptionCount}</div>
          <div className="text-amber-300/80 uppercase text-[9px]">Dalam Umpan</div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2 text-center">
          <div className="text-slate-300 font-bold text-sm">{standbyCount}</div>
          <div className="text-slate-400 uppercase text-[9px]">Siaga Standby</div>
        </div>
      </div>

      {/* Collective Immunity Action Button */}
      <div className="mt-3 rounded border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Prosedur Kekebalan Kolektif
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Sintesis IoC ke Suricata / IPTables seluruh Kodam
            </div>
          </div>

          {onImmunityBroadcast && (
            <button
              onClick={handleBroadcast}
              disabled={broadcasting || busy}
              className="flex items-center gap-1.5 rounded border border-emerald-500/50 bg-emerald-500/20 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {broadcasting ? "Menyebarkan..." : "Broadcast Vaksin Kodam"}
            </button>
          )}
        </div>

        {broadcast && (
          <div className="mt-2.5 rounded border border-emerald-500/30 bg-emerald-500/10 p-2 font-mono text-[10px]">
            <div className="text-emerald-300 font-semibold flex items-center justify-between">
              <span>STATUS: VAKSINASI TUNTAS // 15 KODAM KEBAL</span>
              <span className="text-[9px] text-slate-400">{broadcast.generated_rule?.rule_id}</span>
            </div>
            <div className="mt-1 text-slate-300 break-all bg-slate-950/60 p-1.5 rounded border border-slate-800 font-mono text-[9px]">
              {broadcast.generated_rule?.iptables_cmd}
            </div>
          </div>
        )}
      </div>

      {/* Nodes List */}
      <div className="mt-3 grid max-h-32 gap-1.5 overflow-y-auto font-mono text-[10px] sm:grid-cols-2">
        {kodamNodes.map((k) => (
          <div
            key={k.kodam_id}
            className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/60 px-2 py-1"
          >
            <span className="text-slate-300">{k.kodam_id}</span>
            <span
              className={
                k.status === "IMMUNE_PROTECTED"
                  ? "text-emerald-400 font-semibold"
                  : k.status === "UNDER_DECEPTION"
                    ? "text-amber-400"
                    : "text-slate-500"
              }
            >
              {k.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
