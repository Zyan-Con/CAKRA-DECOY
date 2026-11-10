"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AlertPanel } from "@/components/command/AlertPanel";
import { IdentityPanel } from "@/components/command/IdentityPanel";
import { KodamMap } from "@/components/command/KodamMap";
import { MitrePanel } from "@/components/command/MitrePanel";
import { RadarPanel } from "@/components/command/RadarPanel";
import { StreamBadge } from "@/components/command/StreamBadge";
import { TerminalSpyPanel } from "@/components/command/TerminalSpyPanel";
import { GuideClosing } from "@/components/guide/GuideClosing";
import { GuideSidebar } from "@/components/guide/GuideSidebar";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { PortalFrame } from "@/components/portal/PortalFrame";
import { PortalLogin } from "@/components/portal/PortalLogin";
import type { PanelFocus } from "@/components/ui/Panel";
import { api } from "@/lib/api";
import { SQLI_CREDENTIALS, type CommandPanelId, type PortalControl } from "@/lib/attack-steps";
import { ownTamperTarget, type TacticalState } from "@/lib/tactical-state";
import { useAction } from "@/lib/useAction";
import { useGuide } from "@/lib/useGuide";
import { usePortalSession } from "@/lib/usePortalSession";
import { useTacticalState } from "@/lib/useTacticalState";

const ignore = () => undefined;

/** Selama WS belum tersambung atau panggung di-reset, semua kontrol portal ditahan. */
const WAITING_LOCK: Partial<Record<PortalControl, string>> = {
  login: "Menunggu koneksi…",
  terminal: "Menunggu koneksi…",
  radar: "Menunggu koneksi…",
  bait: "Menunggu koneksi…",
};

/** Urutan panel di kolom kanan. Alert dan peta Kodam selalu tampil (redup bila bukan fokus). */
const PANEL_ORDER: CommandPanelId[] = [
  "alert",
  "radar",
  "terminal",
  "mitre",
  "identity",
  "kodam",
];
const ALWAYS: CommandPanelId[] = ["alert", "kodam"];

function renderPanel(
  id: CommandPanelId,
  state: TacticalState,
  focus: PanelFocus,
): ReactNode {
  switch (id) {
    case "alert":
      return <AlertPanel key={id} state={state} focus={focus} />;
    case "radar":
      return <RadarPanel key={id} state={state} focus={focus} />;
    case "terminal":
      return <TerminalSpyPanel key={id} state={state} focus={focus} />;
    case "mitre":
      return <MitrePanel key={id} state={state} focus={focus} />;
    case "identity":
      return <IdentityPanel key={id} state={state} focus={focus} sample />;
    case "kodam":
      return <KodamMap key={id} state={state} focus={focus} />;
    default:
      return null;
  }
}

function PaneLabel({ tone, children }: { tone: string; children: ReactNode }) {
  return <p className={`mb-2 text-sm font-semibold ${tone}`}>{children}</p>;
}

export default function DemoPage() {
  const portal = usePortalSession();
  const sessionId = portal.auth?.session_token ?? null;
  const { state, status, log } = useTacticalState({ sessionId });
  const guide = useGuide(portal, log);
  const live = status === "live";
  const { notice, act } = useAction();
  const step = guide.step;
  const active = step?.panels ?? [];

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-auto">
            <h1 className="text-xl font-extrabold tracking-tight text-ink">
              Demo terpandu
            </h1>
            <p className="text-xs text-ink-mute">
              Ikuti tombol di panel pemandu. Lihat sebab di layar penyerang,
              akibatnya di ruang komando.
            </p>
          </div>
          <StreamBadge status={status} />
          <Link
            href="/command-center"
            className="text-sm font-semibold text-ink-soft underline-offset-4 hover:underline"
          >
            Mode bebas
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-6 min-[1100px]:grid-cols-[300px_minmax(0,1fr)_minmax(0,1fr)]">
        <GuideSidebar guide={guide} live={live} />

        <section aria-label="Layar penyerang" className="min-w-0">
          <PaneLabel tone="text-hostile">
            Layar penyerang · yang ia lihat
          </PaneLabel>
          <PortalFrame>
            {portal.auth ? (
              <PortalDashboard
                session={portal}
                baitMode="sample"
                locked={live && guide.state.phase !== "resetting" ? guide.locked : WAITING_LOCK}
                wrap={guide.wrap}
              />
            ) : (
              <PortalLogin
                key={guide.state.index}
                prefill={SQLI_CREDENTIALS}
                busy={portal.busy}
                error={portal.error}
                locked={
                  !live
                    ? "Menunggu koneksi ke ruang komando…"
                    : guide.state.phase === "resetting"
                      ? "Menyiapkan panggung demo…"
                      : guide.locked.login
                }
                onSubmit={(u, p) =>
                  void guide.wrap(() => portal.login(u, p)).catch(ignore)
                }
              />
            )}
          </PortalFrame>
        </section>

        <section aria-label="Ruang komando" className="min-w-0 space-y-4">
          <PaneLabel tone="text-safe">
            Ruang komando · yang kita lihat
          </PaneLabel>
          {step ? (
            PANEL_ORDER.filter(
              (id) => active.includes(id) || ALWAYS.includes(id),
            ).map((id) =>
              renderPanel(id, state, active.includes(id) ? "active" : "dim"),
            )
          ) : (
            <GuideClosing
              state={state}
              onTamper={() =>
                void act("Uji manipulasi", () =>
                  api.tamperTest(ownTamperTarget(state.ledger, sessionId) ?? 1),
                )
              }
              onRestore={() => void act("Pulihkan rantai", api.restoreLedger)}
              notice={notice}
              onExportPdf={() =>
                window.open(api.exportPdfUrl(sessionId ?? undefined), "_blank")
              }
              onRestart={() => void guide.restart()}
            />
          )}
        </section>
      </div>
    </main>
  );
}
