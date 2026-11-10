import { expect, test } from "vitest";
import { cleanCommand } from "@/lib/terminal";

test("blank input is not a command", () => {
  expect(cleanCommand("")).toBeNull();
  expect(cleanCommand("   \t ")).toBeNull();
});

test("command is trimmed", () => {
  expect(cleanCommand("  whoami \n")).toBe("whoami");
});
