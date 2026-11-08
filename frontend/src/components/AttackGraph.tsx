"use client";

import { Icon } from "@/lib/icon";
import type { InterceptionAlert, SessionState } from "@/lib/types";

interface AttackGraphProps {
  sessions: SessionState[];
  alert: InterceptionAlert | null;
}

function Node({
  icon,
  tone,
  title,
  sub,
}: {
  icon: string;
  tone: "idle" | "accent" | "warn";
  title: string;
  sub: string;
}) {
  const tones = {
    idle: "border-border bg-surface-2 text-ink-soft [&_.ic]:bg-ink/5 [&_.ic]:text-ink-soft",
    accent: "border-accent-line bg-accent-weak text-accent-deep [&_.ic]:bg-white [&_.ic]:text-accent",
    warn: "border-warn/30 bg-warn-weak text-warn [&_.ic]:bg-white [&_.ic]:text-warn",
  } as const;
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${tones[tone]}`}>
      <span className="ic grid h-8 w-8 shrink-0 place-items-center rounded-lg">
        <Icon name={icon} className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <div className="truncate font-mono text-xs font-semibold tracking-wide">{title}</div>
        <div className="truncate text-[11px] opacity-80">{sub}</div>
      </div>
    </div>
  );
}

export default function AttackGraph({ sessions, alert }: AttackGraphProps) {
  const decoy = (alert?.routing_mode ?? "DECOY_MIRROR_TWIN") === "DECOY_MIRROR_TWIN";
  const threatScore = alert?.threat_score ?? sessions[0]?.threat_score ?? 0;
  const latency = alert?.interception_latency_ms ?? 0;

  return (
    <section className="card h-full p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <span className="eyebrow">Alur Pembelokan</span>
          <h2 className="text-sm font-semibold text-ink">Attack Graph</h2>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-accent-line bg-accent-weak px-2.5 py-1 font-mono text-[10px] text-accent-deep">
          <span className="dot dot-live" /> ROUTING LIVE
        </span>
      </header>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        <Node icon="crosshair-simple" tone="idle" title="ATTACKER_INGRESS" sub="Proxy / VPN / Tor source" />
        <div className="flex items-center justify-center md:flex-col">
          <Icon name="arrow-right" className="h-5 w-5 rotate-90 text-accent md:rotate-0" />
          <span className="font-mono text-[9px] tracking-widest text-ink-mute">{"<5ms"}</span>
        </div>
        <Node icon="shield-checkered" tone="accent" title="CAKRA_PROXY" sub="Opaque silent interceptor" />

        <div className="hidden md:block" />
        <div className="flex items-center justify-center md:flex-col">
          <Icon name="arrow-right" className={`h-5 w-5 rotate-90 md:rotate-0 ${decoy ? "text-warn" : "text-accent"}`} />
        </div>
        <Node
          icon={decoy ? "crosshair" : "shield-check"}
          tone={decoy ? "warn" : "accent"}
          title={decoy ? "AI_MIRROR_TWIN" : "REAL_SYSTEM"}
          sub={decoy ? "Chameleon sandbox · karantina" : "Protected / isolated"}
        />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Threat Score</span>
          <span className="font-mono text-xs font-semibold text-ink">{threatScore}/100</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              threatScore >= 70 ? "bg-danger" : threatScore >= 40 ? "bg-warn" : "bg-accent"
            }`}
            style={{ width: `${Math.min(threatScore, 100)}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px]">
            <span className="text-ink-mute">VECTOR</span>
            <span className="truncate pl-2 text-ink">{alert?.entry_vector ?? sessions[0]?.entry_vector ?? "·"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px]">
            <span className="text-ink-mute">LATENCY</span>
            <span className="text-accent">{latency.toFixed(2)} ms</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-3">
          <span className="eyebrow">Active Decoy Sessions</span>
          <div className="hairline flex-1" />
          <span className="font-mono text-[11px] text-ink-mute">{sessions.length}</span>
        </div>
        {sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-surface-2 px-3 py-3 text-[12px] text-ink-mute">
            Belum ada sesi dibelokkan. Menunggu intersepsi.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.session_id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[11px]"
              >
                <span className={`dot ${s.threat_score >= 70 ? "dot-danger" : "dot-warn"}`} />
                <span className="truncate text-ink">{s.session_id}</span>
                <span className="ml-auto text-ink-mute">{s.entry_vector}</span>
                <span className={s.threat_score >= 70 ? "font-semibold text-danger" : "font-semibold text-warn"}>
                  {s.threat_score}
                </span>
                {s.real_leaked_ip && (
                  <span className="hidden items-center gap-1 text-accent sm:flex">
                    <Icon name="fingerprint" className="h-3 w-3" />
                    {s.real_leaked_ip}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
