import { Icon } from "@/components/ui/Icon";
import { Panel, type PanelFocus } from "@/components/ui/Panel";
import type { TacticalState } from "@/lib/tactical-state";

export interface IdentityPanelProps {
  state: TacticalState;
  focus?: PanelFocus;
  /** true: data berasal dari beacon simulasi (data contoh), bukan perangkat sungguhan. */
  sample: boolean;
}

export function IdentityPanel({ state, focus, sample }: IdentityPanelProps) {
  const ht = state.honeytoken;
  return (
    <Panel
      eyebrow="Boomerang Honeytoken"
      title="Identitas penyerang terbongkar"
      focus={focus}
      action={
        ht && sample ? (
          <span className="rounded-sm border border-line px-2 py-1 text-xs font-semibold text-ink-soft">
            Data contoh
          </span>
        ) : undefined
      }
    >
      {ht ? (
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-mute">IP yang terlihat (proxy)</dt>
            <dd className="font-data text-ink-soft">{ht.apparent_proxy_ip}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-mute">IP asli</dt>
            <dd className="font-data text-lg font-semibold text-hostile">
              {ht.real_leaked_ip}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-ink-mute">
              <Icon name="map-point-bold-duotone" className="h-3.5 w-3.5" />{" "}
              Lokasi (tingkat kota)
            </dt>
            <dd className="text-ink">{ht.geo_location.city}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-ink-mute">
              <Icon name="cpu-bold-duotone" className="h-3.5 w-3.5" /> Perangkat
            </dt>
            <dd className="break-words text-ink">
              {ht.device_fingerprint?.gpu_renderer ?? "—"}
            </dd>
          </div>
          <p className="text-xs text-ink-mute sm:col-span-2">
            Dari file umpan{" "}
            <span className="font-data">{ht.token_filename}</span>. Lokasi dari
            IP hanya akurat sampai tingkat kota.
          </p>
        </dl>
      ) : (
        <p className="text-sm text-ink-mute">
          Belum ada file umpan yang dibuka penyerang.
        </p>
      )}
    </Panel>
  );
}
