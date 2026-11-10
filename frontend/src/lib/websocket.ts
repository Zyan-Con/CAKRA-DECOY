"use client";

import { useEffect, useRef, useState } from "react";
import type { TacticalEnvelope } from "./types";

function resolveWsUrl(): string {
  // Production (browser): ws/wss otomatis mengikuti protokol & host aktif (same-origin via Caddy).
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}/ws/command-stream`;
  }

  // Development: backend lokal langsung.
  const explicit = process.env.NEXT_PUBLIC_BACKEND_WS_URL;
  if (explicit) {
    return explicit.replace(/^http/, "ws");
  }

  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//localhost:8000/ws/command-stream`;
  }

  return "ws://localhost:8000/ws/command-stream";
}

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
      if (disposed) {
        return;
      }

      const ws = new WebSocket(resolveWsUrl());
      socket = ws;

      ws.onopen = () => {
        attempts = 0;
        if (!disposed) {
          setStatus("live");
        }
      };

      ws.onmessage = (message: MessageEvent<string>) => {
        if (disposed) {
          return;
        }

        try {
          const env = JSON.parse(message.data) as TacticalEnvelope;
          handlerRef.current(env);
        } catch {
          // Abaikan payload yang tidak valid agar stream tidak crash.
        }
      };

      ws.onclose = () => {
        if (disposed) {
          return;
        }

        if (retryTimer) {
          clearTimeout(retryTimer);
        }

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
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return status;
}
