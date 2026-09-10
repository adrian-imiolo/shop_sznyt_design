import Eyebrow from "./Eyebrow";

function BrandStatement() {
  return (
    <section className="bg-near-black py-16 md:py-32 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <Eyebrow spacing="mb-6">Nasza filozofia</Eyebrow>
        <h2 className="font-cormorant text-3xl md:text-5xl lg:text-6xl text-warm-white font-light leading-tight mb-8">
          Każda rama to decyzja.
          <br />
          Nie ozdobnik — wybór.
        </h2>
        <p className="font-dm-sans text-sm text-secondary-text">
          Tworzymy ramy, które nie krzyczą. Które trwają.
        </p>
      </div>
    </section>
  );
}

export default BrandStatement;
