"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/lib/icon";
import type { ExecutionSource, SessionState, TerminalCommandExecuted } from "@/lib/types";

interface LiveTerminalSpyProps {
  history: TerminalCommandExecuted[];
  onCommand: (command: string) => void;
  session?: SessionState | null;
  busy?: boolean;
}

const SOURCE: Record<ExecutionSource, { tone: string; short: string }> = {
  VFS_DETERMINISTIC_ENGINE: { tone: "text-accent", short: "VFS" },
  LLM_CONTEXT_SHELL: { tone: "text-info", short: "LLM" },
  STATIC_FALLBACK: { tone: "text-warn", short: "FALLBACK" },
};

export default function LiveTerminalSpy({ history, onCommand, session, busy }: LiveTerminalSpyProps) {
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    onCommand(cmd);
    setInput("");
  };

  const prompt = session ? `ubuntu@srv-kodam-logistik-01:${session.cwd}$` : "ubuntu@srv-kodam-logistik-01:/opt/satcom$";

  return (
    <section className="card flex min-h-[360px] flex-col overflow-hidden p-0">
      <header className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
        </span>
        <Icon name="terminal-window" className="ml-1 h-4 w-4 text-accent" />
        <span className="text-[13px] font-semibold text-ink">Live Terminal Spy</span>
        <span className="font-mono text-[10px] text-ink-mute">· Kali Web-SSH intercept</span>
        <span className="ml-auto rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-mute">
          {session?.session_id ?? "NO_SESSION"}
        </span>
      </header>

      <div ref={bodyRef} className="flex-1 overflow-y-auto bg-surface px-4 py-3 font-mono text-xs">
        {history.length === 0 ? (
          <div className="text-ink-mute">Menyadap ketikan penyerang. Menunggu perintah.</div>
        ) : (
          history.map((h) => {
            const src = SOURCE[h.execution_source];
            return (
              <div key={h.command_id} className="mb-3">
                <div className="text-accent">{h.prompt}</div>
                <div className="text-ink">
                  <span className="text-ink-faint">$</span> {h.raw_input}
                </div>
                {h.simulated_output.split("\n").map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap break-all text-ink-soft">
                    {line}
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-mute">
                  <span className={src?.tone ?? "text-ink-mute"}>■ {src?.short ?? h.execution_source}</span>
                  <span>·</span>
                  <span>{(h.response_time_ms ?? 0).toFixed(2)} ms</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-border bg-surface-2 px-4 py-2.5">
        <span className="shrink-0 font-mono text-xs text-accent">{prompt}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-ink-faint disabled:opacity-50"
          placeholder="injeksikan perintah ke sesi penyerang..."
          spellCheck={false}
          aria-label="Input perintah terminal"
        />
        <span className="caret-blink font-mono text-xs text-accent">▋</span>
      </form>
    </section>
  );
}
