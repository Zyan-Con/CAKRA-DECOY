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
  | "not-diverted"
  /** Panggung demo sedang di-reset; semua aksi ditahan. */
  | "resetting";

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
  | { type: "BACK" }
  | { type: "RESET_START" }
  | { type: "RESTART" };

/** Batas tunggu event WS setelah API sukses, sebelum langkah dinyatakan selesai (atau tidak dibelokkan). */
export const AWAIT_TIMEOUT_MS = 5000;
export const CLOSING_INDEX = 5;

export const initialGuideState: GuideState = {
  index: 0,
  phase: "ready",
  error: null,
};

/** Mundur hanya bila tidak ada aksi yang sedang berjalan, dan bukan di langkah pertama. */
export function canGoBack(s: GuideState): boolean {
  return s.index > 0 && s.phase !== "running" && s.phase !== "awaiting" && s.phase !== "resetting";
}

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
      // not-diverted termasuk: bukti pembelokan yang telat tiba tetap mengoreksi kesimpulan "login sah".
      return s.phase === "ready" ||
        s.phase === "running" ||
        s.phase === "awaiting" ||
        s.phase === "not-diverted"
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
    case "BACK":
      // Langkah sebelumnya sudah dijalankan: tampilkan hasilnya, jangan ulangi serangannya.
      return canGoBack(s) ? { index: s.index - 1, phase: "done", error: null } : s;
    case "RESET_START":
      return { ...s, phase: "resetting", error: null };
    case "RESTART":
      return initialGuideState;
  }
}
