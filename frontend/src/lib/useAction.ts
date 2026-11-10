"use client";

import { useCallback, useState } from "react";

/** Jalankan aksi API dengan status sibuk dan pesan gagal yang terlihat (bukan diam). */
export function useAction(): {
  busy: boolean;
  notice: string | null;
  act(label: string, fn: () => Promise<unknown>): Promise<void>;
} {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const act = useCallback(async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
    } catch (err) {
      setNotice(`${label} gagal: ${err instanceof Error ? err.message : "backend tidak merespons"}`);
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, notice, act };
}
