/**
 * Penyerang otomatis: menjalankan 5 langkah STEPS lewat API sungguhan, berulang, sampai dibatalkan.
 * Pengganti DEMO_EMITTER lama (yang hanya memutar ulang event palsu tanpa lewat sistem).
 */
import { STEPS, type StepContext } from "@/lib/attack-steps";

export const AUTOPILOT_STEP_DELAY_MS = 3000;
export const AUTOPILOT_ROUND_PAUSE_MS = 20000;

export interface AutopilotProgress {
  round: number;
  stepIndex: number;
  sessionId: string | null;
}

export interface AutopilotDeps {
  signal: AbortSignal;
  makeContext: () => StepContext & { sessionId(): string | null };
  reset: () => Promise<unknown>;
  onProgress: (p: AutopilotProgress) => void;
  /** Harus selesai cepat saat signal dibatalkan. */
  sleep: (ms: number, signal: AbortSignal) => Promise<void>;
}

/**
 * Resolve saat dibatalkan; reject dengan error aslinya saat satu aksi gagal.
 * Setelah abort tidak ada progress maupun error yang dilaporkan: run lama tidak boleh menimpa status run baru.
 */
export async function runAutopilot({
  signal,
  makeContext,
  reset,
  onProgress,
  sleep,
}: AutopilotDeps): Promise<void> {
  try {
    for (let round = 1; !signal.aborted; round += 1) {
      await reset();
      const ctx = makeContext();
      for (const [stepIndex, step] of STEPS.entries()) {
        if (signal.aborted) return;
        onProgress({ round, stepIndex, sessionId: ctx.sessionId() });
        if (signal.aborted) return;
        await step.run(ctx);
        await sleep(AUTOPILOT_STEP_DELAY_MS, signal);
      }
      await sleep(AUTOPILOT_ROUND_PAUSE_MS, signal);
    }
  } catch (err) {
    if (signal.aborted) return;
    throw err;
  }
}

export function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}
