"use client";

import { useState } from "react";
import { Panel, type PanelFocus } from "@/components/ui/Panel";
import type { TacticalState } from "@/lib/tactical-state";
import { cleanCommand } from "@/lib/terminal";

export interface TerminalSpyPanelProps {
  state: TacticalState;
  focus?: PanelFocus;
  /** Bila ada: operator bisa menyuntik perintah ke sesi penyerang. */
  onCommand?: (raw: string) => void;
}

export function TerminalSpyPanel({
  state,
  focus,
  onCommand,
}: TerminalSpyPanelProps) {
  const [command, setCommand] = useState("");
  const history = state.terminalHistory;
  return (
    <Panel
      eyebrow="Chameleon Mirror-Twin · VFS"
      title="Setiap ketikan penyerang terlihat"
      focus={focus}
    >
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-sm border border-line bg-bg p-4 font-data text-sm">
        {history.length === 0 && (
          <p className="text-ink-mute">Menunggu perintah dari penyerang…</p>
        )}
        {history.map((h) => (
          <div key={h.command_id}>
            <p className="break-words text-safe">
              {h.prompt} <span className="text-ink">{h.raw_input}</span>
            </p>
            <pre className="mt-1 whitespace-pre-wrap break-all font-data text-sm text-ink-soft">
              {h.simulated_output}
            </pre>
          </div>
        ))}
      </div>
      {onCommand && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const cmd = cleanCommand(command);
            if (!cmd) return;
            onCommand(cmd);
            setCommand("");
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            aria-label="Suntik perintah ke sesi penyerang"
            placeholder="Suntik perintah ke sesi penyerang…"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-sm border border-line bg-panel-2 px-3 py-2 font-data text-sm text-ink outline-none placeholder:text-ink-mute focus:border-signal"
          />
        </form>
      )}
    </Panel>
  );
}
