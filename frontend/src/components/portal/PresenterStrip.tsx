"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { SQLI_CREDENTIALS } from "@/lib/attack-steps";
import type { PortalSession } from "@/lib/usePortalSession";

const CLEAN_CREDENTIALS = {
  username: "kopda_budi",
  password: "RahasiaKuat123",
};
const ignore = () => undefined;

/** Tombol pintas presenter (gaya taktis), jelas terpisah dari portal. Hanya tampil lewat ?panel=1. */
export function PresenterStrip({ session }: { session: PortalSession }) {
  const [note, setNote] = useState<string | null>(null);
  const token = session.auth?.session_token;

  const trigger = async (
    label: string,
    fn: (t: string) => Promise<unknown>,
  ) => {
    if (!token) return;
    try {
      await fn(token);
      setNote(`${label} terkirim. Lihat hasilnya di Command Center.`);
    } catch (err) {
      setNote(
        `${label} gagal: ${err instanceof Error ? err.message : "backend tidak merespons"}`,
      );
    }
  };

  return (
    <div className="border-b border-line bg-panel font-ui text-ink">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="mr-auto flex items-center gap-2 text-sm text-ink-soft">
          <Icon
            name="info-circle-bold-duotone"
            className="h-4 w-4 text-signal"
          />
          Panel demo · bukan bagian portal
        </span>
        <Button
          variant="ghost"
          onClick={() =>
            session
              .login(CLEAN_CREDENTIALS.username, CLEAN_CREDENTIALS.password)
              .catch(ignore)
          }
        >
          Login prajurit sah
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            session
              .login(SQLI_CREDENTIALS.username, SQLI_CREDENTIALS.password)
              .catch(ignore)
          }
        >
          Login penyerang (SQLi)
        </Button>
        {session.auth && (
          <>
            <Button
              variant="ghost"
              onClick={() =>
                trigger(
                  "Beacon WebRTC (data contoh)",
                  api.triggerTelemetryBeacon,
                )
              }
            >
              Picu beacon umpan
            </Button>
            <Button
              variant="ghost"
              onClick={() => trigger("Canary JWT", api.triggerCanaryToken)}
            >
              Picu canary JWT
            </Button>
            <Button
              variant="ghost"
              onClick={() => trigger("Debug ticket", api.triggerDebugTicket)}
            >
              Picu debug ticket
            </Button>
            <Button variant="ghost" onClick={session.logout}>
              Keluar
            </Button>
          </>
        )}
        <Link
          href="/command-center"
          className="text-sm font-semibold text-signal underline-offset-4 hover:underline"
        >
          Command Center →
        </Link>
      </div>
      {note && (
        <p className="mx-auto max-w-5xl px-4 pb-3 text-sm text-ink-soft">
          {note}
        </p>
      )}
    </div>
  );
}
