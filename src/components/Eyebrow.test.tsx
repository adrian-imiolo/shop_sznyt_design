import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Eyebrow from "./Eyebrow";

// Expected class strings are transcribed from the markup this module replaces,
// so a passing test means the rendered output is byte-identical to what shipped.

test("renders the eyebrow identity with the default mb-4 spacing", () => {
  expect(renderToStaticMarkup(<Eyebrow>Kontakt</Eyebrow>)).toBe(
    '<p class="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">Kontakt</p>',
  );
});

test("emits no trailing margin, and no stray whitespace, for spacing=''", () => {
  expect(renderToStaticMarkup(<Eyebrow spacing="">Zwrot</Eyebrow>)).toBe(
    '<p class="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase">Zwrot</p>',
  );
});

// Arrives green: it doesn't drive the implementation, it pins the decision that
// spacing is a free string rather than a token union. About.tsx:57 needs a
// responsive pair, which a union of single utilities could not express.
test("passes a responsive spacing pair through untouched", () => {
  expect(
    renderToStaticMarkup(
      <Eyebrow spacing="mb-8 md:mb-16">Proces, który ma znaczenie</Eyebrow>,
    ),
  ).toBe(
    '<p class="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-8 md:mb-16">Proces, który ma znaczenie</p>',
  );
});

test("appends the ml-1 optical nudge after the spacing when alignsWithHeading", () => {
  expect(
    renderToStaticMarkup(<Eyebrow alignsWithHeading>Sznyt Design</Eyebrow>),
  ).toBe(
    '<p class="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4 ml-1">Sznyt Design</p>',
  );
});

test("omits the nudge by default, so the other kickers keep box alignment", () => {
  expect(renderToStaticMarkup(<Eyebrow>Sznyt Design</Eyebrow>)).not.toContain(
    "ml-1",
  );
});
