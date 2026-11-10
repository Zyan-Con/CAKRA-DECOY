import { afterEach, expect, test, vi } from "vitest";
import { ApiError, api } from "@/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("network failure becomes a readable ApiError", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
  const err = await api.login("u", "p").catch((e: unknown) => e);
  expect(err).toBeInstanceOf(ApiError);
  expect((err as ApiError).message).toBe("Server tidak bisa dihubungi. Periksa koneksi, lalu coba lagi.");
});
