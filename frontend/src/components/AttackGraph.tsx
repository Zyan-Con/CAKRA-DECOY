import type { LucideIcon } from "lucide-react";
import { ArrowDown, Crosshair, Radar, ShieldAlert, Waypoints } from "lucide-react";
import type { InterceptionAlert, SessionState } from "@/lib/types";

interface AttackGraphProps {
  sessions: SessionState[];
  alert: InterceptionAlert | null;
}

function NodeCard({
  icon: Icon,
  tone,
  title,
  sub,
  active,
}: {
  icon: LucideIcon;
  tone: string;
  title: string;
  sub: string;
  active?: boolean;
}) {
  const toneClasses: Record<string, string> = {
    slate: "border-slate-700 bg-slate-800/40 text-slate-300",
    emerald: "border-emerald-500/70 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/70 bg-amber-500/10 text-amber-400",
  };
  return (
    <div
      className={`rounded-md border px-3 py-2 ${toneClasses[tone] ?? toneClasses.slate} ${
        active ? "ring-1 ring-emerald-400/60" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider truncate">
            {title}
          </div>
          <div className="font-mono text-[10px] opacity-80 truncate">{sub}</div>
        </div>
      </div>
    </div>
  );
}

export default function AttackGraph({ sessions, alert }: AttackGraphProps) {
  const routingMode = alert?.routing_mode ?? "DECOY_MIRROR_TWIN";
  const decoyRouting = routingMode === "DECOY_MIRROR_TWIN";
  const threatScore = alert?.threat_score ?? sessions[0]?.threat_score ?? 0;

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
          <Waypoints className="h-4 w-4 text-emerald-400" />
          Attack Graph
        </h2>
        <span className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </header>

      <div className="space-y-2">
        <NodeCard
          icon={Crosshair}
          tone="slate"
          title="ATTACKER_INGRESS"
          sub="External / Proxy / VPN source"
        />
        <div className="flex justify-center">
          <ArrowDown className="h-4 w-4 text-emerald-400" />
        </div>
        <NodeCard
          icon={ShieldAlert}
          tone="emerald"
          title="CAKRA_TACTICAL_PROXY"
          sub={
            decoyRouting
              ? "SILENT ROUTER → DECOY_MIRROR_TWIN"
              : "SILENT ROUTER → REAL_SYSTEM"
          }
          active={decoyRouting}
        />
        <div className="flex justify-center">
          <ArrowDown className="h-4 w-4 text-amber-400" />
        </div>
        <NodeCard
          icon={Radar}
          tone="amber"
          title="AI_MIRROR_TWIN_SANDBOX"
          sub={
            decoyRouting
              ? "Chameleon AI Mirror-Twin"
              : "REAL SYSTEM — PROTECTED / ISOLATED"
          }
          active={decoyRouting}
        />
      </div>

      <div className="mt-4 rounded border border-slate-800 bg-slate-950/60 p-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
          <span>Threat Score</span>
          <span className="text-slate-300">{threatScore}/100</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded bg-slate-800">
          <div
            className={`h-full rounded ${
              threatScore >= 70
                ? "bg-rose-500"
                : threatScore >= 40
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
            style={{ width: `${threatScore}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[10px] text-slate-400">
          Entry Vector:{" "}
          {alert?.entry_vector ?? sessions[0]?.entry_vector ?? "—"} · Latency:{" "}
          {(alert?.interception_latency_ms ?? 0).toFixed(1)}ms
        </p>
      </div>

      {sessions.length > 0 && (
        <div className="mt-4 border-t border-slate-800 pt-3">
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Active Decoy Sessions
          </h3>
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.session_id}
                className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-950/60 px-3 py-2 font-mono text-xs"
              >
                <span className="text-slate-200">{s.session_id}</span>
                <span className={s.threat_score >= 70 ? "text-rose-400" : "text-amber-400"}>
                  THREAT {s.threat_score}
                </span>
                <span className="text-slate-400">{s.entry_vector}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
