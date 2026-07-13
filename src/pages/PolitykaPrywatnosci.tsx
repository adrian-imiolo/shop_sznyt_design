import Seo from "../components/Seo";

const SELLER_PHONE = "+48 534 218 485";

interface BrowserStorageRow {
  item: string;
  mechanism: string;
  purpose: string;
  lifetime: string;
}

const BROWSER_STORAGE: BrowserStorageRow[] = [
  {
    item: "Koszyk (cart)",
    mechanism: "localStorage",
    purpose: "Zapamiętanie zawartości koszyka między wizytami.",
    lifetime: "Do złożenia zamówienia, opróżnienia koszyka lub wyczyszczenia danych przeglądarki.",
  },
  {
    item: "Szkic zamówienia (checkout_draft)",
    mechanism: "sessionStorage",
    purpose: "Zachowanie danych formularza zamówienia w trakcie sesji, np. przy powrocie ze strony płatności.",
    lifetime: "Usuwany po złożeniu zamówienia; wygasa najpóźniej z zamknięciem karty przeglądarki.",
  },
  {
    item: "Sesja użytkownika (__session, __client_uat)",
    mechanism: "cookies (Clerk)",
    purpose: "Utrzymanie zalogowania na koncie Klienta. Ustawiane dopiero, gdy korzystasz z logowania lub rejestracji.",
    lifetime: "Do wylogowania lub wygaśnięcia sesji — domyślnie 7 dni od ostatniej aktywności; token sesji odświeżany jest automatycznie co ok. 60 sekund.",
  },
];

