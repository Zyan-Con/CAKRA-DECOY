"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  api,
  ApiError,
  type LoginResponse,
  type OtControlResponse,
  type PortalState,
} from "@/lib/api";
import type { ExecutionSource, TerminalCommandExecuted } from "@/lib/types";
import { cleanCommand } from "@/lib/terminal";

export interface PortalSession {
  auth: LoginResponse | null;
  portal: PortalState | null;
  ot: OtControlResponse | null;
  history: TerminalCommandExecuted[];
  busy: boolean;
  error: string | null;
  /** Reject (dan set error) saat gagal. */
  login(username: string, password: string): Promise<string>;
  command(raw: string): Promise<void>;
  overrideRadar(): Promise<void>;
  /** Simulasi membuka file umpan HTML, dengan data contoh. */
  openBait(): Promise<void>;
  vaccinate(): Promise<void>;
  logout(): void;
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof ApiError || err instanceof Error
    ? err.message
    : fallback;
}

/**
 * Sesi portal penyerang yang dipakai /target-portal dan layar kiri /demo.
 * Token disimpan di ref, jadi method selalu memakai sesi terbaru walau dipanggil dari closure lama.
 * Secara struktural memenuhi StepContext (lib/attack-steps).
 */
export function usePortalSession(): PortalSession {
  const [auth, setAuth] = useState<LoginResponse | null>(null);
  const [portal, setPortal] = useState<PortalState | null>(null);
  const [ot, setOt] = useState<OtControlResponse | null>(null);
  const [history, setHistory] = useState<TerminalCommandExecuted[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  const token = useCallback((): string => {
    if (!tokenRef.current) throw new Error("Belum login ke portal.");
    return tokenRef.current;
  }, []);

  const guarded = useCallback(
    async <T>(fn: () => Promise<T>, fallback: string): Promise<T> => {
      setBusy(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(messageOf(err, fallback));
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const login = useCallback(
    (username: string, password: string) =>
      guarded(async () => {
        setOt(null);
        setHistory([]);
        const res = await api.login(username, password);
        tokenRef.current = res.session_token;
        setAuth(res);
        setPortal(await api.portalState(res.session_token));
        return res.session_token;
      }, "Koneksi ke gateway logistik gagal. Pastikan server operasional."),
    [guarded],
  );

  const command = useCallback(
    (raw: string) =>
      guarded(async () => {
        const cmd = cleanCommand(raw);
        if (!cmd) throw new Error("Perintah kosong. Ketik perintah Linux terlebih dahulu.");
        const res = await api.sysConsole(token(), cmd);
        setHistory((prev) => [
          ...prev,
          {
            command_id: res.command_id || `cmd-${Date.now()}`,
            cwd: res.cwd,
            prompt: res.prompt,
            raw_input: cmd,
            simulated_output: res.output,
            execution_source:
              (res.execution_source as ExecutionSource) ||
              "VFS_DETERMINISTIC_ENGINE",
            response_time_ms: 0,
          },
        ]);
      }, "Perintah gagal dikirim."),
    [guarded, token],
  );

  const overrideRadar = useCallback(
    () =>
      guarded(async () => {
        setOt(
          await api.otControl(token(), "OVERRIDE_VOLTAGE", "RADAR_COOLING"),
        );
      }, "Perintah SCADA gagal dikirim."),
    [guarded, token],
  );

  const openBait = useCallback(
    () =>
      guarded(async () => {
        await api.triggerTelemetryBeacon(token());
      }, "File umpan gagal dibuka."),
    [guarded, token],
  );

  const vaccinate = useCallback(
    () =>
      guarded(async () => {
        await api.immunityBroadcast(token());
      }, "Vaksin gagal disebarkan."),
    [guarded, token],
  );

  const logout = useCallback(() => {
    tokenRef.current = null;
    setAuth(null);
    setPortal(null);
    setOt(null);
    setHistory([]);
    setError(null);
  }, []);

  return useMemo(
    () => ({
      auth,
      portal,
      ot,
      history,
      busy,
      error,
      login,
      command,
      overrideRadar,
      openBait,
      vaccinate,
      logout,
    }),
    [
      auth,
      portal,
      ot,
      history,
      busy,
      error,
      login,
      command,
      overrideRadar,
      openBait,
      vaccinate,
      logout,
    ],
  );
}
