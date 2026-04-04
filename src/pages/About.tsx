function About() {
  return (
    <main>
      {/* Hero — page title */}
      <section className="bg-near-black px-6 py-16 md:py-32 flex items-end">
        <div className="max-w-6xl mx-auto w-full">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
            O nas
          </p>
          <h1 className="font-cormorant text-4xl md:text-6xl lg:text-7xl text-warm-white font-light leading-tight">
            Tworzymy ramy,
            <br />
            nie ozdobniki.
          </h1>
        </div>
      </section>

      {/* Story — image left, text right */}
      <section className="flex flex-col md:flex-row min-h-[70vh]">
        {/* Image placeholder */}
        <div
          className="w-full md:w-1/2 min-h-[50vh] md:min-h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://placehold.co/800x1000/2a2420/FAFAF8?text=Pracownia)",
          }}
        />

        {/* Text */}
        <div className="w-full md:w-1/2 bg-warm-white flex items-center px-6 py-12 md:px-20">
          <div className="max-w-md">
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-6">
              Nasza historia
            </p>
            <h2 className="font-cormorant text-3xl md:text-4xl text-near-black font-light leading-tight mb-6">
              Każda rama powstaje z namysłem.
            </h2>
            <p className="font-dm-sans text-sm text-secondary-text leading-relaxed mb-4">
              Sznyt Design to projekt stworzony z przekonania, że rama nie
              powinna krzyczeć. Powinna trwać — w tle, ale nie niewidocznie.
            </p>
            <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
              Wybieramy materiały, które się starzeją z godnością. Projektujemy
              formy, które nie wychodzą z mody. Każdy detal jest decyzją, nie
              przypadkiem.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-warm-white border-t border-borders px-6 py-12 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-8 md:mb-16">
            Proces, który ma znaczenie
          </p>
          {[
            {
              number: "01",
              title: "Projekt",
              text: "Każda rama zaczyna się od przemyślanej formy. Dbamy o proporcje, balans i detal.",
            },
            {
              number: "02",
              title: "Wykonanie",
              text: "Wybieramy trwałe materiały i stawiamy na precyzję. Jakość to dla nas podstawa, nie dodatek.",
            },
            {
              number: "03",
              title: "Finalny efekt",
              text: "Sprawdzamy każdy element, aby gotowy produkt był spójny i dopracowany. Chcemy, by dobrze wyglądał nie tylko dziś, ale także za kilka lat.",
            },
          ].map((step) => (
            <div key={step.number} className="flex gap-10 items-start border-t border-borders py-10">
              <span className="font-cormorant text-4xl text-accent font-light shrink-0 w-16">
                {step.number}
              </span>
              <div>
                <h3 className="font-cormorant text-2xl text-near-black font-light mb-3">
                  {step.title}
                </h3>
                <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-warm-white border-t border-borders px-6 py-12 md:py-24 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-cormorant text-3xl md:text-4xl text-near-black font-light mb-4">
            Znajdź ramę dla siebie.
          </h2>
          <p className="font-dm-sans text-sm text-secondary-text mb-8">
            Dwie kolekcje. Każda z charakterem. Masz pytania — napisz do nas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sklep"
              className="inline-block font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
            >
              Zobacz kolekcję
            </a>
            <a
              href="/kontakt"
              className="inline-block font-dm-sans text-sm text-accent border border-accent px-10 py-3 hover:bg-accent hover:text-near-black transition-colors duration-300"
            >
              Skontaktuj się
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
