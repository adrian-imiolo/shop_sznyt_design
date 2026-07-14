import { describe, expect, it } from "vitest";
import { resolveE2eDatabaseUrl } from "./e2eDbUrl";

describe("resolveE2eDatabaseUrl", () => {
  it("uses E2E_DATABASE_URL when set", () => {
    const url = resolveE2eDatabaseUrl({
      E2E_DATABASE_URL: "postgresql://u:p@localhost:5432/shop_e2e",
    });
    expect(url).toBe("postgresql://u:p@localhost:5432/shop_e2e");
  });

  it("derives from DATABASE_URL by appending _e2e to the database name", () => {
    const url = resolveE2eDatabaseUrl({
      DATABASE_URL: "postgresql://u:p@localhost:5432/shop_sznyt_design",
    });
    expect(url).toBe("postgresql://u:p@localhost:5432/shop_sznyt_design_e2e");
  });

  it("prefers the explicit E2E_DATABASE_URL over derivation", () => {
    const url = resolveE2eDatabaseUrl({
      E2E_DATABASE_URL: "postgresql://u:p@localhost:5432/explicit_e2e",
      DATABASE_URL: "postgresql://u:p@localhost:5432/shop_sznyt_design",
    });
    expect(url).toBe("postgresql://u:p@localhost:5432/explicit_e2e");
  });

  it("refuses an explicit URL whose database name does not end in _e2e", () => {
    expect(() =>
      resolveE2eDatabaseUrl({
        E2E_DATABASE_URL: "postgresql://u:p@localhost:5432/shop_sznyt_design",
      }),
    ).toThrow(/_e2e/);
  });

  it("throws when neither variable is set", () => {
    expect(() => resolveE2eDatabaseUrl({})).toThrow(/E2E_DATABASE_URL/);
  });
});
