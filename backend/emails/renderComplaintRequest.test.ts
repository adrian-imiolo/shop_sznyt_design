import { describe, expect, it } from "vitest";
import { renderComplaintRequest } from "./renderComplaintRequest.ts";

const sampleData = {
  orderNumber: "42",
  name: "Anna Nowak",
  email: "anna@example.com",
  description: "Ramka przyszła z pękniętym szkłem.\nProszę o wymianę.",
};

describe("renderComplaintRequest", () => {
  const { subject, html, text } = renderComplaintRequest(sampleData);

  it("returns the { subject, html, text } shape", () => {
    expect(typeof subject).toBe("string");
    expect(typeof html).toBe("string");
    expect(typeof text).toBe("string");
  });

  it("pins the subject", () => {
    expect(subject).toBe("Reklamacja — zamówienie #42");
  });

  it.each(["html", "text"] as const)("includes the form data in %s", (channel) => {
    const output = channel === "html" ? html : text;
    expect(output).toContain("#42");
    expect(output).toContain("Anna Nowak");
    expect(output).toContain("anna@example.com");
    expect(output).toContain("Ramka przyszła z pękniętym szkłem.");
  });

  it.each(["html", "text"] as const)("mentions the photo follow-up in %s", (channel) => {
    const output = channel === "html" ? html : text;
    expect(output).toContain("przesłanie zdjęć");
  });

  it("preserves description line breaks in html", () => {
    expect(html).toContain("szkłem.<br>Proszę o wymianę.");
  });

  it("escapes an HTML-injection attempt in every user-controlled field", () => {
    const { html: injectedHtml } = renderComplaintRequest({
      orderNumber: '<img src=x onerror=alert("order")>',
      name: "<script>alert('name')</script>",
      email: "<b>email</b>@example.com",
      description: "<i>description</i> & more",
    });
    expect(injectedHtml).not.toContain("<img");
    expect(injectedHtml).not.toContain("<script");
    expect(injectedHtml).not.toContain("<b>email</b>");
    expect(injectedHtml).not.toContain("<i>description</i>");
    expect(injectedHtml).toContain("&lt;img src=x onerror=alert(&quot;order&quot;)&gt;");
    expect(injectedHtml).toContain("&lt;script&gt;alert(&#39;name&#39;)&lt;/script&gt;");
    expect(injectedHtml).toContain("&lt;b&gt;email&lt;/b&gt;@example.com");
    expect(injectedHtml).toContain("&lt;i&gt;description&lt;/i&gt; &amp; more");
  });
});
