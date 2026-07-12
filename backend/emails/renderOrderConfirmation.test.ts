import { describe, expect, it } from "vitest";
import { renderOrderConfirmation } from "./renderOrderConfirmation.ts";
import type { OrderEmailData } from "./types.ts";

const sampleOrder: OrderEmailData = {
  orderId: 42,
  items: [
    { name: "Ramka Dębowa 30×40", quantity: 2, unitPrice: 149 },
    { name: "Dostawa — InPost Paczkomat", quantity: 1, unitPrice: 20 },
  ],
  total: 318,
  shippingMethod: "paczkomat",
  shippingAddress: {
    firstName: "Jan",
    lastName: "Kowalski",
    code: "WAW123",
    name: "ul. Testowa 1",
    street: "ul. Domowa 5/7",
    postalCode: "00-001",
    city: "Warszawa",
    phone: "600100200",
    email: "jan@example.com",
  },
  paymentMethod: "blik",
  customerEmail: "jan@example.com",
  note: null,
};

describe("renderOrderConfirmation", () => {
  const { subject, html, text } = renderOrderConfirmation(sampleOrder);

  it("includes the order id in the subject", () => {
    expect(subject).toContain("#42");
  });

  it.each(["html", "text"] as const)("includes key order data in %s", (channel) => {
    const output = channel === "html" ? html : text;
    expect(output).toContain("#42");
    expect(output).toContain("Ramka Dębowa 30×40");
    expect(output).toContain("2"); // quantity
    expect(output).toContain("149,00 PLN"); // unit price
    expect(output).toContain("318,00 PLN"); // grand total
    expect(output).toContain("Jan Kowalski");
    expect(output).toContain("WAW123");
    expect(output).toContain("00-001 Warszawa");
    expect(output).toContain("InPost Paczkomat");
    expect(output).toContain("BLIK");
  });

  it.each(["html", "text"] as const)("echoes the customer note in %s", (channel) => {
    const rendered = renderOrderConfirmation({
      ...sampleOrder,
      note: "Proszę zostawić u sąsiada",
    });
    const output = channel === "html" ? rendered.html : rendered.text;
    expect(output).toContain("Uwagi do zamówienia");
    expect(output).toContain("Proszę zostawić u sąsiada");
  });

  it("omits the note section when the order has none", () => {
    expect(html).not.toContain("Uwagi do zamówienia");
    expect(text).not.toContain("Uwagi do zamówienia");
  });

  it("escapes HTML in the customer note", () => {
    const { html: noteHtml } = renderOrderConfirmation({
      ...sampleOrder,
      note: `<script>alert("x")</script>`,
    });
    expect(noteHtml).not.toContain("<script>");
    expect(noteHtml).toContain("&lt;script&gt;");
  });

  it("escapes HTML in user-controlled fields", () => {
    const { html: escapedHtml } = renderOrderConfirmation({
      ...sampleOrder,
      items: [{ name: `Ramka <script>alert("x")</script>`, quantity: 1, unitPrice: 100 }],
    });
    expect(escapedHtml).not.toContain("<script>");
    expect(escapedHtml).toContain("&lt;script&gt;");
  });
});
