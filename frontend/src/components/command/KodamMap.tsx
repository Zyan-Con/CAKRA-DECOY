import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Panel, type PanelFocus } from "@/components/ui/Panel";
import { projectLatLng } from "@/lib/geo";
import type { TacticalState } from "@/lib/tactical-state";
import type { KodamStatus } from "@/lib/types";
import { INDONESIA_PATH } from "./indonesia-path";

const W = 960;
const H = 360;

const STATUS: Record<KodamStatus, { fill: string; label: string }> = {
  IMMUNE_PROTECTED: { fill: "#3DDC84", label: "Kebal" },
  UNDER_DECEPTION: { fill: "#FF4D4D", label: "Dalam jebakan" },
  STANDBY: { fill: "#8C9099", label: "Siaga" },
};

export interface KodamMapProps {
  state: TacticalState;
  focus?: PanelFocus;
  onBroadcast?: () => void;
  busy?: boolean;
}

export function KodamMap({ state, focus, onBroadcast, busy }: KodamMapProps) {
  const nodes = state.kodamNodes;
  const count = (s: KodamStatus) => nodes.filter((n) => n.status === s).length;
  const rule = state.broadcast?.generated_rule;

  return (
    <Panel eyebrow="Herd Immunity" title="Peta 15 Kodam" focus={focus}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="group"
        aria-label="Peta status Kodam se-Indonesia"
      >
        <path
          d={INDONESIA_PATH}
          fill="#13161A"
          stroke="#5A606B"
          strokeWidth={1.5}
        />
        {nodes.map((n) => {
          const { x, y } = projectLatLng(n.lat, n.lng, W, H);
          const st = STATUS[n.status];
          return (
            // Fokus keyboard / hover menampilkan nama satuan; label di kanan peta rata kanan agar tak terpotong.
            <g
              key={n.kodam_id}
              tabIndex={0}
              role="img"
              aria-label={`${n.name}: ${st.label}`}
              className="group cursor-default outline-none"
            >
              <circle
                cx={x}
                cy={y}
                r={9}
                fill={st.fill}
                stroke="#07080A"
                strokeWidth={3}
                className="group-focus-visible:stroke-[#FFB000]"
              />
              <text
                x={x}
                y={y - 18}
                textAnchor={x > W * 0.75 ? "end" : x < W * 0.15 ? "start" : "middle"}
                className="pointer-events-none fill-ink font-ui text-[26px] font-semibold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                stroke="#07080A"
                strokeWidth={6}
                paintOrder="stroke"
              >
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {(Object.keys(STATUS) as KodamStatus[]).map((s) => (
          <li key={s} className="flex items-center gap-2 text-ink-soft">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: STATUS[s].fill }}
              aria-hidden
            />
            {STATUS[s].label}:{" "}
            <span className="font-data text-ink">{count(s)}</span>
          </li>
        ))}
      </ul>
      {rule && (
        <div className="mt-4 rounded-sm border border-line bg-bg p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-safe">
            <Icon name="syringe-bold-duotone" className="h-4 w-4" /> Vaksin
            tersebar · {rule.rule_id}
          </p>
          <pre className="mt-2 whitespace-pre-wrap break-all font-data text-xs text-ink-soft">
            {rule.iptables_cmd}
          </pre>
        </div>
      )}
      {onBroadcast && (
        <Button className="mt-4 w-full" onClick={onBroadcast} disabled={busy}>
          <Icon name="syringe-bold-duotone" className="h-4 w-4" />
          Sebarkan vaksin ke Kodam
        </Button>
      )}
    </Panel>
  );
}
