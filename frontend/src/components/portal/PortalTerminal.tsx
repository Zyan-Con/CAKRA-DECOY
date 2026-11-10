"use client";

import { useState } from "react";
import type { TerminalCommandExecuted } from "@/lib/types";
import { cleanCommand } from "@/lib/terminal";

const QUICK_CMDS = [
  "whoami",
  "ls -la /opt/satcom",
  "cat /opt/satcom/kredensial_komando.env",
  "uname -a",
];
const DEFAULT_PROMPT = "ubuntu@srv-kodam-logistik-01:/opt/satcom$";

export interface PortalTerminalProps {
  history: TerminalCommandExecuted[];
  onCommand(raw: string): void;
  busy: boolean;
  locked?: string;
}

/** Konsol Web-SSH portal (palsu, dijawab VFS). Tampil polos seperti alat admin instansi. */
export function PortalTerminal({
  history,
  onCommand,
  busy,
  locked,
}: PortalTerminalProps) {
  const [command, setCommand] = useState("");
  const disabled = busy || !!locked;
  const prompt = history[history.length - 1]?.prompt ?? DEFAULT_PROMPT;

  return (
    <section className="rounded border border-gov-line bg-gov-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-line px-4 py-2.5">
        <h3 className="text-sm font-semibold">Konsol Web-SSH</h3>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CMDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              disabled={disabled}
              onClick={() => onCommand(cmd)}
              className="rounded border border-gov-line px-2 py-1 font-data text-xs text-gov-soft hover:border-gov-brand disabled:opacity-50"
            >
              {cmd}
            </button>
          ))}
        </div>
      </header>
      <div className="max-h-56 space-y-3 overflow-y-auto bg-[#0F172A] p-4 font-data text-sm text-[#E2E8F0]">
        {history.length === 0 && (
          <p className="text-[#94A3B8]">
            Sesi SSH aktif. Ketik perintah atau pilih pintasan.
          </p>
        )}
        {history.map((h) => (
          <div key={h.command_id}>
            <p className="text-[#7DD3FC]">
              {h.prompt} <span className="text-white">{h.raw_input}</span>
            </p>
            <pre className="mt-1 whitespace-pre-wrap break-all font-data text-sm text-[#CBD5E1]">
              {h.simulated_output}
            </pre>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cmd = cleanCommand(command);
          if (disabled || !cmd) return;
          onCommand(cmd);
          setCommand("");
        }}
        className="flex items-center gap-2 border-t border-gov-line px-4 py-2.5"
      >
        <span className="hidden shrink-0 font-data text-xs text-gov-soft sm:inline">
          {prompt}
        </span>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={disabled}
          aria-label="Perintah Web-SSH"
          placeholder={locked ?? "ketik perintah…"}
          spellCheck={false}
          className="min-w-0 flex-1 rounded-sm bg-transparent font-data text-sm placeholder:text-gov-soft disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded bg-gov-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Jalankan
        </button>
      </form>
    </section>
  );
}
