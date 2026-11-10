import { Panel, type PanelFocus } from "@/components/ui/Panel";
import type { TacticalState } from "@/lib/tactical-state";

export function AlertPanel({
  state,
  focus,
}: {
  state: TacticalState;
  focus?: PanelFocus;
}) {
  const al = state.alert;
  return (
    <Panel
      eyebrow="Opaque Silent Interceptor"
      title="Penyerang dibelokkan diam-diam"
      focus={focus}
    >
      {al ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-ink-mute">Skor ancaman</p>
            <p className="font-data text-4xl font-semibold text-hostile">
              {al.threat_score}
              <span className="text-lg text-ink-mute">/100</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-mute">Vektor serangan</p>
            <p className="mt-1 break-all font-data text-sm text-ink">
              {al.entry_vector}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-mute">Waktu pembelokan</p>
            <p className="font-data text-2xl font-semibold text-safe">
              {(al.interception_latency_ms ?? 0).toFixed(2)}
              <span className="text-sm text-ink-mute"> ms</span>
            </p>
          </div>
          <p className="text-sm text-ink-soft sm:col-span-3">
            Penyerang menerima respons login yang identik dengan pengguna sah,
            lalu diarahkan ke portal jebakan. Koneksinya tidak diputus, jadi ia
            tidak curiga.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-mute">
          Belum ada serangan yang dibelokkan.
        </p>
      )}
    </Panel>
  );
}
