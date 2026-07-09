import { describe, expect, it } from "vitest";
import { renderOrderShipped } from "./renderOrderShipped.ts";

describe("renderOrderShipped", () => {
  const { subject, html, text } = renderOrderShipped({
    orderId: 13,
    trackingNumber: "620000123456789012345678",
    shippingMethod: "paczkomat",
  });

  it("has the shipped subject", () => {
    expect(subject).toContain("wysłane");
    expect(subject).toContain("Sznyt Design");
  });

  it.each(["html", "text"] as const)("includes key shipping data in %s", (channel) => {
    const output = channel === "html" ? html : text;
    expect(output).toContain("#13");
    expect(output).toContain("620000123456789012345678");
    expect(output).toContain("InPost Paczkomat"); // carrier
  });

  it("falls back to the raw shipping method for unknown carriers", () => {
    const { text: fallbackText } = renderOrderShipped({
      orderId: 1,
      trackingNumber: "ABC",
      shippingMethod: "poczta_polska",
    });
    expect(fallbackText).toContain("poczta_polska");
  });
});
