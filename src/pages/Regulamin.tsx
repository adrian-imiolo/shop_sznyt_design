import Seo from "../components/Seo";

// TODO(#90): Adrian supplies the real number before merge — art. 12 ust. 1 pkt 3 upk requires it.
const SELLER_PHONE = "+48 XXX XXX XXX";

const RETURN_ADDRESS = "Sznyt Design, Adrian Imioło, Bolesława Śmiałego 8/24, 70-351 Szczecin";

function Regulamin() {
  return (
    <main className="bg-warm-white px-6 py-16 md:py-24">
      <Seo
        title="Regulamin sklepu"
        description="Regulamin sklepu sznytdesign.pl — zasady składania zamówień, dostaw, płatności i prawa Kupującego w Sznyt Design."
      />
      <div className="max-w-3xl mx-auto">
        <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">Informacje prawne</p>
        <h1 className="font-cormorant text-4xl md:text-5xl text-near-black font-light mb-2">Regulamin sklepu</h1>
        <p className="font-dm-sans text-xs text-secondary-text mb-12">Obowiązuje od: 13 lipca 2026 r.</p>

        <div className="font-dm-sans text-sm text-near-black leading-relaxed flex flex-col gap-10">

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 1. Postanowienia ogólne</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Sklep internetowy dostępny pod adresem <strong className="text-near-black">sznytdesign.pl</strong> prowadzony jest przez <strong className="text-near-black">Adriana Imioło</strong> prowadzącego działalność nierejestrowaną pod nazwą <strong className="text-near-black">Sznyt Design</strong>, adres: Bolesława Śmiałego 8/24, 70-351 Szczecin, e-mail: kontakt@sznytdesign.pl, tel.: <strong className="text-near-black">{SELLER_PHONE}</strong>.</li>
              <li>Niniejszy Regulamin określa zasady korzystania ze Sklepu, w tym zasady świadczenia usług drogą elektroniczną, składania zamówień, realizacji dostaw, płatności oraz prawa Kupującego.</li>
              <li>Sklep prowadzi sprzedaż wyłącznie na terenie Rzeczypospolitej Polskiej.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 2. Definicje</h2>
            <ul className="flex flex-col gap-2 text-secondary-text">
              <li><strong className="text-near-black">Sprzedawca</strong> — Adrian Imioło, Sznyt Design.</li>
              <li><strong className="text-near-black">Kupujący / Klient</strong> — osoba fizyczna, osoba prawna lub jednostka organizacyjna składająca zamówienie w Sklepie.</li>
              <li><strong className="text-near-black">Konsument</strong> — Kupujący będący osobą fizyczną dokonującą zakupu niezwiązanego bezpośrednio z działalnością zawodową lub gospodarczą.</li>
              <li><strong className="text-near-black">Przedsiębiorca na prawach konsumenta</strong> — osoba fizyczna zawierająca umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy z treści umowy wynika, że nie ma ona dla niej charakteru zawodowego. Postanowienia Regulaminu dotyczące Konsumenta stosuje się do niej odpowiednio (art. 7aa ustawy o prawach konsumenta).</li>
              <li><strong className="text-near-black">Produkt</strong> — rzecz ruchoma dostępna w ofercie Sklepu.</li>
              <li><strong className="text-near-black">Zamówienie</strong> — oświadczenie woli Kupującego zmierzające do zawarcia umowy sprzedaży.</li>
              <li><strong className="text-near-black">Usługa elektroniczna</strong> — usługa świadczona drogą elektroniczną przez Sprzedawcę za pośrednictwem Sklepu, opisana w § 3.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 3. Usługi świadczone drogą elektroniczną</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Sprzedawca świadczy za pośrednictwem Sklepu następujące nieodpłatne Usługi elektroniczne: przeglądanie treści Sklepu, konto Klienta, koszyk zakupowy, formularz zamówienia, formularz kontaktowy oraz formularze zwrotu i reklamacji.</li>
              <li>Do korzystania ze Sklepu niezbędne są: urządzenie z dostępem do Internetu oraz aktualna przeglądarka internetowa z włączoną obsługą JavaScript i plików cookies. Do złożenia zamówienia oraz założenia konta niezbędny jest aktywny adres e-mail.</li>
              <li>Umowa o świadczenie usługi konta Klienta zawierana jest z chwilą rejestracji konta, na czas nieoznaczony. Klient może w każdej chwili, bez podania przyczyny i bez ponoszenia kosztów, rozwiązać tę umowę, żądając usunięcia konta wiadomością na adres kontakt@sznytdesign.pl. Pozostałe Usługi elektroniczne mają charakter jednorazowy i kończą się z chwilą zaprzestania korzystania z nich.</li>
              <li>Zakazane jest dostarczanie przez Kupującego treści o charakterze bezprawnym.</li>
              <li>Reklamacje dotyczące działania Sklepu i Usług elektronicznych można zgłaszać na adres kontakt@sznytdesign.pl. Sprzedawca rozpatrzy je w terminie 14 dni od otrzymania.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 4. Składanie zamówień</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Zamówienia można składać przez całą dobę, 7 dni w tygodniu.</li>
              <li>W celu złożenia zamówienia Kupujący dodaje produkty do koszyka, wybiera metodę dostawy i płatności, a następnie akceptuje niniejszy Regulamin i Politykę prywatności.</li>
              <li>Zamówienie zostaje złożone z chwilą kliknięcia przycisku „Przejdź do płatności" i dokonania płatności.</li>
              <li>Po złożeniu zamówienia Kupujący otrzymuje potwierdzenie na podany adres e-mail.</li>
              <li>Istnieje możliwość zmiany lub anulowania zamówienia do momentu jego wysyłki — prosimy o kontakt pod adresem kontakt@sznytdesign.pl.</li>
              <li>Sprzedawca zastrzega sobie prawo do anulowania zamówienia w przypadku niedostępności produktu, po uprzednim poinformowaniu Kupującego i niezwłocznym zwrocie środków.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 5. Ceny, płatności i dokumenty sprzedaży</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Ceny produktów podane są w złotych polskich (PLN) i zawierają wszystkie obowiązujące podatki.</li>
              <li>Sprzedaż prowadzona jest w ramach działalności nierejestrowanej i jest zwolniona z podatku VAT na podstawie art. 113 ustawy z dnia 11 marca 2004 r. o podatku od towarów i usług.</li>
              <li>Na żądanie Kupującego Sprzedawca wystawia rachunek albo fakturę bez VAT. Żądanie można zgłosić na adres kontakt@sznytdesign.pl; żądanie wystawienia faktury można zgłosić w terminie 3 miesięcy, licząc od końca miesiąca, w którym dostarczono Produkt.</li>
              <li>Płatności obsługiwane są przez serwis <strong className="text-near-black">Stripe</strong>. Dostępne metody płatności: BLIK, Przelewy24, karta płatnicza, szybki przelew bankowy.</li>
              <li>Realizacja zamówienia rozpoczyna się po zaksięgowaniu płatności.</li>
              <li>Sprzedawca zastrzega sobie prawo do zmiany cen produktów, bez wpływu na zamówienia już złożone.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 6. Dostawa</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Zamówienia realizowane są wyłącznie na terenie Polski.</li>
              <li>Czas przygotowania zamówienia do wysyłki wynosi 3–5 dni roboczych od momentu zaksięgowania płatności.</li>
              <li>Orientacyjny czas dostawy wynosi 1–2 dni robocze od nadania przesyłki i zależy od przewoźnika. O nadaniu przesyłki Kupujący zostanie poinformowany e-mailem.</li>
              <li>Dostępne metody dostawy:
                <ul className="list-disc list-outside ml-5 mt-2 flex flex-col gap-1">
                  <li>InPost Paczkomat — 20 PLN</li>
                  <li>InPost Kurier — 25 PLN</li>
                  <li>DPD Kurier — 25 PLN</li>
                </ul>
              </li>
              <li>Darmowa dostawa obowiązuje przy zamówieniach o wartości powyżej 350 PLN (niezależnie od wybranej metody).</li>
              <li>Każda ramka jest starannie pakowana przy użyciu folii bąbelkowej, wypełnienia ochronnego oraz solidnego kartonu.</li>
              <li>W przypadku uszkodzenia przesyłki przy odbiorze zalecamy sporządzenie protokołu szkody w obecności kuriera lub pracownika punktu odbioru — ułatwi to rozpatrzenie sprawy, ale nie jest warunkiem przyjęcia reklamacji.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 7. Prawo odstąpienia od umowy (zwrot)</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Konsument ma prawo odstąpić od umowy sprzedaży bez podania przyczyny w terminie <strong className="text-near-black">14 dni</strong> od dnia otrzymania Produktu, zgodnie z ustawą z dnia 30 maja 2014 r. o prawach konsumenta.</li>
              <li>Aby skorzystać z prawa odstąpienia, Konsument może złożyć formularz zwrotu dostępny na stronie <a href="/zwroty" className="text-accent hover:underline">sznytdesign.pl/zwroty</a>, przesłać jednoznaczne oświadczenie o odstąpieniu na adres kontakt@sznytdesign.pl lub skorzystać ze wzoru formularza odstąpienia stanowiącego załącznik nr 1 do Regulaminu. Skorzystanie ze wzoru nie jest obowiązkowe.</li>
              <li>Produkt należy odesłać niezwłocznie, nie później niż w ciągu 14 dni od dnia złożenia oświadczenia o odstąpieniu, na adres: <strong className="text-near-black">{RETURN_ADDRESS}</strong>.</li>
              <li>Sprzedawca zwraca płatność niezwłocznie, nie później niż w terminie <strong className="text-near-black">14 dni od dnia otrzymania oświadczenia o odstąpieniu</strong>. Zwrot obejmuje cenę Produktu oraz koszty dostarczenia Produktu do Konsumenta — do wysokości kosztu najtańszej zwykłej metody dostawy oferowanej w Sklepie.</li>
              <li>Sprzedawca może wstrzymać się ze zwrotem płatności do chwili otrzymania Produktu z powrotem lub dostarczenia przez Konsumenta dowodu jego odesłania, w zależności od tego, które zdarzenie nastąpi wcześniej.</li>
              <li>Zwrot płatności następuje tym samym sposobem, którego użył Konsument, chyba że Konsument wyraźnie zgodzi się na inny sposób niewiążący się dla niego z żadnymi kosztami.</li>
              <li>Bezpośrednie koszty odesłania Produktu ponosi Konsument.</li>
              <li>Konsument ponosi odpowiedzialność za zmniejszenie wartości Produktu będące wynikiem korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia charakteru, cech i funkcjonowania Produktu. Prawo odstąpienia nie jest uzależnione od stanu zwracanego Produktu.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 8. Reklamacje</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Wobec Konsumenta oraz Przedsiębiorcy na prawach konsumenta Sprzedawca odpowiada za <strong className="text-near-black">brak zgodności Produktu z umową</strong> na zasadach określonych w rozdziale 5a ustawy z dnia 30 maja 2014 r. o prawach konsumenta (art. 43a–43g).</li>
              <li>Sprzedawca odpowiada za brak zgodności Produktu z umową istniejący w chwili jego dostarczenia i ujawniony w ciągu <strong className="text-near-black">2 lat</strong> od tej chwili. Domniemywa się, że brak zgodności, który ujawnił się przed upływem 2 lat od dostarczenia Produktu, istniał w chwili jego dostarczenia.</li>
              <li>Jeżeli Produkt jest niezgodny z umową, Kupujący, o którym mowa w pkt 1, może żądać jego <strong className="text-near-black">naprawy lub wymiany</strong>. Sprzedawca może dokonać wymiany, gdy Kupujący żąda naprawy (lub odwrotnie), jeżeli wybrany sposób jest niemożliwy albo wymagałby nadmiernych kosztów. Koszty naprawy lub wymiany, w tym koszty odesłania Produktu, ponosi Sprzedawca.</li>
              <li>Kupujący może złożyć oświadczenie o <strong className="text-near-black">obniżeniu ceny albo odstąpieniu od umowy</strong> m.in. gdy naprawa lub wymiana są niemożliwe, nie zostały dokonane lub brak zgodności występuje nadal. Odstąpienie od umowy nie przysługuje, jeżeli brak zgodności jest nieistotny.</li>
              <li>Reklamację można zgłosić na adres <strong className="text-near-black">kontakt@sznytdesign.pl</strong> lub przez formularz na stronie <a href="/zwroty" className="text-accent hover:underline">sznytdesign.pl/zwroty</a>. Dołączenie zdjęć ułatwia i przyspiesza rozpatrzenie, ale nie jest warunkiem przyjęcia ani rozpatrzenia reklamacji.</li>
              <li>Sprzedawca udzieli odpowiedzi na reklamację w terminie <strong className="text-near-black">14 dni</strong> od dnia jej otrzymania. Brak odpowiedzi w tym terminie oznacza uznanie reklamacji.</li>
              <li>Wobec Kupujących niebędących Konsumentami ani Przedsiębiorcami na prawach konsumenta Sprzedawca odpowiada z tytułu rękojmi na zasadach określonych w Kodeksie cywilnym (art. 556 i następne).</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 9. Pozasądowe sposoby rozwiązywania sporów</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>Sprzedawca nie zobowiązuje się z góry do udziału w postępowaniach w sprawie pozasądowego rozwiązywania sporów konsumenckich. Decyzję o udziale w takim postępowaniu Sprzedawca podejmuje indywidualnie, informując o niej Konsumenta w odpowiedzi na reklamację, zgodnie z ustawą z dnia 23 września 2016 r. o pozasądowym rozwiązywaniu sporów konsumenckich.</li>
              <li>Podmiotem uprawnionym do pozasądowego rozwiązywania sporów konsumenckich właściwym dla Sprzedawcy jest <strong className="text-near-black">Wojewódzki Inspektorat Inspekcji Handlowej w Szczecinie</strong>. Konsument może również skorzystać z bezpłatnej pomocy miejskiego lub powiatowego rzecznika konsumentów.</li>
              <li>Szczegółowe informacje o pozasądowych sposobach rozpatrywania sporów konsumenckich dostępne są na stronie Urzędu Ochrony Konkurencji i Konsumentów (uokik.gov.pl).</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 10. Ochrona danych osobowych</h2>
            <p className="text-secondary-text">Zasady przetwarzania danych osobowych Kupujących opisane są w <a href="/polityka-prywatnosci" className="text-accent hover:underline">Polityce prywatności</a>.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">§ 11. Postanowienia końcowe</h2>
            <ol className="list-decimal list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego, ustawy o prawach konsumenta oraz ustawy o świadczeniu usług drogą elektroniczną.</li>
              <li>Sprzedawca może zmienić Regulamin z ważnych przyczyn. Zmiany nie dotyczą zamówień złożonych przed ich wejściem w życie i są publikowane na tej stronie z podaniem daty, od której obowiązują.</li>
              <li>Regulamin dostępny jest w każdym czasie na stronie sznytdesign.pl/regulamin, w sposób umożliwiający jego pobranie i utrwalenie.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">Załącznik nr 1. Wzór formularza odstąpienia od umowy</h2>
            <p className="text-secondary-text mb-4">(formularz ten należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)</p>
            <div className="border border-borders p-6 text-secondary-text flex flex-col gap-2">
              <p>Adresat: {RETURN_ADDRESS}, e-mail: kontakt@sznytdesign.pl</p>
              <p>Ja/My(*) niniejszym informuję/informujemy(*) o moim/naszym odstąpieniu od umowy sprzedaży następujących rzeczy: ..............................</p>
              <p>Data zawarcia umowy(*)/odbioru(*): ..............................</p>
              <p>Imię i nazwisko konsumenta(-ów): ..............................</p>
              <p>Adres konsumenta(-ów): ..............................</p>
              <p>Podpis konsumenta(-ów): .............................. (tylko jeżeli formularz jest przesyłany w wersji papierowej)</p>
              <p>Data: ..............................</p>
              <p className="text-xs">(*) Niepotrzebne skreślić.</p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

export default Regulamin;
