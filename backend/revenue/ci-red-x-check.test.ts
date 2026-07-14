// Deliberately failing test — verifies the CI gate turns red (#109).
// This commit gets reverted immediately after the red X is confirmed.
import { describe, it, expect } from "vitest";

describe("CI red-X verification", () => {
  it("fails on purpose", () => {
    expect(true).toBe(false);
  });
});
