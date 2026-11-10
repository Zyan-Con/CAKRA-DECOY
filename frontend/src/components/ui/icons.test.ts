import { expect, test } from "vitest";
import names from "../../../scripts/icon-names.json";
import solarIcons from "@/lib/solar-icons.json";

test("subset uses the solar prefix", () => {
  expect(solarIcons.prefix).toBe("solar");
});

test.each(names)("subset contains %s with a non-empty body", (name) => {
  const icon = (solarIcons.icons as Record<string, { body: string }>)[name];
  expect(icon?.body.length ?? 0).toBeGreaterThan(0);
});
