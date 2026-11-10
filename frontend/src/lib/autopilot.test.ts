import { expect, test } from "vitest";
import { runAutopilot, type AutopilotProgress } from "@/lib/autopilot";
import type { StepContext } from "@/lib/attack-steps";

function harness(opts: { failOn?: keyof StepContext } = {}) {
  const calls: string[] = [];
  let contexts = 0;
  let resets = 0;
  const controller = new AbortController();
  const makeContext = () => {
    contexts += 1;
    let token: string | null = null;
    const act = (name: keyof StepContext) => async () => {
      calls.push(name);
      if (opts.failOn === name) throw new Error("Backend 500");
    };
    return {
      sessionId: () => token,
      login: async () => {
        calls.push("login");
        token = `ses-${contexts}`;
        return token;
      },
      command: act("command"),
      overrideRadar: act("overrideRadar"),
      openBait: act("openBait"),
      vaccinate: act("vaccinate"),
    };
  };
  const sleep = async (_ms: number, signal: AbortSignal) => {
    if (signal.aborted) return;
  };
  return {
    calls,
    controller,
    counts: () => ({ contexts, resets }),
    deps: (onProgress: (p: AutopilotProgress) => void) => ({
      signal: controller.signal,
      makeContext,
      reset: async () => {
        resets += 1;
      },
      onProgress,
      sleep,
    }),
  };
}

test("runs reset then 5 steps in order with fresh context per round", async () => {
  const h = harness();
  await runAutopilot(
    h.deps((p) => {
      if (p.round === 2 && p.stepIndex === 0) h.controller.abort();
    }),
  );
  expect(h.counts()).toEqual({ contexts: 2, resets: 2 });
  expect(h.calls.slice(0, 5)).toEqual([
    "login",
    "command",
    "overrideRadar",
    "openBait",
    "vaccinate",
  ]);
  expect(h.calls).toHaveLength(5);
});

test("abort before next step stops without further calls", async () => {
  const h = harness();
  await expect(
    runAutopilot(
      h.deps((p) => {
        if (p.stepIndex === 2) h.controller.abort();
      }),
    ),
  ).resolves.toBeUndefined();
  expect(h.calls).toEqual(["login", "command"]);
});

test("action failure rejects and stops loop", async () => {
  const h = harness({ failOn: "overrideRadar" });
  await expect(runAutopilot(h.deps(() => {}))).rejects.toThrow("Backend 500");
  expect(h.calls).not.toContain("openBait");
});
