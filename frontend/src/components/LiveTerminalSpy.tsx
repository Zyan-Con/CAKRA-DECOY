"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Terminal } from "lucide-react";
import type { SessionState, TerminalCommandExecuted } from "@/lib/types";

interface LiveTerminalSpyProps {
  history: TerminalCommandExecuted[];
  onCommand: (command: string) => void;
  session?: SessionState | null;
}

export default function LiveTerminalSpy({
  history,
  onCommand,
  session,
}: LiveTerminalSpyProps) {
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

  return (
    <section className="flex min-h-[420px] flex-col rounded-lg border border-slate-800 bg-slate-900/60 lg:col-span-3">
      <header className="flex items-center gap-2 rounded-t-lg border-b border-slate-800 bg-slate-900 px-3 py-2">
        <Terminal className="h-3.5 w-3.5 text-emerald-500" />
        <span className="font-mono text-xs text-slate-300">
          KALI_LINUX_WEB_SSH // ATTACKER_TERMINAL
        </span>
        <span className="ml-auto font-mono text-[10px] text-slate-500">
          {session?.session_id ?? "NO_SESSION"}
        </span>
      </header>

      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-3 py-3 font-mono text-xs"
      >
        {history.length === 0 && (
          <div className="text-slate-600">// menunggu perintah dari penyerang...</div>
        )}
        {history.map((h) => (
          <div key={h.command_id} className="mb-3">
            <div className="text-emerald-400/90">{h.prompt}</div>
            <div className="text-slate-200">$ {h.raw_input}</div>
            {h.simulated_output.split("\n").map((line, i) => (
              <div key={i} className="whitespace-pre-wrap text-slate-400">
                {line}
              </div>
            ))}
            <div className="mt-1 text-[10px] text-slate-600">
              {h.execution_source} • {(h.response_time_ms ?? 0).toFixed(1)}ms
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-slate-800 bg-slate-950/80 px-3 py-2"
      >
        <span className="font-mono text-xs text-emerald-400">
          {session
            ? `ubuntu@srv-kodam-logistik-01:${session.cwd}$`
            : "ubuntu@srv-kodam-logistik-01:/opt/satcom$"}
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent font-mono text-xs text-slate-200 outline-none placeholder:text-slate-600"
          placeholder="ketik perintah attacker..."
          spellCheck={false}
        />
      </form>
    </section>
  );
}
