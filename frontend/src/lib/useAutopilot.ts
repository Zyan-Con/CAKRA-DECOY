"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { createApiStepContext } from "@/lib/attack-steps";
import {
  abortableSleep,
  runAutopilot,
  type AutopilotProgress,
} from "@/lib/autopilot";

/** Toggle penyerang otomatis. Berhenti saat dimatikan, tab disembunyikan, atau halaman ditutup. */
export function useAutopilot(): {
  enabled: boolean;
  setEnabled(v: boolean): void;
  progress: AutopilotProgress | null;
  error: string | null;
} {
  const [enabled, setEnabledState] = useState(false);
  const [progress, setProgress] = useState<AutopilotProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setEnabledState(false);
  }, []);

  const setEnabled = useCallback(
    (v: boolean) => {
      if (!v) return stop();
      if (controllerRef.current) return;
      const controller = new AbortController();
      controllerRef.current = controller;
      setEnabledState(true);
      setError(null);
      runAutopilot({
        signal: controller.signal,
        makeContext: createApiStepContext,
        reset: api.demoReset,
        onProgress: setProgress,
        sleep: abortableSleep,
      })
        .catch((err: unknown) =>
          setError(
            err instanceof Error ? err.message : "Penyerang otomatis gagal.",
          ),
        )
        .finally(() => {
          if (controllerRef.current === controller) stop();
        });
    },
    [stop],
  );

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      controllerRef.current?.abort();
    };
  }, [stop]);

  return { enabled, setEnabled, progress: enabled ? progress : null, error };
}
