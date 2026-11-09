"use client";

import { useState } from "react";
import { Icon } from "@/lib/icon";
import type { HoneytokenTriggered, ImmunityBroadcasted, KodamNode } from "@/lib/types";

interface TacticalMapProps {
  kodamNodes: KodamNode[];
  honeytoken: HoneytokenTriggered | null;
  onImmunityBroadcast?: () => Promise<void>;
  broadcast?: ImmunityBroadcasted | null;
  busy?: boolean;
}

const LNG_MIN = 94;
const LNG_MAX = 142;
const LAT_MAX = 7;
const LAT_MIN = -11;

function project(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(5, Math.min(95, y)) };
}

const STATUS = {
  STANDBY: { dot: "bg-ink-faint", ring: "", label: "Siaga" },
  UNDER_DECEPTION: { dot: "bg-warn", ring: "ring-2 ring-warn/25", label: "Umpan" },
  IMMUNE_PROTECTED: { dot: "bg-accent", ring: "ring-2 ring-accent/25", label: "Kebal" },
} as const;

export default function TacticalMap({
  kodamNodes,
  honeytoken,
  onImmunityBroadcast,
  broadcast,
  busy = false,
}: TacticalMapProps) {
  const [broadcasting, setBroadcasting] = useState(false);
  const geo = honeytoken?.geo_location;
  const attacker = geo ? project(geo.lat, geo.lng) : null;

  const total = kodamNodes.length || 15;
  const immune = kodamNodes.filter((k) => k.status === "IMMUNE_PROTECTED").length;
  const deception = kodamNodes.filter((k) => k.status === "UNDER_DECEPTION").length;
  const standby = kodamNodes.length - immune - deception;

  const runBroadcast = async () => {
    if (!onImmunityBroadcast) return;
    setBroadcasting(true);
    try {
      await onImmunityBroadcast();
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <section className="card flex h-full flex-col p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <span className="eyebrow">Sebaran Satuan</span>
          <h2 className="text-sm font-semibold text-ink">Peta Kodam Nusantara</h2>
        </div>
        {honeytoken ? (
          <span className="flex items-center gap-2 rounded-full border border-danger/30 bg-danger-weak px-2.5 py-1 font-mono text-[10px] text-danger">
            <span className="dot dot-danger" /> PELACAK AKTIF
          </span>
        ) : (
          <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-[10px] text-ink-mute">SIAGA</span>
        )}
      </header>

      <div className="relative aspect-[1000/560] overflow-hidden rounded-xl border border-border bg-surface-2">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgba(24,40,60,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(24,40,60,0.05) 1px, transparent 1px)",
            backgroundSize: "9% 16%",
          }}
        />

        {attacker && (
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${attacker.x}%`, top: `${attacker.y}%` }}
          >
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-ping-ring rounded-full bg-danger/60" />
            <span className="relative block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-danger/25 bg-white px-1.5 py-0.5 font-mono text-[9px] text-danger shadow-card">
              {honeytoken?.real_leaked_ip || honeytoken?.apparent_proxy_ip || "TERDETEKSI"}
            </span>
          </div>
        )}

        {kodamNodes.map((k) => {
          const p = project(k.lat, k.lng);
          const st = STATUS[k.status] ?? STATUS.STANDBY;
          return (
            <div
              key={k.kodam_id}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span className={`block h-2.5 w-2.5 rounded-full transition-transform duration-300 ${st.dot} ${st.ring} ${k.status === "IMMUNE_PROTECTED" ? "scale-110" : ""}`} />
              <span className="pointer-events-none absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-white px-1.5 py-0.5 font-mono text-[9px] text-ink shadow-card group-hover:block">
                {k.name} · {st.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-accent-line bg-accent-weak px-2 py-2.5 text-center">
          <div className="font-mono text-lg font-bold leading-none text-accent-deep">{immune}</div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-accent-deep/70">Kebal</div>
        </div>
        <div className="rounded-xl border border-warn/25 bg-warn-weak px-2 py-2.5 text-center">
          <div className="font-mono text-lg font-bold leading-none text-warn">{deception}</div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-warn/80">Umpan</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 px-2 py-2.5 text-center">
          <div className="font-mono text-lg font-bold leading-none text-ink-soft">{standby}</div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-ink-mute">Siaga</div>
        </div>
      </div>

      {honeytoken && (
        <div className="mt-3 rounded-xl border border-danger/25 bg-danger-weak/50 p-3 font-mono text-[10px]">
          <div className="flex items-center justify-between gap-2 text-danger">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
              <Icon name="fingerprint" className="h-3.5 w-3.5" />
              Atribusi Counter-Intel · {honeytoken.vector_type}
            </span>
            <span className="truncate rounded border border-danger/25 bg-white px-1.5 py-0.5 text-[9px]">
              {honeytoken.token_filename}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-ink-soft">
            <div className="rounded-md border border-border bg-white px-2 py-1">
              <span className="block text-[9px] text-ink-mute">PROXY → REAL ISP IP</span>
              <span className="font-semibold text-ink">{honeytoken.apparent_proxy_ip}</span>{" "}
              <span className="text-ink-mute">→</span>{" "}
              <span className="font-bold text-danger">{honeytoken.real_leaked_ip}</span>
              {honeytoken.local_lan_ip && (
                <span className="ml-1 text-[9px] text-ink-mute">(LAN {honeytoken.local_lan_ip})</span>
              )}
            </div>
            <div className="rounded-md border border-border bg-white px-2 py-1">
              <span className="block text-[9px] text-ink-mute">ESTIMASI GEOLOKASI IP</span>
              <span className="font-semibold text-ink">
                {honeytoken.geo_location.city} ({honeytoken.geo_location.lat.toFixed(2)},{" "}
                {honeytoken.geo_location.lng.toFixed(2)})
              </span>{" "}
              <span className="text-[9px] text-ink-mute">
                ±{Math.max(1, Math.round(honeytoken.geo_location.accuracy_radius_m / 1000))} km
              </span>
            </div>
            {honeytoken.device_fingerprint && (
              <div className="col-span-2 rounded-md border border-border bg-white px-2 py-1">
                <span className="block text-[9px] text-ink-mute">HARDWARE &amp; CANVAS FINGERPRINT</span>
                <span className="text-ink">{honeytoken.device_fingerprint.gpu_renderer}</span>
                <span className="text-ink-mute"> · Hash {honeytoken.device_fingerprint.canvas_hash}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <Icon name="broadcast" className="h-4 w-4 text-accent" />
              Kekebalan Kolektif
            </div>
            <div className="mt-0.5 text-[11px] text-ink-mute">Sintesis IoC ke {total} Kodam (Iptables/ModSecurity)</div>
          </div>
          {onImmunityBroadcast && (
            <button
              onClick={runBroadcast}
              disabled={broadcasting || busy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-accent-deep disabled:opacity-50"
            >
              <Icon name={broadcasting ? "spinner-gap" : "syringe"} className={`h-3.5 w-3.5 ${broadcasting ? "animate-spin" : ""}`} />
              {broadcasting ? "Menyebarkan" : "Broadcast Vaksin"}
            </button>
          )}
        </div>
        {broadcast && (
          <div className="mt-2.5 rounded-lg border border-accent-line bg-accent-weak p-2.5 font-mono text-[10px]">
            <div className="flex items-center justify-between font-semibold text-accent-deep">
              <span>Vaksin tersebar · {immune || total} Kodam kebal</span>
              <span className="text-[9px] text-ink-mute">{broadcast.generated_rule?.rule_id}</span>
            </div>
            <div className="mt-1 break-all rounded-md border border-border bg-white p-1.5 text-[9px] text-ink-soft">
              {broadcast.generated_rule?.iptables_cmd}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
