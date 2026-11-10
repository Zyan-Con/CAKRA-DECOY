"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { api } from "@/lib/api";
import {
  STEPS,
  findStepEvent,
  lockedControls,
  type PortalControl,
  type StepDef,
} from "@/lib/attack-steps";
import {
  AWAIT_TIMEOUT_MS,
  CLOSING_INDEX,
  canGoBack,
  initialGuideState,
  reduceGuide,
  type GuideState,
} from "@/lib/guide-machine";
import type { TacticalEnvelope } from "@/lib/types";
import type { PortalSession } from "@/lib/usePortalSession";

export interface Guide {
  state: GuideState;
  step: StepDef | null;
  /** Peringatan kecil bila reset panggung gagal (demo tetap jalan). */
  warning: string | null;
  run(): Promise<void>;
  wrap<T>(fn: () => Promise<T>): Promise<T>;
  next(): void;
  /** Kembali ke langkah sebelumnya (hasilnya ditampilkan, tidak dijalankan ulang). */
  back(): void;
  canBack: boolean;
  restart(): Promise<void>;
  locked: Partial<Record<PortalControl, string>>;
}

/** Menghubungkan state machine guide dengan portal (aksi) dan log WS (bukti langkah selesai). */
export function useGuide(
  portal: PortalSession,
  log: readonly TacticalEnvelope[],
): Guide {
  const [state, dispatch] = useReducer(reduceGuide, initialGuideState);
  const [warning, setWarning] = useState<string | null>(null);
  const portalRef = useRef(portal);
  portalRef.current = portal;
  const step = state.index < CLOSING_INDEX ? STEPS[state.index] : null;
  const sessionId = portal.auth?.session_token ?? null;

  const wrap = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    dispatch({ type: "RUN" });
    try {
      const result = await fn();
      dispatch({ type: "API_OK" });
      return result;
    } catch (err) {
      dispatch({
        type: "API_FAIL",
        error: err instanceof Error ? err.message : "Aksi gagal.",
      });
      throw err;
    }
  }, []);

  const run = useCallback(async () => {
    if (!step) return;
    // Mengulang langkah 1 setelah login sah: mulai sesi penyerang yang baru.
    if (step.id === "masuk" && portalRef.current.auth)
      portalRef.current.logout();
    await wrap(() => step.run(portalRef.current)).catch(() => undefined);
  }, [step, wrap]);

  const restart = useCallback(async () => {
    setWarning(null);
    // Tahan semua aksi sampai reset selesai, supaya klik pertama tidak dihapus oleh logout di bawah.
    portalRef.current.logout();
    dispatch({ type: "RESET_START" });
    try {
      await api.demoReset();
    } catch {
      setWarning(
        "Panggung demo tidak bisa di-reset. Peta Kodam mungkin masih menampilkan hasil sebelumnya.",
      );
    }
    dispatch({ type: "RESTART" });
  }, []);

  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);

  useEffect(() => {
    void restart();
  }, [restart]);

  useEffect(() => {
    if (
      !step ||
      !(
        state.phase === "ready" ||
        state.phase === "running" ||
        state.phase === "awaiting" ||
        state.phase === "not-diverted"
      )
    )
      return;
    if (findStepEvent(log, step.id, sessionId)) dispatch({ type: "SATISFIED" });
  }, [log, sessionId, step, state.phase]);

  useEffect(() => {
    if (state.phase !== "awaiting") return;
    const timer = setTimeout(
      () => dispatch({ type: "TIMEOUT" }),
      AWAIT_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [state.phase, state.index]);

  const locked = useMemo(() => lockedControls(step), [step]);

  return { state, step, warning, run, wrap, next, back, canBack: canGoBack(state), restart, locked };
}
