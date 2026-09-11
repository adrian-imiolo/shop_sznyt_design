import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CartToast } from "./CartFeedback";

// Expected class strings are transcribed from the two copies this module
// replaces, so a passing test means the rendered output is byte-identical to
// what shipped in ProductSection.tsx and ProductDetail.tsx.

const IDENTITY =
  "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-near-black text-warm-white font-dm-sans text-sm px-6 py-4 flex items-center gap-3 transition-opacity duration-500";

const BODY = '<span class="text-accent">✓</span><p>Dodano do koszyka!</p>';

test("renders hidden and click-through when nothing was just added", () => {
  expect(renderToStaticMarkup(<CartToast visible={false} />)).toBe(
    `<div class="${IDENTITY} opacity-0 pointer-events-none">${BODY}</div>`,
  );
});

test("goes opaque and drops pointer-events-none when visible", () => {
  expect(renderToStaticMarkup(<CartToast visible />)).toBe(
    `<div class="${IDENTITY} opacity-100">${BODY}</div>`,
  );
});

// Extraction alone would not stop a third copy — two is already how this bug
// shipped twice. Same guard as Eyebrow.test.tsx, and read through
// import.meta.glob for the same reason: src/ is browser-only, so no node:fs.

const sources = import.meta.glob("../**/*.{ts,tsx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

test("no file outside CartFeedback.tsx hand-rolls the toast", () => {
  const offenders = Object.entries(sources)
    .filter(([path]) => !/CartFeedback\.(tsx|test\.tsx)$/.test(path))
    .filter(([, source]) => source.includes("Dodano do koszyka"))
    .map(([path]) => path);

  expect(offenders).toEqual([]);
});
