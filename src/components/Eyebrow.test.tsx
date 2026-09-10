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

// The module alone doesn't stop the #156/#157 class of bug — anyone can still
// hand-roll the markup in a new file, which is exactly how 29 copies happened.
// This is the part that makes that impossible.

// Sources are read through import.meta.glob rather than node:fs so this file
// stays inside tsconfig.app.json's browser-only types. Pulling @types/node into
// the app project to satisfy one test would also let process and fs typecheck
// inside components, which is a worse trade than a Vite-native glob.

const IDENTITY_TOKENS = ["text-accent", "tracking-[0.3em]", "uppercase"];

const sources = import.meta.glob("../**/*.{ts,tsx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

test("no file outside Eyebrow.tsx hand-rolls the eyebrow identity", () => {
  const offenders = Object.entries(sources)
    .filter(([path]) => !/Eyebrow\.(tsx|test\.tsx)$/.test(path))
    .filter(([, source]) =>
      [...source.matchAll(/className="([^"]*)"/g)].some(([, classes]) =>
        IDENTITY_TOKENS.every((token) => classes.includes(token)),
      ),
    )
    .map(([path]) => path);

  expect(offenders).toEqual([]);
});
