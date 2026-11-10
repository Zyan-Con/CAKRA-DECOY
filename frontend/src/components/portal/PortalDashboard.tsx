"use client";

import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import type { PortalControl } from "@/lib/attack-steps";
import type { PortalSession } from "@/lib/usePortalSession";
import { PortalTerminal } from "./PortalTerminal";

export interface PortalDashboardProps {
  session: PortalSession;
  /** Kontrol yang dikunci + teks petunjuknya (mode guide). */
  locked?: Partial<Record<PortalControl, string>>;
  /** "real": tautan file umpan asli (mode bebas). "sample": simulasi dengan data contoh (/demo). */
  baitMode: "real" | "sample";
  /** Membungkus aksi agar mode guide tahu juri berinteraksi langsung. */
  wrap?: <T>(fn: () => Promise<T>) => Promise<T>;
}

const card = "rounded border border-gov-line bg-gov-card p-4";
const ignore = () => undefined;

export function PortalDashboard({
  session,
  locked = {},
  baitMode,
  wrap = (fn) => fn(),
}: PortalDashboardProps) {
  const { auth, portal, ot } = session;
  const temp =
    ot?.radar_cooling_temp_c ?? portal?.scada?.radar_cooling_temp_c ?? 34.0;
  const status = (
    ot?.cooling_status ??
    portal?.scada?.cooling_status ??
    "NOMINAL"
  ).replace(/_ILLUSION$/i, "");
  const overheat = temp > 60;
  const token = auth?.session_token ?? "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-gov-line bg-gov-card px-4 py-2.5 text-sm">
        <span>
          Masuk sebagai <strong>{auth?.operator_role}</strong>
        </span>
        <span className="text-xs text-gov-soft">
          Clearance {auth?.clearance_level}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className={card}>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon
              name="thermometer-bold-duotone"
              className="h-4 w-4 text-gov-brand"
            />
            Pendingin Radar Early-Warning
          </h3>
          <p
            className={`mt-3 font-data text-4xl font-semibold ${overheat ? "text-gov-alarm" : "text-gov-brand"}`}
          >
            {temp.toFixed(1)}°C
          </p>
          <p className="mt-1 text-sm text-gov-soft">
            Status PLC:{" "}
            <strong className={overheat ? "text-gov-alarm" : "text-gov-ink"}>
              {status}
            </strong>
          </p>
          {overheat && (
            <p
              role="alert"
              className="mt-3 rounded bg-[#FDECEC] px-3 py-2 text-sm text-gov-alarm"
            >
              Alarm kritis: generator radar overheat, otomasi pendingin gagal.
            </p>
          )}
          <button
            type="button"
            disabled={session.busy || !!locked.radar}
            onClick={() => wrap(session.overrideRadar).catch(ignore)}
            className="mt-4 w-full rounded border border-gov-alarm/40 px-3 py-2.5 text-sm font-medium text-gov-alarm hover:bg-[#FDECEC] disabled:opacity-50"
          >
            Override tegangan / matikan pendingin
          </button>
          {locked.radar && (
            <p className="mt-2 text-xs text-gov-soft">{locked.radar}</p>
          )}
        </section>

        <section className={card}>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon
              name="document-text-bold-duotone"
              className="h-4 w-4 text-gov-brand"
            />
            Berkas Darurat SATCOM
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded border border-gov-line p-3">
              <p className="font-medium">Akses_Darurat_Satelit_TNI.html</p>
              <p className="text-xs text-gov-soft">
                Konsol diagnostik darurat (offline bundle)
              </p>
              {baitMode === "real" ? (
                <a
                  href={api.honeytokenDownloadUrl(
                    "Akses_Darurat_Satelit_TNI.html",
                    token,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-gov-brand underline"
                >
                  Buka berkas
                </a>
              ) : (
                <button
                  type="button"
                  disabled={session.busy || !!locked.bait}
                  onClick={() => wrap(session.openBait).catch(ignore)}
                  className="mt-2 text-sm font-medium text-gov-brand underline disabled:no-underline disabled:opacity-50"
                >
                  Buka berkas
                </button>
              )}
              {locked.bait && (
                <p className="mt-1 text-xs text-gov-soft">{locked.bait}</p>
              )}
            </li>
            <li className="rounded border border-gov-line p-3">
              <p className="font-medium">kredensial_komando.env</p>
              <p className="text-xs text-gov-soft">
                Konfigurasi relay SATCOM (bearer token)
              </p>
              <a
                href={api.honeytokenDownloadUrl(
                  "kredensial_komando.env",
                  token,
                )}
                download="kredensial_komando.env"
                className="mt-2 inline-block text-sm font-medium text-gov-brand underline"
              >
                Unduh konfigurasi
              </a>
            </li>
          </ul>
        </section>
      </div>

      {(portal?.logistics?.length ?? 0) > 0 && (
        <section className={card}>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="box-bold-duotone" className="h-4 w-4 text-gov-brand" />
            Inventaris Logistik
          </h3>
          <ul className="mt-2 divide-y divide-gov-line text-sm">
            {portal?.logistics?.map((row) => (
              <li
                key={`${row.depot}-${row.item}`}
                className="flex justify-between py-2"
              >
                <span>{row.item}</span>
                <span className="font-data text-gov-soft">
                  {row.depot} · {row.stock}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PortalTerminal
        history={session.history}
        onCommand={(raw) => void wrap(() => session.command(raw)).catch(ignore)}
        busy={session.busy}
        locked={locked.terminal}
      />
    </div>
  );
}
