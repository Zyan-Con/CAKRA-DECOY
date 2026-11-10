import { expect, test } from "vitest";
import {
  CLOSING_INDEX,
  initialGuideState,
  reduceGuide,
  type GuideAction,
  type GuideState,
} from "@/lib/guide-machine";

const run = (s: GuideState, ...actions: GuideAction[]) =>
  actions.reduce(reduceGuide, s);

test("happy path step: ready→running→awaiting→done→next", () => {
  const s = run(initialGuideState, { type: "RUN" }, { type: "API_OK" });
  expect(s.phase).toBe("awaiting");
  const done = reduceGuide(s, { type: "SATISFIED" });
  expect(done.phase).toBe("done");
  expect(reduceGuide(done, { type: "NEXT" })).toEqual({
    index: 1,
    phase: "ready",
    error: null,
  });
});

test("masuk timeout becomes not-diverted, not done", () => {
  const s = run(
    initialGuideState,
    { type: "RUN" },
    { type: "API_OK" },
    { type: "TIMEOUT" },
  );
  expect(s).toEqual({ index: 0, phase: "not-diverted", error: null });
  expect(reduceGuide(s, { type: "RUN" }).phase).toBe("running");
});

test("other step timeout becomes done", () => {
  const s = run(
    { index: 2, phase: "ready", error: null },
    { type: "RUN" },
    { type: "API_OK" },
    { type: "TIMEOUT" },
  );
  expect(s.phase).toBe("done");
});

test("api fail goes to failed with message, RUN retries", () => {
  const failed = run(
    initialGuideState,
    { type: "RUN" },
    { type: "API_FAIL", error: "Backend 500" },
  );
  expect(failed).toEqual({ index: 0, phase: "failed", error: "Backend 500" });
  expect(reduceGuide(failed, { type: "RUN" })).toEqual({
    index: 0,
    phase: "running",
    error: null,
  });
});

test("SATISFIED from ready completes step (direct pane interaction)", () => {
  expect(
    reduceGuide(
      { index: 1, phase: "ready", error: null },
      { type: "SATISFIED" },
    ).phase,
  ).toBe("done");
});

test("NEXT from step 4 reaches closing", () => {
  expect(
    reduceGuide({ index: 4, phase: "done", error: null }, { type: "NEXT" }),
  ).toEqual({
    index: CLOSING_INDEX,
    phase: "done",
    error: null,
  });
});

test("NEXT ignored unless done", () => {
  const s: GuideState = { index: 1, phase: "awaiting", error: null };
  expect(reduceGuide(s, { type: "NEXT" })).toBe(s);
});

test("RESTART resets", () => {
  expect(
    reduceGuide({ index: 3, phase: "failed", error: "x" }, { type: "RESTART" }),
  ).toEqual(initialGuideState);
});
