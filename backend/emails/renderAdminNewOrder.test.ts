import { describe, expect, it } from "vitest";
import { renderAdminNewOrder } from "./renderAdminNewOrder.ts";
import type { OrderEmailData } from "./types.ts";

const sampleOrder: OrderEmailData = {
  orderId: 7,
  items: [{ name: "Ramka Orzechowa 21×30", quantity: 1, unitPrice: 189 }],
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

const orderWithNote: OrderEmailData = { ...sampleOrder, note: "Kod do bramy: 1234" };

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

  it.each(["html", "text"] as const)(
    "shows the shipping cost as its own Dostawa line in %s",
    (channel) => {
      const output = channel === "html" ? html : text;
      expect(output).toContain("Dostawa");
      expect(output).toContain("25,00 PLN"); // 214 total − 189 items
    },
  );

  it.each(["html", "text"] as const)("shows the customer note in %s", (channel) => {
    const rendered = renderAdminNewOrder(orderWithNote);
    const output = channel === "html" ? rendered.html : rendered.text;
    expect(output).toContain("Kod do bramy: 1234");
  });

  it.each(["html", "text"] as const)(
    "shows the note prominently in %s — before the order details",
    (channel) => {
      const rendered = renderAdminNewOrder(orderWithNote);
      const output = channel === "html" ? rendered.html : rendered.text;
      expect(output.indexOf("Kod do bramy: 1234")).toBeLessThan(
        output.indexOf("Ramka Orzechowa 21×30"),
      );
    },
  );

  it("renders the note as a highlighted callout cell in html", () => {
    const rendered = renderAdminNewOrder(orderWithNote);
    // Match the <td> that actually contains the note, capturing its style attr.
    const callout = rendered.html.match(
      /<td style="([^"]*)">(?:(?!<\/td>)[\s\S])*Kod do bramy: 1234/,
    );
    expect(callout).not.toBeNull();
    expect(callout![1]).toContain("background:#F6F1E7");
    expect(callout![1]).toContain("border-left:3px solid");
  });

  it("preserves note line breaks in the html callout", () => {
    const rendered = renderAdminNewOrder({
      ...sampleOrder,
      note: "Kod do bramy: 1234\nZostawić u sąsiada",
    });
    expect(rendered.html).toContain("Kod do bramy: 1234<br>Zostawić u sąsiada");
  });

  it("emphasizes the note with delimiter lines in text", () => {
    const rendered = renderAdminNewOrder(orderWithNote);
    expect(rendered.text).toContain("=== UWAGI KLIENTA ===");
    expect(rendered.text).toContain("Kod do bramy: 1234");
  });

  it("omits the note section when the order has none", () => {
    expect(html).not.toContain("Uwagi do zamówienia");
    expect(text).not.toContain("Uwagi do zamówienia");
    expect(html).not.toContain("Uwagi klienta");
    expect(text).not.toContain("UWAGI KLIENTA");
  });
});
