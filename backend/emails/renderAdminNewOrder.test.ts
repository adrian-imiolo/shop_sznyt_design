import { describe, expect, it } from "vitest";
import { renderAdminNewOrder } from "./renderAdminNewOrder.ts";
import type { OrderEmailData } from "./types.ts";

const sampleOrder: OrderEmailData = {
  orderId: 7,
  items: [
    { name: "Ramka Orzechowa 21×30", quantity: 1, unitPrice: 189 },
    { name: "Dostawa — DPD Kurier", quantity: 1, unitPrice: 25 },
  ],
  total: 214,
  shippingMethod: "dpd",
  shippingAddress: {
    firstName: "Anna",
    lastName: "Nowak",
    street: "ul. Lipowa 12",
    postalCode: "30-002",
    city: "Kraków",
    phone: "500600700",
    email: "anna@example.com",
  },
  paymentMethod: "card",
  customerEmail: "anna@example.com",
  note: null,
};

describe("renderAdminNewOrder", () => {
  const { subject, html, text } = renderAdminNewOrder(sampleOrder);

  it("includes order id and total in the subject", () => {
    expect(subject).toContain("#7");
    expect(subject).toContain("214,00 PLN");
  });

  it.each(["html", "text"] as const)("includes key order data in %s", (channel) => {
    const output = channel === "html" ? html : text;
    expect(output).toContain("#7");
    expect(output).toContain("anna@example.com"); // customer email
    expect(output).toContain("Ramka Orzechowa 21×30");
    expect(output).toContain("189,00 PLN");
    expect(output).toContain("214,00 PLN");
    expect(output).toContain("Anna Nowak");
    expect(output).toContain("ul. Lipowa 12");
    expect(output).toContain("30-002 Kraków");
    expect(output).toContain("DPD Kurier");
    expect(output).toContain("Karta płatnicza");
  });

  it.each(["html", "text"] as const)("shows the customer note in %s", (channel) => {
    const rendered = renderAdminNewOrder({
      ...sampleOrder,
      note: "Kod do bramy: 1234",
    });
    const output = channel === "html" ? rendered.html : rendered.text;
    expect(output).toContain("Kod do bramy: 1234");
  });

  it.each(["html", "text"] as const)(
    "shows the note prominently in %s — before the order details",
    (channel) => {
      const rendered = renderAdminNewOrder({
        ...sampleOrder,
        note: "Kod do bramy: 1234",
      });
      const output = channel === "html" ? rendered.html : rendered.text;
      expect(output.indexOf("Kod do bramy: 1234")).toBeLessThan(
        output.indexOf("Ramka Orzechowa 21×30"),
      );
    },
  );

  it("omits the note section when the order has none", () => {
    expect(html).not.toContain("Uwagi do zamówienia");
    expect(text).not.toContain("Uwagi do zamówienia");
  });
});
