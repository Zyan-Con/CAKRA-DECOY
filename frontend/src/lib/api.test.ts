import { afterEach, expect, test, vi } from "vitest";
import { API_TIMEOUT_MS, ApiError, api } from "@/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("network failure becomes a readable ApiError", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
  const err = await api.login("u", "p").catch((e: unknown) => e);
  expect(err).toBeInstanceOf(ApiError);
  expect((err as ApiError).message).toBe("Server tidak bisa dihubungi. Periksa koneksi, lalu coba lagi.");
});

test("hung backend times out with a readable ApiError", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    ),
  );
  const pending = api.login("u", "p").catch((e: unknown) => e);
  await vi.advanceTimersByTimeAsync(API_TIMEOUT_MS);
  const err = await pending;
  vi.useRealTimers();
  expect(err).toBeInstanceOf(ApiError);
  expect((err as ApiError).message).toBe("Server tidak merespons. Coba lagi sebentar lagi.");
});
