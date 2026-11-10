"use client";

import Link from "next/link";
import { LedgerPanel } from "@/components/command/LedgerPanel";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { STEPS } from "@/lib/attack-steps";
import type { TacticalState } from "@/lib/tactical-state";

export interface GuideClosingProps {
  state: TacticalState;
  onTamper(): void;
  onRestore(): void;
  onExportPdf(): void;
  onRestart(): void;
  /** Pesan gagal aksi ledger (tamper/restore), ditampilkan di bawah ledger. */
  notice?: string | null;
}

export function GuideClosing({
  state,
  onTamper,
  onRestore,
  onExportPdf,
  onRestart,
  notice,
}: GuideClosingProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-line bg-panel p-5">
        <h2 className="text-lg font-bold text-ink">Yang baru saja terjadi</h2>
        <ol className="mt-3 space-y-2">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className="flex items-start gap-2.5 text-sm text-ink-soft"
            >
              <Icon
                name="check-circle-bold-duotone"
                className="mt-0.5 h-4 w-4 shrink-0 text-safe"
              />
              <span>
                <span className="font-semibold text-ink">{s.title}.</span>{" "}
                {s.technical}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <LedgerPanel
        state={state}
        focus="active"
        onTamper={onTamper}
        onRestore={onRestore}
        onExportPdf={onExportPdf}
      />
      {notice && (
        <p role="alert" className="rounded-sm border border-hostile/60 px-4 py-3 text-sm text-hostile">
          {notice}
        </p>
      )}
      <p className="text-sm text-ink-soft">
        Coba <strong className="text-ink">Uji manipulasi</strong>: sistem
        langsung menemukan blok bukti yang diubah, lalu{" "}
        <strong className="text-ink">Pulihkan rantai</strong> mengembalikannya.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button onClick={onRestart}>
          <Icon name="restart-bold-duotone" className="h-4 w-4" /> Ulangi demo
        </Button>
        <Link
          href="/command-center"
          className="flex min-h-[44px] items-center justify-center rounded-sm border border-line text-sm font-semibold text-ink hover:border-ink-mute"
        >
          Buka mode bebas
        </Link>
      </div>
    </div>
  );
}
