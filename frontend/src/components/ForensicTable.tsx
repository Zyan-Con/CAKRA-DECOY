"use client";

import { useState } from "react";
import { Icon } from "@/lib/icon";
import type { ForensicBlock } from "@/lib/types";

interface ForensicTableProps {
  blocks: ForensicBlock[];
  onTamper: () => Promise<void>;
  onRestore: () => Promise<void>;
  onExportPdf: () => void;
}

export default function ForensicTable({ blocks, onTamper, onRestore, onExportPdf }: ForensicTableProps) {
  const [busy, setBusy] = useState(false);
  const tampered = blocks.some((b) => b.chain_integrity === "TAMPERED_CRITICAL");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card flex h-full flex-col p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <span className="eyebrow">Bukti Hukum</span>
          <h2 className="text-sm font-semibold text-ink">Forensic Ledger</h2>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
            tampered ? "border-danger/25 bg-danger-weak text-danger" : "border-accent-line bg-accent-weak text-accent-deep"
          }`}
        >
          <Icon name={tampered ? "seal-warning" : "seal-check"} className="h-3 w-3" />
          {tampered ? "TAMPERED" : "VALID"}
        </span>
      </header>

      <div className="flex-1 overflow-auto rounded-xl border border-border">
        <table className="w-full border-collapse font-mono text-[10px]">
          <thead className="sticky top-0 z-10 bg-surface-2 text-ink-mute">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium tracking-wider">#</th>
              <th className="px-3 py-2 font-medium tracking-wider">ACTION</th>
              <th className="px-3 py-2 font-medium tracking-wider">SHA-256</th>
            </tr>
          </thead>
          <tbody>
            {blocks.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-ink-mute">
                  Ledger kosong. Menunggu kejadian.
                </td>
              </tr>
            )}
            {blocks.map((b) => {
              const bad = b.chain_integrity === "TAMPERED_CRITICAL";
              return (
                <tr key={b.block_index} className={`border-t border-border ${bad ? "bg-danger-weak" : ""}`}>
                  <td className={`px-3 py-2 ${bad ? "text-danger" : "text-ink-mute"}`}>{b.block_index}</td>
                  <td className={`px-3 py-2 ${bad ? "text-danger" : "text-ink-soft"}`}>{b.action_summary}</td>
                  <td className="px-3 py-2">
                    <span className={bad ? "text-danger" : "text-ink-mute"}>{b.current_hash.slice(0, 14)}…</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => run(onTamper)}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-danger-weak px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-danger transition-colors hover:border-danger/50 disabled:opacity-50"
        >
          <Icon name="warning-octagon" className="h-3.5 w-3.5" />
          Tamper-Test
        </button>
        <button
          onClick={() => run(onRestore)}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent-line bg-accent-weak px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-accent-deep transition-colors hover:border-accent disabled:opacity-50"
        >
          <Icon name="seal-check" className="h-3.5 w-3.5" />
          Restore
        </button>
      </div>
      <button
        onClick={onExportPdf}
        disabled={busy}
        className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-2 py-2.5 font-mono text-[10px] uppercase tracking-wider text-white transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        <Icon name="download-simple" className="h-3.5 w-3.5" />
        Export Laporan DFIR (PDF)
      </button>
    </section>
  );
}
