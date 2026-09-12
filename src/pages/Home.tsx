import ProductSection, { ProductSectionSkeleton } from "../components/ProductSection";
import Hero from "../components/Hero";
import BrandStatement from "../components/BrandStatement";
import Eyebrow from "../components/Eyebrow";
import Seo from "../components/Seo";
import SoldOutNotice from "../components/SoldOutNotice";
import CatalogUnavailable from "../components/CatalogUnavailable";
import type { Product } from "../types";
import { isSoldOut } from "../catalog/availability";
import { useResource } from "../hooks/useResource";

function Home() {
  const { data: products, error: loadFailed, reload } = useResource<Product[]>("/products");
  // Derived once the catalog is in, so the notice cannot flash before it loads
  const soldOut = products !== null && isSoldOut(products);

  return (
    <>
      <Seo
        isHome
        title="Home"
        description="Ręcznie robione ramki z litego dębu — designerski prezent, który zostaje na lata. Kolekcja Sznyt Design, projektowana i wykonywana w Polsce."
      />
      <Hero notice={soldOut ? <SoldOutNotice /> : undefined} />
      <div id="kolekcja" />

      {/* Three states, never a silently empty collection: the backend can be
          slow to wake, and a homepage that renders straight through to
          BrandStatement reads as "shop is broken" rather than "still loading". */}
      {loadFailed ? (
        <CatalogUnavailable onRetry={reload} />
      ) : !products ? (
        <>
          <ProductSectionSkeleton first />
          <ProductSectionSkeleton reverse />
        </>
      ) : (
        products.map((product, index) => (
          <ProductSection
            id={product.id}
            key={product.id}
            name={product.name}
            tagline={product.tagline}
            description={product.description}
            price={product.price}
            imageUrl={product.imageUrl}
            lifestyleImageUrl={product.lifestyleImageUrl}
            reverse={index % 2 !== 0}
            stock={product.stock}
            first={index === 0}
          />
        ))
      )}
      <BrandStatement />

      {/* Why us — 3 columns */}
      <section className="bg-warm-white border-t border-borders px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              label: "Materiał",
              title: "Wysoka jakość",
              text: "Wybieramy materiały z charakterem. Każdy detal jest decyzją, nie przypadkiem.",
            },
            {
              label: "Wykonanie",
              title: "Precyzja rzemiosła",
              text: "Każda rama przechodzi kontrolę jakości zanim trafi do klienta. Precyzja, której nie zastąpi masa.",
            },
            {
              label: "Projekt",
              title: "Ponadczasowa forma",
              text: "Minimalizm, który nie wychodzi z mody — bo nigdy do niej nie należał.",
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-3">
              <Eyebrow spacing="">{item.label}</Eyebrow>
              <h3 className="font-cormorant text-2xl text-near-black font-light">
                {item.title}
              </h3>
              <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
