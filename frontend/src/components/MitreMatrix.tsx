"use client";

import { Icon } from "@/lib/icon";
import type { AttackerProfile, MitreEnrichment, Severity } from "@/lib/types";

const SEVERITY: Record<Severity, string> = {
  LOW: "border-border bg-surface-2 text-ink-mute",
  MEDIUM: "border-info/25 bg-info-weak text-info",
  HIGH: "border-warn/25 bg-warn-weak text-warn",
  CRITICAL: "border-danger/25 bg-danger-weak text-danger",
};

const ACTOR_ICON: Record<string, string> = {
  SCRIPT_KIDDIE: "bug-beetle",
  ORGANIZED_CYBERCRIME: "detective",
  STATE_SPONSORED_APT: "skull",
};

interface MitreMatrixProps {
  techniques: MitreEnrichment[];
  profile: AttackerProfile | null;
}

export default function MitreMatrix({ techniques, profile }: MitreMatrixProps) {
  return (
    <section className="card h-full p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <span className="eyebrow">Intelijen Taktik</span>
          <h2 className="text-sm font-semibold text-ink">MITRE ATT&amp;CK Matrix</h2>
        </div>
        <span className="font-mono text-[10px] text-ink-mute">{techniques.length} teknik · Enterprise + ICS</span>
      </header>

      {profile && (
        <div className="mb-4 rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-danger-weak text-danger">
              <Icon name={ACTOR_ICON[profile.actor_classification] ?? "detective"} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-ink">{profile.actor_classification.replace(/_/g, " ")}</div>
              <div className="truncate font-mono text-[10px] text-ink-mute">{profile.primary_intent.replace(/_/g, " ")}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-base font-bold text-accent">{profile.confidence_pct}%</div>
              <div className="font-mono text-[9px] tracking-wider text-ink-mute">CONFIDENCE</div>
            </div>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${profile.confidence_pct}%` }} />
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{profile.psychological_summary}</p>
        </div>
      )}

      <div className="space-y-2.5">
        {techniques.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-surface-2 px-3 py-4 text-[12px] text-ink-mute">
            Menunggu enrichment intelijen.
          </div>
        )}
        {techniques.map((t) => (
          <div key={t.technique_id} className="rounded-xl border border-border bg-surface p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-ink">
                  <span className="font-mono text-accent">{t.technique_id}</span> · {t.technique_name}
                </div>
                <div className="font-mono text-[10px] text-ink-mute">
                  {t.tactic_id} // {t.tactic_name}
                </div>
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${SEVERITY[t.severity] ?? SEVERITY.LOW}`}>
                {t.severity}
              </span>
            </div>
            {t.cumulative_techniques.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {t.cumulative_techniques.map((tech) => (
                  <span key={tech} className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-ink-soft">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
