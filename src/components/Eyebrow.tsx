import type { ReactNode } from "react";

const IDENTITY = "font-dm-sans text-xs text-accent tracking-[0.3em] uppercase";

type EyebrowProps = {
  children: ReactNode;
  /** Trailing spacing utility. Pass "" for a callsite that owns its own rhythm. */
  spacing?: string;
  /**
   * Nudges the label 4px right so it sits ink-flush above a Cormorant heading —
   * DM Sans has near-zero left bearing where Cormorant carries a few px of it.
   *
   * The value is tuned for headings on the `text-3xl md:text-4xl lg:text-5xl`
   * ramp. Left bearing scales with font-size, so smaller or larger headings
   * would need their own value rather than this one; see #164.
   */
  alignsWithHeading?: boolean;
};

function Eyebrow({
  children,
  spacing = "mb-4",
  alignsWithHeading = false,
}: EyebrowProps) {
  const className = [IDENTITY, spacing, alignsWithHeading && "ml-1"]
    .filter(Boolean)
    .join(" ");

  return <p className={className}>{children}</p>;
}

export default Eyebrow;
