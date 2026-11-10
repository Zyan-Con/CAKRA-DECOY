"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
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
import { SAMPLE_LEAKED_IP, ownTamperTarget } from "@/lib/tactical-state";
import { useAutopilot } from "@/lib/useAutopilot";
import { useTacticalState } from "@/lib/useTacticalState";

export default function CommandCenterPage() {
  const { state, status } = useTacticalState(undefined);
  const autopilot = useAutopilot();
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const active =
    picked ?? autopilot.progress?.sessionId ?? state.latestSessionId;

  const act = useCallback(async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
    } catch (err) {
      setNotice(
        `${label} gagal: ${err instanceof Error ? err.message : "backend tidak merespons"}`,
      );
    } finally {
      setBusy(false);
    }
  }, []);

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
            onChange={autopilot.setEnabled}
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
            href="/target-portal"
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

        <div className="grid gap-4 lg:grid-cols-2">
          <AlertPanel state={state} />
          <RadarPanel state={state} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <AttackFlowPanel
            state={state}
            selectedSessionId={active}
            onSelectSession={setPicked}
          />
          <TerminalSpyPanel
            state={state}
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
            state={state}
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
            state={state}
            sample={state.honeytoken?.real_leaked_ip === SAMPLE_LEAKED_IP}
          />
          <MitrePanel state={state} />
          <LedgerPanel
            state={state}
            onTamper={() =>
              void act("Uji manipulasi", () =>
                api.tamperTest(ownTamperTarget(state.ledger, active) ?? 1),
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
