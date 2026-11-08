"use client";

import { useEffect, useRef, useState } from "react";
import type { TacticalEnvelope } from "./types";

const WS_URL =
  (process.env.NEXT_PUBLIC_BACKEND_WS_URL ??
    "ws://localhost:8000/ws/command-stream").replace(/^http/, "ws");

export type StreamStatus = "connecting" | "live" | "reconnecting" | "offline";

/**
 * WebSocket client hook untuk /ws/command-stream (Unified C4ISR Telemetry).
 * - Auto-reconnect dengan exponential backoff.
 * - INITIAL_STATE_SYNC langsung diproses lewat callback (hydration F5-safe).
 * - Envelope flat: { schema_version, event_id, event_type, timestamp, session_id, seq, payload }.
 */
export function useTacticalStream(onEvent: (env: TacticalEnvelope) => void) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  const [status, setStatus] = useState<StreamStatus>("connecting");

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const connect = () => {
      if (disposed) return;
      const ws = new WebSocket(WS_URL);
      socket = ws;

      ws.onopen = () => {
        attempts = 0;
        if (!disposed) setStatus("live");
      };

      ws.onmessage = (message: MessageEvent<string>) => {
        if (disposed) return;
        try {
          const env = JSON.parse(message.data) as TacticalEnvelope;
          handlerRef.current(env);
        } catch {
          // abaikan payload yang tidak valid · jangan crash stream
        }
      };

      ws.onclose = () => {
        if (disposed) return;
        if (retryTimer) clearTimeout(retryTimer);
        const delay = Math.min(1000 * 2 ** attempts, 15000);
        attempts += 1;
        setStatus(attempts > 5 ? "offline" : "reconnecting");
        retryTimer = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (socket) socket.close();
    };
  }, []);

  return status;
}
