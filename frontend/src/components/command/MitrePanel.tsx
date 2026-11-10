import { Panel, type PanelFocus } from "@/components/ui/Panel";
import type { TacticalState } from "@/lib/tactical-state";
import type { Severity } from "@/lib/types";

const SEVERITY: Record<Severity, string> = {
  CRITICAL: "border-hostile text-hostile",
  HIGH: "border-hostile/60 text-hostile",
  MEDIUM: "border-line text-ink-soft",
  LOW: "border-line text-ink-mute",
};

const ACTOR: Record<string, string> = {
  STATE_SPONSORED_APT: "APT disponsori negara",
  ORGANIZED_CYBERCRIME: "Kejahatan siber terorganisir",
  SCRIPT_KIDDIE: "Penyerang amatir",
};

export function MitrePanel({
  state,
  focus,
}: {
  state: TacticalState;
  focus?: PanelFocus;
}) {
  const profile = state.mitreProfile;
  const techniques = state.mitreTechniques;
  return (
    <Panel
      eyebrow="MITRE ATT&CK"
      title="Taktik yang dipakai penyerang"
      focus={focus}
    >
      {profile && (
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-xs text-ink-mute">
              Klasifikasi aktor (rule statis)
            </p>
            <p className="text-base font-semibold text-ink">
              {ACTOR[profile.actor_classification] ??
                profile.actor_classification}
            </p>
          </div>
          <p className="font-data text-2xl font-semibold text-ink">
            {profile.confidence_pct}%
          </p>
        </div>
      )}
      {techniques.length === 0 ? (
        <p className="text-sm text-ink-mute">
          Belum ada teknik yang terpetakan.
        </p>
      ) : (
        <ul className="max-h-[420px] space-y-2 overflow-y-auto">
          {techniques.map((t) => (
            <li
              key={t.technique_id}
              className="flex items-start justify-between gap-3 rounded-sm bg-panel-2 px-3 py-2.5"
            >
              <div>
                <p className="text-sm text-ink">
                  <span className="font-data font-semibold">
                    {t.technique_id}
                  </span>{" "}
                  · {t.technique_name}
                </p>
                <p className="text-xs text-ink-mute">{t.tactic_name}</p>
              </div>
              <span
                className={`shrink-0 rounded-sm border px-2 py-0.5 text-xs font-semibold ${SEVERITY[t.severity]}`}
              >
                {t.severity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