function PolitykaPrywatnosci() {
  return (
    <main className="bg-warm-white px-6 py-16 md:py-24">
      <Seo
        title="Polityka prywatności"
        description="Polityka prywatności sznytdesign.pl — jak Sznyt Design chroni Twoje dane osobowe, do czego je wykorzystuje i jakie masz prawa jako Kupujący."
      />
      <div className="max-w-3xl mx-auto">
        <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">Informacje prawne</p>
        <h1 className="font-cormorant text-4xl md:text-5xl text-near-black font-light mb-2">Polityka prywatności</h1>
        <p className="font-dm-sans text-xs text-secondary-text mb-12">Obowiązuje od: 13 lipca 2026 r.</p>

        <div className="font-dm-sans text-sm text-near-black leading-relaxed flex flex-col gap-10">

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">1. Administrator danych</h2>
            <p className="text-secondary-text">Administratorem Twoich danych osobowych jest <strong className="text-near-black">Adrian Imioło</strong> prowadzący działalność nierejestrowaną pod nazwą <strong className="text-near-black">Sznyt Design</strong>, Bolesława Śmiałego 8/24, 70-351 Szczecin, e-mail: kontakt@sznytdesign.pl, tel.: <strong className="text-near-black">{SELLER_PHONE}</strong>.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">2. Jakie dane zbieramy i w jakim celu</h2>
            <div className="flex flex-col gap-4 text-secondary-text">
              <div>
                <p className="text-near-black font-medium mb-1">Realizacja zamówień</p>
                <p>Imię, nazwisko, adres dostawy, adres e-mail, numer telefonu, dane płatności (przetwarzane przez Stripe). Podstawa: art. 6 ust. 1 lit. b RODO (wykonanie umowy), a w zakresie przechowywania dokumentacji sprzedaży na potrzeby podatkowe — art. 6 ust. 1 lit. c RODO (obowiązek prawny). Czas przechowywania: 5 lat od końca roku, w którym zamówienie zostało zrealizowane.</p>
              </div>
              <div>
                <p className="text-near-black font-medium mb-1">Konto użytkownika (Clerk)</p>
                <p>Adres e-mail, imię, historia zamówień. Podstawa: art. 6 ust. 1 lit. b RODO. Czas przechowywania: do usunięcia konta przez użytkownika.</p>
              </div>
              <div>
                <p className="text-near-black font-medium mb-1">Formularz kontaktowy / zwrotowy / reklamacyjny</p>
                <p>Imię, e-mail, treść wiadomości. Podstawa: art. 6 ust. 1 lit. f RODO (uzasadniony interes — obsługa klienta). Czas przechowywania: do 2 lat od zgłoszenia.</p>
              </div>
              <div>
                <p className="text-near-black font-medium mb-1">Newsletter (planowany)</p>
                <p>Adres e-mail. Podstawa: art. 6 ust. 1 lit. a RODO (zgoda). Czas przechowywania: do momentu wycofania zgody lub wypisania się z listy.</p>
              </div>
              <p>Podanie danych oznaczonych w formularzu zamówienia jako wymagane jest warunkiem zawarcia i wykonania umowy sprzedaży — bez tych danych nie możemy przyjąć ani zrealizować zamówienia. Podanie pozostałych danych jest dobrowolne.</p>
            </div>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">3. Odbiorcy danych</h2>
            <ul className="flex flex-col gap-3 text-secondary-text">
              <li><strong className="text-near-black">Stripe Payments Europe, Ltd.</strong> (Irlandia) — obsługa płatności online. W zakresie realizacji płatności dla Sklepu Stripe działa jako podmiot przetwarzający; w zakresie zapobiegania oszustwom i wypełniania własnych obowiązków prawnych Stripe działa jako niezależny administrator danych. Dane kart przetwarzane są wyłącznie przez Stripe zgodnie z jego polityką prywatności (stripe.com/privacy).</li>
              <li><strong className="text-near-black">Clerk, Inc.</strong> — zarządzanie kontami użytkowników i uwierzytelnianie (podmiot przetwarzający). Polityka prywatności: clerk.com/privacy.</li>
              <li><strong className="text-near-black">Dostawcy hostingu</strong> — Vercel (frontend), Railway (backend i baza danych).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">4. Przekazywanie danych poza EOG</h2>
            <div className="flex flex-col gap-3 text-secondary-text">
              <p>Część odbiorców danych ma siedzibę w Stanach Zjednoczonych, dlatego dane mogą być przekazywane poza Europejski Obszar Gospodarczy:</p>
              <ul className="list-disc list-outside ml-5 flex flex-col gap-2">
                <li><strong className="text-near-black">Stripe</strong> — umowa zawierana jest ze Stripe Payments Europe, Ltd. z siedzibą w Irlandii. Przekazanie danych do Stripe, Inc. (USA) odbywa się na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony — Stripe, Inc. posiada aktywny certyfikat EU–U.S. Data Privacy Framework — a uzupełniająco na podstawie standardowych klauzul umownych (SCC), zgodnie z umową powierzenia Stripe (stripe.com/legal/dpa).</li>
                <li><strong className="text-near-black">Clerk, Inc.</strong> (USA) — posiada aktywny certyfikat EU–U.S. Data Privacy Framework (clerk.com/legal/dpf); uzupełniająco stosowane są standardowe klauzule umowne (SCC), zgodnie z umową powierzenia Clerk (clerk.com/legal/dpa).</li>
              </ul>
              <p>Dane hostingowe przechowywane są na serwerach w UE lub przekazywane z zastosowaniem analogicznych zabezpieczeń. Kopię stosowanych zabezpieczeń możesz uzyskać, kontaktując się z nami.</p>
            </div>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">5. Twoje prawa (RODO)</h2>
            <p className="text-secondary-text mb-3">Masz prawo do:</p>
            <ul className="list-disc list-outside ml-5 flex flex-col gap-2 text-secondary-text">
              <li><strong className="text-near-black">dostępu</strong> do swoich danych,</li>
              <li><strong className="text-near-black">sprostowania</strong> danych nieprawidłowych,</li>
              <li><strong className="text-near-black">usunięcia</strong> danych (prawo do bycia zapomnianym),</li>
              <li><strong className="text-near-black">ograniczenia przetwarzania</strong>,</li>
              <li><strong className="text-near-black">przenoszenia danych</strong>,</li>
              <li><strong className="text-near-black">wniesienia sprzeciwu</strong> wobec przetwarzania,</li>
              <li><strong className="text-near-black">cofnięcia zgody</strong> w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania przed cofnięciem),</li>
              <li><strong className="text-near-black">skargi</strong> do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).</li>
            </ul>
            <p className="text-secondary-text mt-3">Aby skorzystać z powyższych praw, skontaktuj się pod adresem: <strong className="text-near-black">kontakt@sznytdesign.pl</strong>.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">6. Dane przechowywane w przeglądarce</h2>
            <div className="flex flex-col gap-4 text-secondary-text">
              <p>Strona sznytdesign.pl przechowuje na Twoim urządzeniu wyłącznie dane niezbędne do świadczenia usług, których sam żądasz (koszyk, złożenie zamówienia, zalogowanie). Zgodnie z art. 399 ust. 2 ustawy z dnia 12 lipca 2024 r. — Prawo komunikacji elektronicznej takie przechowywanie nie wymaga zgody — dlatego strona nie wyświetla banera cookies. Nie używamy cookies analitycznych ani marketingowych.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-borders">
                      <th className="py-2 pr-4 text-near-black font-medium">Element</th>
                      <th className="py-2 pr-4 text-near-black font-medium">Mechanizm</th>
                      <th className="py-2 pr-4 text-near-black font-medium">Cel</th>
                      <th className="py-2 text-near-black font-medium">Czas przechowywania</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BROWSER_STORAGE.map(function renderStorageRow(row) {
                      return (
                        <tr key={row.item} className="border-b border-borders align-top">
                          <td className="py-3 pr-4 text-near-black">{row.item}</td>
                          <td className="py-3 pr-4">{row.mechanism}</td>
                          <td className="py-3 pr-4">{row.purpose}</td>
                          <td className="py-3">{row.lifetime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p>Płatność odbywa się po przekierowaniu na strony Stripe — cookies niezbędne do bezpiecznej obsługi płatności Stripe zapisuje na własnych stronach, zgodnie ze swoją polityką prywatności.</p>
              <p>Powyższe dane możesz w każdej chwili usunąć, czyszcząc dane przeglądarki dla strony sznytdesign.pl. Nie wpływa to na działanie sklepu poza utratą zawartości koszyka i wylogowaniem.</p>
            </div>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">7. Newsletter</h2>
            <p className="text-secondary-text">Planujemy uruchomienie newslettera. Zapisując się, wyrażasz zgodę na przesyłanie informacji o nowościach i promocjach Sznyt Design. Możesz zrezygnować z subskrypcji w dowolnym momencie, klikając link w stopce każdej wiadomości. Twój adres e-mail nie będzie udostępniany osobom trzecim.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">8. Zmiany polityki prywatności</h2>
            <p className="text-secondary-text">Zastrzegamy sobie prawo do zmian niniejszej Polityki. O istotnych zmianach poinformujemy e-mailem lub komunikatem na stronie. Aktualna wersja dostępna jest zawsze pod adresem sznytdesign.pl/polityka-prywatnosci.</p>
          </section>

        </div>
      </div>
    </main>
  );
}

export default PolitykaPrywatnosci;
