import { Helmet } from "react-helmet-async";

type SeoProps = {
  /** Page-specific title fragment. Ignored when `isHome` is true. */
  title: string;
  /** Meta description (~120–155 chars recommended). */
  description: string;
  /**
   * When true, render the bare brand title without the " — Sznyt Design" suffix.
   * Use only for the home page.
   */
  isHome?: boolean;
};

const BRAND = "Sznyt Design";
const HOME_TITLE = "Sznyt Design — ręcznie robione drewniane ramki";

function Seo({ title, description, isHome = false }: SeoProps) {
  const fullTitle = isHome ? HOME_TITLE : `${title} — ${BRAND}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
}

export default Seo;
