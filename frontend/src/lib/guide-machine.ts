/**
 * State machine mode guide (/demo). Murni: tidak tahu API, WebSocket, atau timer.
 * index 0..4 = langkah, CLOSING_INDEX = layar penutup.
 */
export type GuidePhase =
  | "ready"
  | "running"
  | "awaiting"
  | "done"
  | "failed"
  | "not-diverted";

export interface GuideState {
  index: number;
  phase: GuidePhase;
  error: string | null;
}

export type GuideAction =
  | { type: "RUN" }
  | { type: "API_OK" }
  | { type: "API_FAIL"; error: string }
  | { type: "SATISFIED" }
  | { type: "TIMEOUT" }
  | { type: "NEXT" }
  | { type: "RESTART" };

/** Batas tunggu event WS setelah API sukses, sebelum langkah dinyatakan selesai (atau tidak dibelokkan). */
export const AWAIT_TIMEOUT_MS = 5000;
export const CLOSING_INDEX = 5;

export const initialGuideState: GuideState = {
  index: 0,
  phase: "ready",
  error: null,
};

export function reduceGuide(s: GuideState, a: GuideAction): GuideState {
  switch (a.type) {
    case "RUN":
      return s.phase === "ready" ||
        s.phase === "failed" ||
        s.phase === "not-diverted"
        ? { ...s, phase: "running", error: null }
        : s;
    case "API_OK":
      return s.phase === "running" ? { ...s, phase: "awaiting" } : s;
    case "API_FAIL":
      return s.phase === "running"
        ? { ...s, phase: "failed", error: a.error }
        : s;
    case "SATISFIED":
      return s.phase === "ready" ||
        s.phase === "running" ||
        s.phase === "awaiting"
        ? { ...s, phase: "done" }
        : s;
    case "TIMEOUT":
      // Langkah 1 hanya sah bila pembelokan terbukti lewat event; login bersih = tidak dibelokkan.
      if (s.phase !== "awaiting") return s;
      return { ...s, phase: s.index === 0 ? "not-diverted" : "done" };
    case "NEXT": {
      if (s.phase !== "done" || s.index >= CLOSING_INDEX) return s;
      const index = s.index + 1;
      return {
        index,
        phase: index === CLOSING_INDEX ? "done" : "ready",
        error: null,
      };
    }
    case "RESTART":
      return initialGuideState;
  }
}
