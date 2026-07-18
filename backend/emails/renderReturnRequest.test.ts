import { describe, expect, it } from "vitest";
import { renderReturnRequest } from "./renderReturnRequest.ts";
import type { ReturnRequestData } from "./renderReturnRequest.ts";

const sampleData: ReturnRequestData = {
  orderNumber: "42",
  name: "Anna Nowak",
  email: "anna@example.com",
  reason: "Ramka nie pasuje do wnętrza.\nProszę o zwrot.",
  bankAccount: "61 1090 1014 0000 0712 1981 2874",
};

describe("renderReturnRequest", () => {
  const { subject, html, text } = renderReturnRequest(sampleData);

  it("returns the { subject, html, text } shape", () => {
    expect(typeof subject).toBe("string");
    expect(typeof html).toBe("string");
    expect(typeof text).toBe("string");
  });

  it("pins the subject", () => {
    expect(subject).toBe("Zwrot towaru — zamówienie #42");
  });

  it.each(["html", "text"] as const)("includes the form data in %s", (channel) => {
    const output = channel === "html" ? html : text;
    expect(output).toContain("#42");
    expect(output).toContain("Anna Nowak");
    expect(output).toContain("anna@example.com");
    expect(output).toContain("61 1090 1014 0000 0712 1981 2874");
    expect(output).toContain("Ramka nie pasuje do wnętrza.");
  });

  it("preserves reason line breaks in html", () => {
    expect(html).toContain("wnętrza.<br>Proszę o zwrot.");
  });

  it("escapes an HTML-injection attempt in every user-controlled field", () => {
    const { html: injectedHtml } = renderReturnRequest({
      orderNumber: '<img src=x onerror=alert("order")>',
      name: "<script>alert('name')</script>",
      email: "<b>email</b>@example.com",
      reason: "<i>reason</i> & more",
      bankAccount: "<u>account</u>",
    });
    expect(injectedHtml).not.toContain("<img");
    expect(injectedHtml).not.toContain("<script");
    expect(injectedHtml).not.toContain("<b>email</b>");
    expect(injectedHtml).not.toContain("<i>reason</i>");
    expect(injectedHtml).not.toContain("<u>account</u>");
    expect(injectedHtml).toContain("&lt;img src=x onerror=alert(&quot;order&quot;)&gt;");
    expect(injectedHtml).toContain("&lt;script&gt;alert(&#39;name&#39;)&lt;/script&gt;");
    expect(injectedHtml).toContain("&lt;b&gt;email&lt;/b&gt;@example.com");
    expect(injectedHtml).toContain("&lt;i&gt;reason&lt;/i&gt; &amp; more");
    expect(injectedHtml).toContain("&lt;u&gt;account&lt;/u&gt;");
  });
});
