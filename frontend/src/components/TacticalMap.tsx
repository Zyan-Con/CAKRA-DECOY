import { Radar } from "lucide-react";
import type { HoneytokenTriggered, KodamNode } from "@/lib/types";

interface TacticalMapProps {
  kodamNodes: KodamNode[];
  honeytoken: HoneytokenTriggered | null;
}

const STATUS_COLOR: Record<string, string> = {
  STANDBY: "bg-slate-400",
  UNDER_DECEPTION: "bg-amber-400",
  IMMUNE_PROTECTED: "bg-emerald-400",
};

function project(lat: number, lng: number) {
  const x = 60 + ((lng - 95) / (141 - 95)) * 680;
  const y = 30 + ((90 - lat) / (90 - (-12))) * (460 - 60);
  return { x, y };
}

export default function TacticalMap({
  kodamNodes,
  honeytoken,
}: TacticalMapProps) {
  const geo = honeytoken?.geo_location;
  const pos = geo ? project(geo.lat, geo.lng) : null;

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
          <Radar className="h-4 w-4 text-emerald-400" />
          Tactical Map
        </h2>
        {honeytoken ? (
          <span className="flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
            Honeytoken Live
          </span>
        ) : (
          <span className="rounded border border-slate-700 bg-slate-800/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Standby
          </span>
        )}
      </header>

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
          className="absolute inset-0 animate-radar-sweep rounded-full"
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
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(pos.x / 800) * 100}%`, top: `${(pos.y / 460) * 100}%` }}
          >
            <span className="absolute h-3 w-3 animate-ping rounded-full bg-rose-500 opacity-70" />
            <span className="relative block h-3 w-3 rounded-full bg-rose-500 ring-2 ring-rose-400/70" />
          </div>
        )}

        {/* kodam markers */}
        {kodamNodes.map((k) => (
          <div
            key={k.kodam_id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${((k.lng - 95) / 46) * 100}%`, top: `${((90 - k.lat) / 102) * 100}%` }}
          >
            <span className={`block h-2.5 w-2.5 rounded-full ${STATUS_COLOR[k.status] ?? "bg-slate-400"}`} />
          </div>
        ))}
      </div>

      <div className="mt-3 grid max-h-32 gap-2 overflow-y-auto font-mono text-[10px] sm:grid-cols-2">
        {kodamNodes.map((k) => (
          <div key={k.kodam_id} className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/60 px-2 py-1.5">
            <span className="text-slate-300">{k.kodam_id}</span>
            <span
              className={
                k.status === "IMMUNE_PROTECTED"
                  ? "text-emerald-400"
                  : k.status === "UNDER_DECEPTION"
                    ? "text-amber-400"
                    : "text-slate-400"
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
