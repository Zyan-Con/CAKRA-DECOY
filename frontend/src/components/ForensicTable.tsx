"use client";

import { useState } from "react";
import { Download, RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import type { ForensicBlock } from "@/lib/types";

interface ForensicTableProps {
  blocks: ForensicBlock[];
  onTamper: () => Promise<void>;
  onRestore: () => Promise<void>;
  onExportPdf: () => void;
}

function shortHash(hash: string) {
  return hash.slice(0, 16);
}

export default function ForensicTable({
  blocks,
  onTamper,
  onRestore,
  onExportPdf,
}: ForensicTableProps) {
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
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 lg:col-span-1">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Forensic Ledger
        </h2>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
            tampered
              ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {tampered ? "TAMPERED_CRITICAL" : "VALID_IMMUTABLE"}
        </span>
      </header>

      <div className="max-h-64 overflow-auto rounded border border-slate-800">
        <table className="w-full font-mono text-[10px]">
          <thead className="sticky top-0 bg-slate-900">
            <tr className="text-left text-slate-500">
              <th className="px-2 py-2">BLK</th>
              <th className="px-2 py-2">ACTION</th>
              <th className="px-2 py-2">HASH</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr
                key={b.block_index}
                className="border-t border-slate-800 text-slate-300"
              >
                <td className="px-2 py-2">{b.block_index}</td>
                <td className="px-2 py-2 text-slate-400">{b.action_summary}</td>
                <td className="px-2 py-2 text-slate-500">{shortHash(b.current_hash)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => run(onTamper)}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 rounded border border-rose-500/40 bg-rose-500/10 px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
        >
          <ShieldX className="h-3 w-3" />
          Tamper-Test
        </button>
        <button
          onClick={() => run(onRestore)}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <RefreshCw className="h-3 w-3" />
          Restore
        </button>
      </div>
      <button
        onClick={onExportPdf}
        disabled={busy}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-sky-500/40 bg-sky-500/10 px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-sky-300 transition hover:bg-sky-500/20 disabled:opacity-50"
      >
        <Download className="h-3 w-3" />
        Export DFIR PDF
      </button>
    </section>
  );
}
