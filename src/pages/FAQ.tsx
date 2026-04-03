import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Produkty",
    items: [
      {
        q: "Z jakich materiałów wykonane są ramki?",
        a: "Nasze ramki wykonane są z drewna i wykończone ręcznie z dbałością o detale. Front zabezpieczony jest plexi, co zwiększa trwałość produktu i bezpieczeństwo w użytkowaniu. Każda ramka wyposażona jest w zawieszki oraz nóżkę umożliwiającą postawienie.",
      },
      {
        q: "Jak dbać o ramkę?",
        a: "Ramkę najlepiej czyścić suchą lub lekko wilgotną miękką ściereczką. Należy unikać środków chemicznych, rozpuszczalników i wody pod ciśnieniem. Przechowywać z dala od bezpośredniego nasłonecznienia i nadmiernej wilgoci, które mogą wpływać na kolor i strukturę drewna.",
      },
      {
        q: "Czy oferujecie personalizację?",
        a: "Na ten moment nie oferujemy personalizacji produktów. Nasza oferta obejmuje gotowe modele dostępne w sklepie.",
      },
    ],
  },
  {
    category: "Zamówienia i płatności",
    items: [
      {
        q: "Jak długo trwa realizacja zamówienia?",
        a: "Zamówienia realizujemy w ciągu 3–5 dni roboczych od momentu zaksięgowania płatności. Czas dostawy po nadaniu przesyłki to zazwyczaj 1–2 dni robocze.",
      },
      {
        q: "Jakie metody płatności są dostępne?",
        a: "Akceptujemy: BLIK, Przelewy24, kartę płatniczą oraz szybki przelew bankowy. Płatności obsługuje serwis Stripe — bezpieczna platforma stosowana przez największe sklepy na świecie.",
      },
      {
        q: "Czy mogę zmienić lub anulować zamówienie?",
        a: "Tak — istnieje możliwość zmiany lub anulowania zamówienia do momentu jego wysyłki. Napisz do nas jak najszybciej na adres kontakt@sznytdesign.pl, podając numer zamówienia.",
      },
      {
        q: "Czy otrzymam fakturę?",
        a: "Prowadzimy działalność nierejestrowaną i nie jesteśmy płatnikiem VAT, dlatego nie wystawiamy faktur VAT. Na życzenie wystawiamy rachunek — wystarczy wspomnieć o tym w wiadomości e-mail po złożeniu zamówienia.",
      },
    ],
  },
  {
    category: "Dostawa",
    items: [
      {
        q: "Jakie są koszty i metody dostawy?",
        a: "Oferujemy trzy opcje dostawy: InPost Paczkomat (20 PLN), InPost Kurier (25 PLN) oraz DPD Kurier (25 PLN). Darmowa dostawa obowiązuje przy zamówieniach powyżej 350 PLN.",
      },
      {
        q: "Jak zabezpieczane są ramki do wysyłki?",
        a: "Każda ramka jest starannie pakowana przy użyciu folii bąbelkowej, wypełnienia ochronnego oraz solidnego kartonu. Ramki nie zawierają szkła, co dodatkowo minimalizuje ryzyko uszkodzenia w transporcie.",
      },
      {
        q: "Co zrobić, jeśli paczka przyszła uszkodzona?",
        a: "Prosimy o: sprawdzenie paczki przy odbiorze, wykonanie dokumentacji zdjęciowej uszkodzenia oraz sporządzenie protokołu szkody w obecności kuriera lub pracownika punktu odbioru (jeśli to możliwe). Następnie wypełnij formularz reklamacyjny na stronie /zwroty lub napisz na kontakt@sznytdesign.pl — rozpatrzymy zgłoszenie w ciągu 14 dni roboczych.",
      },
    ],
  },
  {
    category: "Zwroty i reklamacje",
    items: [
      {
        q: "Czy mogę zwrócić produkt?",
        a: "Tak. Jako konsument masz prawo do odstąpienia od umowy bez podania przyczyny w ciągu 14 dni od otrzymania produktu. Produkt powinien być nieużywany i nieuszkodzony (może wykazywać ślady normalnego sprawdzenia).",
      },
      {
        q: "Kto pokrywa koszt zwrotu?",
        a: "Koszt odesłania produktu przy standardowym zwrocie pokrywa Klient. W przypadku reklamacji uzasadnionej wadą produktu lub uszkodzeniem w transporcie — koszt zwrotu pokrywa Sprzedawca.",
      },
      {
        q: "Ile trwa zwrot pieniędzy?",
        a: "Zwrot środków następuje w ciągu 14 dni od momentu otrzymania zwróconego produktu przez Sprzedawcę — tym samym sposobem płatności, którego użył Klient.",
      },
      {
        q: "Jak złożyć reklamację?",
        a: "Wypełnij formularz reklamacyjny na stronie /zwroty lub wyślij e-mail na kontakt@sznytdesign.pl, opisując problem i załączając zdjęcia. Reklamacja zostanie rozpatrzona w ciągu 14 dni roboczych od zgłoszenia.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-borders py-5">
      <button
        className="w-full flex justify-between items-start gap-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-cormorant text-xl text-near-black font-light leading-snug">{q}</span>
        <span className="font-dm-sans text-secondary-text text-lg shrink-0 mt-0.5">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="font-dm-sans text-sm text-secondary-text leading-relaxed mt-4 max-w-2xl">
          {a}
        </p>
      )}
    </div>
  );
}

function FAQ() {
  return (
    <main className="bg-warm-white px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">Pomoc</p>
        <h1 className="font-cormorant text-4xl md:text-5xl text-near-black font-light mb-4">
          Najczęściej zadawane pytania
        </h1>
        <p className="font-dm-sans text-sm text-secondary-text mb-16 max-w-xl">
          Nie znalazłeś odpowiedzi? <Link to="/kontakt" className="text-accent hover:underline">Napisz do nas</Link> — odpowiadamy w ciągu 1–2 dni roboczych.
        </p>

        <div className="flex flex-col gap-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-2">
                {section.category}
              </p>
              <div>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
                <div className="border-t border-borders" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 border border-borders flex flex-col gap-3">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase">Potrzebujesz pomocy?</p>
          <p className="font-cormorant text-2xl text-near-black font-light">Chętnie odpowiemy na każde pytanie.</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              to="/kontakt"
              className="font-dm-sans text-sm text-near-black border border-near-black px-8 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 text-center"
            >
              Napisz do nas
            </Link>
            <Link
              to="/zwroty"
              className="font-dm-sans text-sm text-secondary-text border border-borders px-8 py-3 hover:border-near-black hover:text-near-black transition-colors duration-300 text-center"
            >
              Formularz zwrotu / reklamacji
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

export default FAQ;
