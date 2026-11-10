"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { STEPS } from "@/lib/attack-steps";
import type { AutopilotProgress } from "@/lib/autopilot";

export const AUTOPILOT_EXPLANATION =
  "Penyerang otomatis menjalankan serangan sungguhan ke sistem ini: login SQLi, perintah terminal, sabotase radar, membuka file umpan (data contoh), dan memicu vaksin. Semuanya melewati detektor, ledger, dan peta Kodam seperti serangan asli, supaya kamu bisa menonton Command Center bekerja tanpa menyerang sendiri.";

export interface AutopilotToggleProps {
  enabled: boolean;
  onChange(v: boolean): void;
  progress: AutopilotProgress | null;
  error: string | null;
}

export function AutopilotToggle({
  enabled,
  onChange,
  progress,
  error,
}: AutopilotToggleProps) {
  const [open, setOpen] = useState(false);
  const infoId = useId();
  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className="flex min-h-[44px] items-center gap-3 rounded-sm border border-line bg-panel-2 px-3 text-sm font-semibold text-ink hover:border-ink-mute"
      >
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? "bg-signal" : "bg-line"}`}
          aria-hidden
        >
          <span
            className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-ink transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </span>
        Penyerang otomatis
      </button>
      <button
        type="button"
        aria-label="Apa itu penyerang otomatis?"
        aria-expanded={open}
        aria-controls={infoId}
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-sm border border-line text-ink-soft hover:border-ink-mute"
      >
        <Icon name="info-circle-bold-duotone" className="h-5 w-5" />
      </button>
      {enabled && progress && (
        <span className="text-sm text-signal" aria-live="polite">
          Berjalan · langkah {progress.stepIndex + 1}/{STEPS.length} (
          {STEPS[progress.stepIndex]?.title}) · putaran {progress.round}
        </span>
      )}
      {error && (
        <span role="alert" className="text-sm text-hostile">
          Berhenti: {error}
        </span>
      )}
      {open && (
        <p
          id={infoId}
          className="absolute right-0 top-full z-20 mt-2 w-[min(28rem,calc(100vw-2rem))] rounded-sm border border-line bg-panel-2 p-4 text-sm leading-relaxed text-ink-soft shadow-xl"
        >
          {AUTOPILOT_EXPLANATION}
        </p>
      )}
    </div>
  );
}
