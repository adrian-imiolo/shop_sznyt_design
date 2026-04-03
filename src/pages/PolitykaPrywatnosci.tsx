function PolitykaPrywatnosci() {
  return (
    <main className="bg-warm-white px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">Informacje prawne</p>
        <h1 className="font-cormorant text-4xl md:text-5xl text-near-black font-light mb-2">Polityka prywatności</h1>
        <p className="font-dm-sans text-xs text-secondary-text mb-12">Obowiązuje od: 1 maja 2026 r.</p>

        <div className="font-dm-sans text-sm text-near-black leading-relaxed flex flex-col gap-10">

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">1. Administrator danych</h2>
            <p className="text-secondary-text">Administratorem Twoich danych osobowych jest <strong className="text-near-black">Adrian Imioło</strong> prowadzący działalność nierejestrowaną pod nazwą <strong className="text-near-black">Sznyt Design</strong>, Bolesława Śmiałego 8/24, 70-351 Szczecin, e-mail: kontakt@sznytdesign.pl.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">2. Jakie dane zbieramy i w jakim celu</h2>
            <div className="flex flex-col gap-4 text-secondary-text">
              <div>
                <p className="text-near-black font-medium mb-1">Realizacja zamówień</p>
                <p>Imię, nazwisko, adres dostawy, adres e-mail, numer telefonu, dane płatności (przetwarzane przez Stripe). Podstawa: art. 6 ust. 1 lit. b RODO (wykonanie umowy). Czas przechowywania: 5 lat od końca roku, w którym zamówienie zostało zrealizowane (obowiązek podatkowy).</p>
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
              <div>
                <p className="text-near-black font-medium mb-1">Analityka (Google Analytics 4 — planowana)</p>
                <p>Anonimowe dane o ruchu na stronie (strony odwiedzane, źródło wejścia, urządzenie). Podstawa: art. 6 ust. 1 lit. a RODO (zgoda na cookies analityczne). Czas przechowywania: zgodnie z ustawieniami GA4 (domyślnie 14 miesięcy).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">3. Podmioty przetwarzające dane (procesorzy)</h2>
            <ul className="flex flex-col gap-3 text-secondary-text">
              <li><strong className="text-near-black">Stripe Inc.</strong> — obsługa płatności online. Dane kart i transakcji przetwarzane są wyłącznie przez Stripe zgodnie z ich polityką prywatności (stripe.com/privacy).</li>
              <li><strong className="text-near-black">Clerk Inc.</strong> — zarządzanie kontami użytkowników i uwierzytelnianie. Polityka prywatności: clerk.com/privacy.</li>
              <li><strong className="text-near-black">Google LLC (GA4)</strong> — analityka ruchu na stronie (planowana). Polityka prywatności: policies.google.com/privacy.</li>
              <li><strong className="text-near-black">Dostawcy hostingu</strong> — Vercel (frontend), Railway (backend i baza danych). Dane przechowywane są na serwerach w UE lub z odpowiednimi zabezpieczeniami transferu.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">4. Twoje prawa (RODO)</h2>
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
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">5. Polityka cookies</h2>
            <div className="flex flex-col gap-4 text-secondary-text">
              <p>Strona sznytdesign.pl używa plików cookies i podobnych technologii przechowywania danych w przeglądarce.</p>
              <div>
                <p className="text-near-black font-medium mb-2">Rodzaje używanych cookies:</p>
                <ul className="flex flex-col gap-3">
                  <li>
                    <p className="text-near-black">Niezbędne (zawsze aktywne)</p>
                    <p>Koszyk zakupowy (localStorage) — przechowuje zawartość koszyka. Sesja użytkownika (Clerk) — utrzymuje zalogowanie. Zgoda na cookies (localStorage) — zapamiętuje Twój wybór.</p>
                  </li>
                  <li>
                    <p className="text-near-black">Płatności</p>
                    <p>Stripe używa własnych cookies niezbędnych do obsługi bezpiecznych płatności.</p>
                  </li>
                  <li>
                    <p className="text-near-black">Analityczne (wymagają zgody)</p>
                    <p>Google Analytics 4 — planowane. Używane do analizy ruchu na stronie w celu jej ulepszania. Aktywowane tylko po wyrażeniu zgody.</p>
                  </li>
                </ul>
              </div>
              <p>Zgodę na cookies analityczne możesz wycofać w każdej chwili, klikając „Ustawienia cookies" lub czyszcząc dane przeglądarki. Nie wpływa to na działanie sklepu.</p>
            </div>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">6. Newsletter</h2>
            <p className="text-secondary-text">Planujemy uruchomienie newslettera. Zapisując się, wyrażasz zgodę na przesyłanie informacji o nowościach i promocjach Sznyt Design. Możesz zrezygnować z subskrypcji w dowolnym momencie, klikając link w stopce każdej wiadomości. Twój adres e-mail nie będzie udostępniany osobom trzecim.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-near-black font-light mb-4">7. Zmiany polityki prywatności</h2>
            <p className="text-secondary-text">Zastrzegamy sobie prawo do zmian niniejszej Polityki. O istotnych zmianach poinformujemy e-mailem lub komunikatem na stronie. Aktualna wersja dostępna jest zawsze pod adresem sznytdesign.pl/polityka-prywatnosci.</p>
          </section>

        </div>
      </div>
    </main>
  );
}

export default PolitykaPrywatnosci;
