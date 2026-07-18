import { describe, expect, it } from "vitest";
import { renderContactNotification } from "./renderContactNotification.ts";

const sampleData = {
  name: "Jan Kowalski",
  email: "jan@example.com",
  message: "Czy ramka 30×40 jest dostępna w orzechu?\nPozdrawiam",
};

describe("renderContactNotification", () => {
  const { subject, html, text } = renderContactNotification(sampleData);

  it("returns the { subject, html, text } shape", () => {
    expect(typeof subject).toBe("string");
    expect(typeof html).toBe("string");
    expect(typeof text).toBe("string");
  });

  it("pins the subject", () => {
    expect(subject).toBe("Wiadomość od Jan Kowalski — formularz kontaktowy");
  });

  it.each(["html", "text"] as const)("includes the form data in %s", (channel) => {
    const output = channel === "html" ? html : text;
    expect(output).toContain("Jan Kowalski");
    expect(output).toContain("jan@example.com");
    expect(output).toContain("Czy ramka 30×40 jest dostępna w orzechu?");
  });

  it("preserves message line breaks in html", () => {
    expect(html).toContain("orzechu?<br>Pozdrawiam");
  });

  it("escapes an HTML-injection attempt in every user-controlled field", () => {
    const { html: injectedHtml } = renderContactNotification({
      name: '<img src=x onerror=alert("name")>',
      email: "<script>alert('email')</script>@example.com",
      message: "<b>message</b> & <i>more</i>",
    });
    expect(injectedHtml).not.toContain("<img");
    expect(injectedHtml).not.toContain("<script");
    expect(injectedHtml).not.toContain("<b>message</b>");
    expect(injectedHtml).toContain("&lt;img src=x onerror=alert(&quot;name&quot;)&gt;");
    expect(injectedHtml).toContain("&lt;script&gt;alert(&#39;email&#39;)&lt;/script&gt;@example.com");
    expect(injectedHtml).toContain("&lt;b&gt;message&lt;/b&gt; &amp; &lt;i&gt;more&lt;/i&gt;");
  });
});
