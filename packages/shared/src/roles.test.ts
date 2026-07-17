import { describe, expect, it } from "vitest";
import { ADMIN_ROLE, isAdminRole } from "./roles.ts";

describe("isAdminRole", () => {
  it("accepts the canonical admin role value", () => {
    expect(isAdminRole(ADMIN_ROLE)).toBe(true);
    expect(isAdminRole("admin")).toBe(true);
  });

  it("rejects other roles and non-string claims", () => {
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole("Admin")).toBe(false);
    expect(isAdminRole("")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(0)).toBe(false);
    expect(isAdminRole({ role: "admin" })).toBe(false);
  });
});
