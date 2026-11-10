import { Panel, type PanelFocus } from "@/components/ui/Panel";
import type { TacticalState } from "@/lib/tactical-state";

const REAL_DEFAULT_C = 34.0;

/** Momen kunci: ilusi di layar penyerang vs kondisi asli, berdampingan. */
export function RadarPanel({
  state,
  focus,
}: {
  state: TacticalState;
  focus?: PanelFocus;
}) {
  const ot = state.ot;
  return (
    <Panel
      eyebrow="Ilusi kendali OT/SCADA"
      title="Radar: ilusi vs asli"
      focus={focus}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-sm border border-line bg-panel-2 p-4 shadow-[inset_3px_0_0_#FF4D4D]">
          <p className="text-xs font-semibold text-hostile">
            Yang dilihat penyerang
          </p>
          <p className="mt-2 font-data text-3xl font-semibold text-hostile sm:text-4xl">
            {ot ? `${ot.decoy_radar_temp_c.toFixed(1)}°C` : "—"}
          </p>
          <p className="mt-1 text-sm text-ink-mute">
            {ot ? "Overheat, kritis" : "Belum ada sabotase"}
          </p>
        </div>
        <div className="rounded-sm border border-line bg-panel-2 p-4 shadow-[inset_3px_0_0_#3DDC84]">
          <p className="text-xs font-semibold text-safe">Kondisi asli</p>
          <p className="mt-2 font-data text-3xl font-semibold text-safe sm:text-4xl">
            {(ot?.real_radar_temp_c ?? REAL_DEFAULT_C).toFixed(1)}°C
          </p>
          <p className="mt-1 text-sm text-ink-mute">Normal, tidak tersentuh</p>
        </div>
      </div>
      {ot && (
        <p className="mt-3 text-sm text-ink-soft">
          Perintah <span className="font-data text-ink">{ot.action}</span> ke{" "}
          <span className="font-data text-ink">{ot.target_system}</span> tidak
          pernah sampai ke radar.
        </p>
      )}
    </Panel>
  );
}
