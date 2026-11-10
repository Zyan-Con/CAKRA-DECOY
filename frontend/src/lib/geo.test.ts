import { expect, test } from "vitest";
import { projectLatLng } from "@/lib/geo";

test("north-west corner maps to origin", () => {
  expect(projectLatLng(7, 94, 960, 360)).toEqual({ x: 0, y: 0 });
});

test("south-east corner maps to full size", () => {
  expect(projectLatLng(-11, 142, 960, 360)).toEqual({ x: 960, y: 360 });
});

test("jakarta lands in the west of java", () => {
  const p = projectLatLng(-6.2, 106.8, 960, 360);
  expect(p.x).toBeCloseTo(256, 0);
  expect(p.y).toBeCloseTo(264, 0);
});
