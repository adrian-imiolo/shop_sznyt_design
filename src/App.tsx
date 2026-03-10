import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import BrandStatement from "./components/BrandStatement";
import Footer from "./components/Footer";

const products = [
  {
    id: 1,
    name: "Ramka Szachownica",
    tagline: "Prostota, która trwa.",
    description:
      "Wykonana z litego drewna dębowego, wykończona naturalnym olejem. Ponadczasowa forma, która pasuje do każdego wnętrza.",
    price: 299,
    studioImage: "https://placehold.co/800x1000/2a2420/FAFAF8?text=Studio",
    lifestyleImage:
      "https://placehold.co/800x1000/4a3f35/FAFAF8?text=Lifestyle",
  },
  {
    id: 2,
    name: "Ramka Corner Cut",
    tagline: "Minimalizm w każdym detalu.",
    description:
      "Cienka stalowa rama w matowym czerni. Idealna do fotografii i grafik w stylu współczesnym.",
    price: 349,
    studioImage: "https://placehold.co/800x1000/1a1a1a/FAFAF8?text=Studio",
    lifestyleImage:
      "https://placehold.co/800x1000/2d2d2d/FAFAF8?text=Lifestyle",
  },
];

function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      {products.map((product, index) => (
        <ProductSection
          key={product.id}
          name={product.name}
          tagline={product.tagline}
          description={product.description}
          price={product.price}
          studioImage={product.studioImage}
          lifestyleImage={product.lifestyleImage}
          reverse={index % 2 !== 0}
        />
      ))}
      <BrandStatement />
      <Footer />
    </div>
  );
}

export default App;
