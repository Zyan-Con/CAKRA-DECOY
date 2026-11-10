import { expect, test } from "vitest";
import {
  SQLI_CREDENTIALS,
  STEP2_COMMAND,
  STEPS,
  findStepEvent,
  lockedControls,
  type StepContext,
} from "@/lib/attack-steps";
import type { EventType, TacticalEnvelope } from "@/lib/types";

const env = (
  event_type: EventType,
  session_id: string | null,
): TacticalEnvelope => ({
  schema_version: "2.0",
  event_id: "e",
  event_type,
  timestamp: "t",
  session_id,
  seq: 1,
  payload: {},
});

function recordingContext() {
  const calls: string[] = [];
  const ctx: StepContext = {
    login: async (u, p) => {
      calls.push(`login:${u}:${p}`);
      return "ses-x";
    },
    command: async (raw) => {
      calls.push(`command:${raw}`);
    },
    overrideRadar: async () => {
      calls.push("overrideRadar");
    },
    openBait: async () => {
      calls.push("openBait");
    },
    vaccinate: async () => {
      calls.push("vaccinate");
    },
  };
  return { ctx, calls };
}

test("STEPS ids in order masuk..divaksin", () => {
  expect(STEPS.map((s) => s.id)).toEqual([
    "masuk",
    "disadap",
    "sabotase",
    "dibongkar",
    "divaksin",
  ]);
});

test("findStepEvent matches own session only", () => {
  const log = [env("TERMINAL_COMMAND_EXECUTED", "B")];
  expect(findStepEvent(log, "disadap", "A")).toBe(false);
  expect(
    findStepEvent(
      [...log, env("TERMINAL_COMMAND_EXECUTED", "A")],
      "disadap",
      "A",
    ),
  ).toBe(true);
  expect(findStepEvent([env("INTERCEPTION_ALERT", "A")], "disadap", "A")).toBe(
    false,
  );
});

test("findStepEvent false for null session", () => {
  expect(findStepEvent([env("INTERCEPTION_ALERT", null)], "masuk", null)).toBe(
    false,
  );
});

test('dibongkar.after mentions "data contoh"', () => {
  expect(STEPS.find((s) => s.id === "dibongkar")?.after).toContain(
    "data contoh",
  );
});

test("each step.run calls exactly its context method", async () => {
  const expected = [
    `login:${SQLI_CREDENTIALS.username}:${SQLI_CREDENTIALS.password}`,
    `command:${STEP2_COMMAND}`,
    "overrideRadar",
    "openBait",
    "vaccinate",
  ];
  for (const [i, step] of STEPS.entries()) {
    const { ctx, calls } = recordingContext();
    await step.run(ctx);
    expect(calls).toEqual([expected[i]]);
  }
});

test("lockedControls leaves only the active step's control open", () => {
  expect(lockedControls(STEPS[2])).toEqual({
    login: "Dibuka di langkah 1",
    terminal: "Dibuka di langkah 2",
    bait: "Dibuka di langkah 4",
  });
  expect(Object.keys(lockedControls(STEPS[4]))).toHaveLength(4);
  expect(lockedControls(null)).toEqual({});
});
