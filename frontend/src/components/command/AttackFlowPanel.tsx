import { Icon, type IconName } from "@/components/ui/Icon";
import { Panel, type PanelFocus } from "@/components/ui/Panel";
import type { TacticalState } from "@/lib/tactical-state";

export interface AttackFlowPanelProps {
  state: TacticalState;
  focus?: PanelFocus;
  selectedSessionId?: string | null;
  onSelectSession?: (id: string) => void;
}

function Node({
  icon,
  title,
  sub,
  tone,
}: {
  icon: IconName;
  title: string;
  sub: string;
  tone: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-sm border bg-panel-2 px-3 py-2.5 ${tone}`}
    >
      <Icon name={icon} className="h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink-mute">{sub}</p>
      </div>
    </div>
  );
}

export function AttackFlowPanel({
  state,
  focus,
  selectedSessionId,
  onSelectSession,
}: AttackFlowPanelProps) {
  const diverted = state.sessions.some(
    (s) => s.routing_mode === "DECOY_MIRROR_TWIN",
  );
  return (
    <Panel
      eyebrow="Alur pembelokan"
      title="Ke mana penyerang dibawa"
      focus={focus}
    >
      <div className="space-y-2">
        <Node
          icon="global-bold-duotone"
          title="Penyerang"
          sub="Internet · proxy/VPN"
          tone="border-line text-hostile"
        />
        <Node
          icon="shield-check-bold-duotone"
          title="CAKRA-DECOY"
          sub="Pemilah lalu lintas (< 5 ms)"
          tone="border-line text-signal"
        />
        <Node
          icon="eye-bold-duotone"
          title={diverted ? "Portal jebakan (Mirror-Twin)" : "Portal asli"}
          sub={diverted ? "Diisolasi dan disadap" : "Hanya untuk pengguna sah"}
          tone={
            diverted
              ? "border-hostile/60 text-hostile"
              : "border-line text-safe"
          }
        />
      </div>
      <h3 className="mb-2 mt-5 text-xs font-semibold text-ink-mute">
        Sesi penyerang aktif ({state.sessions.length})
      </h3>
      <ul className="max-h-48 space-y-1.5 overflow-y-auto">
        {state.sessions.length === 0 && (
          <li className="text-sm text-ink-mute">Belum ada sesi.</li>
        )}
        {state.sessions.map((s) => {
          const selected = s.session_id === selectedSessionId;
          return (
            <li key={s.session_id}>
              <button
                type="button"
                onClick={() => onSelectSession?.(s.session_id)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-3 rounded-sm border px-3 py-2 text-left text-sm ${
                  selected
                    ? "border-signal bg-panel-2"
                    : "border-line hover:border-ink-mute"
                }`}
              >
                <span className="font-data text-ink">{s.session_id}</span>
                <span className="font-data text-hostile">{s.threat_score}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
