function Regulamin() {
  return (
    <main className="bg-warm-white px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">Informacje prawne</p>
        <h1 className="font-cormorant text-4xl md:text-5xl text-near-black font-light mb-2">Regulamin sklepu</h1>
        <p className="font-dm-sans text-xs text-secondary-text mb-12">Obowiązuje od: 1 maja 2026 r.</p>

        <div className="font-dm-sans text-sm text-near-black leading-relaxed flex flex-col gap-10">

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 1. Postanowienia ogólne</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Sklep internetowy dostępny pod adresem <strong className="text-near-black">sznytdesign.pl</strong> prowadzony jest przez <strong className="text-near-black">Adriana Imioło</strong> prowadzącego działalność nierejestrowaną pod nazwą <strong className="text-near-black">Sznyt Design</strong>, adres: Bolesława Śmiałego 8/24, 70-351 Szczecin, e-mail: kontakt@sznytdesign.pl.</li>
              <li>Niniejszy Regulamin określa zasady korzystania ze Sklepu, składania zamówień, realizacji dostaw, płatności oraz praw Kupującego.</li>
              <li>Korzystanie ze Sklepu oznacza akceptację niniejszego Regulaminu.</li>
              <li>Sklep prowadzi sprzedaż wyłącznie na terenie Rzeczypospolitej Polskiej.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 2. Definicje</h2>
            <ul className="flex flex-col gap-2 text-secondary-text">
              <li><strong className="text-near-black">Sprzedawca</strong> — Adrian Imioło, Sznyt Design.</li>
              <li><strong className="text-near-black">Kupujący / Klient</strong> — osoba fizyczna, osoba prawna lub jednostka organizacyjna składająca zamówienie w Sklepie.</li>
              <li><strong className="text-near-black">Konsument</strong> — Kupujący będący osobą fizyczną dokonującą zakupu niezwiązanego bezpośrednio z działalnością zawodową lub gospodarczą.</li>
              <li><strong className="text-near-black">Produkt</strong> — rzecz ruchoma dostępna w ofercie Sklepu.</li>
              <li><strong className="text-near-black">Zamówienie</strong> — oświadczenie woli Kupującego zmierzające do zawarcia umowy sprzedaży.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 3. Składanie zamówień</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Zamówienia można składać przez całą dobę, 7 dni w tygodniu.</li>
              <li>W celu złożenia zamówienia Kupujący dodaje produkty do koszyka, wybiera metodę dostawy i płatności, a następnie akceptuje niniejszy Regulamin i Politykę prywatności.</li>
              <li>Zamówienie zostaje złożone z chwilą kliknięcia przycisku „Przejdź do płatności" i dokonania płatności.</li>
              <li>Po złożeniu zamówienia Kupujący otrzymuje potwierdzenie na podany adres e-mail.</li>
              <li>Istnieje możliwość zmiany lub anulowania zamówienia do momentu jego wysyłki — prosimy o kontakt pod adresem kontakt@sznytdesign.pl.</li>
              <li>Sprzedawca zastrzega sobie prawo do anulowania zamówienia w przypadku niedostępności produktu, po uprzednim poinformowaniu Kupującego i zwrocie środków.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 4. Ceny i płatności</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Ceny produktów podane są w złotych polskich (PLN) i zawierają wszystkie obowiązujące podatki.</li>
              <li>Sprzedawca prowadzi działalność nierejestrowaną i nie jest płatnikiem VAT. Na życzenie Klienta wystawia rachunek — prośbę o rachunek należy zgłosić w wiadomości e-mail po złożeniu zamówienia.</li>
              <li>Płatności obsługiwane są przez serwis <strong className="text-near-black">Stripe</strong>. Dostępne metody płatności: BLIK, Przelewy24, karta płatnicza, szybki przelew bankowy.</li>
              <li>Realizacja zamówienia rozpoczyna się po zaksięgowaniu płatności.</li>
              <li>Sprzedawca zastrzega sobie prawo do zmiany cen produktów, bez wpływu na zamówienia już złożone.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 5. Dostawa</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Zamówienia realizowane są wyłącznie na terenie Polski.</li>
              <li>Czas przygotowania zamówienia do wysyłki wynosi 3–5 dni roboczych od momentu zaksięgowania płatności.</li>
              <li>Czas dostawy wynosi zazwyczaj 1–2 dni robocze od nadania przesyłki.</li>
              <li>Dostępne metody dostawy:
                <ul className="list-disc list-outside ml-5 mt-2 flex flex-col gap-1">
                  <li>InPost Paczkomat — 20 PLN</li>
                  <li>InPost Kurier — 25 PLN</li>
                  <li>DPD Kurier — 25 PLN</li>
                </ul>
              </li>
              <li>Darmowa dostawa obowiązuje przy zamówieniach o wartości powyżej 350 PLN (niezależnie od wybranej metody).</li>
              <li>Każda ramka jest starannie pakowana przy użyciu folii bąbelkowej, wypełnienia ochronnego oraz solidnego kartonu.</li>
              <li>Sprzedawca nie ponosi odpowiedzialności za opóźnienia wynikające z działania firm kurierskich.</li>
              <li>W przypadku uszkodzenia przesyłki przy odbiorze zaleca się sporządzenie protokołu szkody w obecności kuriera lub pracownika punktu odbioru.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 6. Prawo odstąpienia od umowy (zwrot)</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Konsument ma prawo do odstąpienia od umowy sprzedaży bez podania przyczyny w terminie <strong className="text-near-black">14 dni</strong> od dnia otrzymania produktu, zgodnie z ustawą z dnia 30 maja 2014 r. o prawach konsumenta.</li>
              <li>Aby skorzystać z prawa odstąpienia, Konsument powinien złożyć formularz zwrotu dostępny na stronie <a href="/zwroty" className="text-accent hover:underline">sznytdesign.pl/zwroty</a> lub przesłać jednoznaczne oświadczenie o odstąpieniu od umowy na adres kontakt@sznytdesign.pl.</li>
              <li>Produkt należy odesłać na adres Sprzedawcy niezwłocznie, nie później niż w ciągu 14 dni od złożenia oświadczenia o odstąpieniu.</li>
              <li>Zwracany produkt powinien być nieużywany, nieuszkodzony i może wykazywać ślady normalnego sprawdzenia (jak w sklepie stacjonarnym).</li>
              <li>Koszty odesłania produktu ponosi Konsument.</li>
              <li>W przypadku wady produktu lub uszkodzenia w transporcie koszty zwrotu pokrywa Sprzedawca.</li>
              <li>Zwrot środków nastąpi w terminie do 14 dni od otrzymania zwróconego produktu przez Sprzedawcę, tym samym sposobem płatności, którego użył Konsument.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 7. Reklamacje (rękojmia)</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Sprzedawca odpowiada wobec Kupującego za wady fizyczne i prawne produktu na podstawie przepisów Kodeksu cywilnego o rękojmi (art. 556 i następne).</li>
              <li>Reklamację należy zgłosić drogą elektroniczną na adres <strong className="text-near-black">kontakt@sznytdesign.pl</strong>, opisując problem i załączając dokumentację zdjęciową. Formularz reklamacyjny dostępny jest również na stronie <a href="/zwroty" className="text-accent hover:underline">sznytdesign.pl/zwroty</a>.</li>
              <li>Reklamacja zostanie rozpatrzona w terminie <strong className="text-near-black">14 dni roboczych</strong> od jej zgłoszenia.</li>
              <li>W przypadku uzasadnionej reklamacji Sprzedawca oferuje wymianę produktu, naprawę lub zwrot środków — w zależności od okoliczności i dostępności towaru.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 8. Pozasądowe sposoby rozwiązywania sporów</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Konsument ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji, m.in. za pośrednictwem platformy ODR (Online Dispute Resolution) dostępnej pod adresem: <span className="text-accent">https://ec.europa.eu/consumers/odr</span>.</li>
              <li>Szczegółowe informacje dotyczące możliwości skorzystania z pozasądowych sposobów rozpatrywania reklamacji dostępne są na stronie Urzędu Ochrony Konkurencji i Konsumentów (uokik.gov.pl).</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 9. Ochrona danych osobowych</h2>
            <p className="text-secondary-text">Zasady przetwarzania danych osobowych Kupujących opisane są w <a href="/polityka-prywatnosci" className="text-accent hover:underline">Polityce prywatności</a>.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 10. Postanowienia końcowe</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o prawach konsumenta.</li>
              <li>Sprzedawca zastrzega sobie prawo do zmiany Regulaminu. Zmiany nie dotyczą zamówień złożonych przed ich wprowadzeniem.</li>
              <li>Regulamin dostępny jest w każdym czasie na stronie sznytdesign.pl/regulamin.</li>
            </ol>
          </section>

        </div>
      </div>
    </main>
  );
}

export default Regulamin;
