"use client";

import { useCallback, useMemo, useState } from "react";
import {
  appendLog,
  deriveTactical,
  type TacticalScope,
  type TacticalState,
} from "@/lib/tactical-state";
import type { TacticalEnvelope } from "@/lib/types";
import { useTacticalStream, type StreamStatus } from "@/lib/websocket";

export function useTacticalState(scope: TacticalScope): {
  state: TacticalState;
  status: StreamStatus;
  log: readonly TacticalEnvelope[];
} {
  const [log, setLog] = useState<TacticalEnvelope[]>([]);
  const onEvent = useCallback(
    (env: TacticalEnvelope) => setLog((l) => appendLog(l, env)),
    [],
  );
  const status = useTacticalStream(onEvent);
  const scoped = scope !== undefined;
  const sessionId = scope?.sessionId ?? null;
  const state = useMemo(
    () => deriveTactical(log, scoped ? { sessionId } : undefined),
    [log, scoped, sessionId],
  );
  return { state, status, log };
}
