"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertPanel } from "@/components/command/AlertPanel";
import { AttackFlowPanel } from "@/components/command/AttackFlowPanel";
import { AutopilotToggle } from "@/components/command/AutopilotToggle";
import { IdentityPanel } from "@/components/command/IdentityPanel";
import { KodamMap } from "@/components/command/KodamMap";
import { LedgerPanel } from "@/components/command/LedgerPanel";
import { MitrePanel } from "@/components/command/MitrePanel";
import { RadarPanel } from "@/components/command/RadarPanel";
import { TerminalSpyPanel } from "@/components/command/TerminalSpyPanel";
import { StreamBadge } from "@/components/command/StreamBadge";
import { api } from "@/lib/api";
import { SAMPLE_LEAKED_IP, deriveTactical, ownTamperTarget } from "@/lib/tactical-state";
import { useAction } from "@/lib/useAction";
import { useAutopilot } from "@/lib/useAutopilot";
import { useTacticalState } from "@/lib/useTacticalState";

export default function CommandCenterPage() {
  const { state, status, log } = useTacticalState(undefined);
  const autopilot = useAutopilot();
  const [picked, setPicked] = useState<string | null>(null);
  const { busy, notice, act } = useAction();

  const active = picked ?? autopilot.progress?.sessionId ?? state.latestSessionId;
  // Sesi yang dipilih: panel ikut menampilkan data sesi itu saja. Daftar sesi tetap global.
  const view = useMemo(() => (picked ? deriveTactical(log, { sessionId: picked }) : state), [picked, log, state]);
  const toggleAutopilot = (v: boolean) => {
    setPicked(null);
    autopilot.setEnabled(v);
  };

  return (
    <main className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-auto">
            <h1 className="text-xl font-extrabold tracking-tight text-ink">
              Ruang Komando
            </h1>
            <p className="text-xs text-ink-mute">
              CAKRA-DECOY · C4ISR Command Center
            </p>
          </div>
          <StreamBadge status={status} />
          <AutopilotToggle
            enabled={autopilot.enabled}
            onChange={toggleAutopilot}
            progress={autopilot.progress}
            error={autopilot.error}
          />
          <Link
            href="/demo"
            className="flex min-h-[44px] items-center rounded-sm bg-signal px-4 text-sm font-semibold text-bg hover:brightness-110"
          >
            Demo terpandu
          </Link>
          <Link
            href="/target-portal?panel=1"
            className="flex min-h-[44px] items-center rounded-sm border border-line px-4 text-sm font-semibold text-ink hover:border-ink-mute"
          >
            Portal penyerang
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-6">
        {notice && (
          <p
            role="alert"
            className="rounded-sm border border-hostile/60 px-4 py-3 text-sm text-hostile"
          >
            {notice}
          </p>
        )}
        {!state.alert && !autopilot.enabled && (
          <p className="rounded-sm border border-line bg-panel px-4 py-3 text-sm text-ink-soft">
            Belum ada serangan. Nyalakan{" "}
            <strong className="text-ink">Penyerang otomatis</strong> untuk
            menonton sistem bekerja, atau buka{" "}
            <Link href="/demo" className="font-semibold text-signal underline">
              demo terpandu
            </Link>
            .
          </p>
        )}

        {picked && (
          <p className="flex flex-wrap items-center gap-3 rounded-sm border border-signal/60 bg-panel px-4 py-3 text-sm text-ink-soft">
            Menampilkan sesi <span className="font-data text-ink">{picked}</span> saja.
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="font-semibold text-signal underline-offset-4 hover:underline"
            >
              Tampilkan semua sesi
            </button>
          </p>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <AlertPanel state={view} />
          <RadarPanel state={view} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <AttackFlowPanel
            state={state}
            selectedSessionId={active}
            onSelectSession={(id) => setPicked((cur) => (cur === id ? null : id))}
          />
          <TerminalSpyPanel
            state={view}
            onCommand={
              active
                ? (raw) =>
                    void act("Suntik perintah", () =>
                      api.sysConsole(active, raw),
                    )
                : undefined
            }
          />
          <KodamMap
            state={view}
            busy={busy}
            onBroadcast={
              active
                ? () => void act("Vaksin", () => api.immunityBroadcast(active))
                : undefined
            }
          />
        </div>

        <h2 className="pt-4 text-sm font-semibold text-ink-mute">
          Lapis bukti
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <IdentityPanel
            state={view}
            sample={view.honeytoken?.real_leaked_ip === SAMPLE_LEAKED_IP}
          />
          <MitrePanel state={view} />
          <LedgerPanel
            state={view}
            onTamper={() =>
              void act("Uji manipulasi", () =>
                api.tamperTest(ownTamperTarget(view.ledger, active) ?? 1),
              )
            }
            onRestore={() => void act("Pulihkan rantai", api.restoreLedger)}
            onExportPdf={() =>
              window.open(api.exportPdfUrl(active ?? undefined), "_blank")
            }
          />
        </div>
      </div>
    </main>
  );
}
