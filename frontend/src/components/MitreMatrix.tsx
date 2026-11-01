import type { AttackerProfile, MitreEnrichment, Severity } from "@/lib/types";

const SEVERITY_STYLE: Record<Severity, string> = {
  LOW: "bg-slate-800 text-slate-300",
  MEDIUM: "bg-blue-500/15 text-blue-300",
  HIGH: "bg-amber-500/15 text-amber-300",
  CRITICAL: "bg-rose-500/15 text-rose-300",
};

interface MitreMatrixProps {
  techniques: MitreEnrichment[];
  profile: AttackerProfile | null;
}

export default function MitreMatrix({
  techniques,
  profile,
}: MitreMatrixProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 lg:col-span-2">
      <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
        MITRE ATT&amp;CK Matrix
      </h2>

      <div className="space-y-3">
        {techniques.length === 0 && (
          <div className="font-mono text-xs text-slate-500">// menunggu enrichment...</div>
        )}
        {techniques.map((t) => (
          <div
            key={t.technique_id}
            className="rounded border border-slate-800 bg-slate-950/60 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-xs font-semibold text-slate-100">
                  {t.technique_id} — {t.technique_name}
                </div>
                <div className="font-mono text-[10px] text-slate-500">
                  {t.tactic_id} // {t.tactic_name}
                </div>
              </div>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${SEVERITY_STYLE[t.severity] ?? SEVERITY_STYLE.LOW}`}
              >
                {t.severity}
              </span>
            </div>
            {t.cumulative_techniques.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.cumulative_techniques.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {profile && (
        <div className="mt-4 rounded border border-slate-800 bg-slate-950/60 p-3">
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Attacker Profile
          </h3>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300">{profile.actor_classification.replace(/_/g, " ")}</span>
            <span className="text-emerald-400">{profile.confidence_pct}% confidence</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-slate-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${profile.confidence_pct}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-400">
            {profile.primary_intent}
          </p>
          <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-500">
            {profile.psychological_summary}
          </p>
        </div>
      )}
    </section>
  );
}
