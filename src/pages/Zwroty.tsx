import { useState } from "react";
import { Link } from "react-router-dom";

function ZwrotForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL as string}/zwrot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, name, email, reason, bankAccount }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
    } catch {
      setError("Coś poszło nie tak. Napisz bezpośrednio na kontakt@sznytdesign.pl.");
    } finally {
      setLoading(false);
    }
  }

  if (success)
    return (
      <div className="flex flex-col gap-4 py-8">
        <p className="font-cormorant text-2xl text-near-black font-light">Zgłoszenie wysłane.</p>
        <p className="font-dm-sans text-sm text-secondary-text">Otrzymaliśmy Twoje zgłoszenie zwrotu. Wyślemy potwierdzenie na podany adres e-mail wraz z instrukcją dalszego postępowania.</p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
        Wypełnij formularz, a my odeślemy Ci potwierdzenie z instrukcją zwrotu. Produkt odeślij na adres podany w potwierdzeniu.
      </p>
      {[
        { label: "Numer zamówienia", value: orderNumber, set: setOrderNumber, type: "text", placeholder: "np. 42" },
        { label: "Imię i nazwisko", value: name, set: setName, type: "text", placeholder: "" },
        { label: "Adres e-mail", value: email, set: setEmail, type: "email", placeholder: "" },
        { label: "Numer konta bankowego (do zwrotu środków)", value: bankAccount, set: setBankAccount, type: "text", placeholder: "26 cyfr" },
      ].map((field) => (
        <div key={field.label} className="flex flex-col gap-2">
          <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase">{field.label}</label>
          <input
            type={field.type}
            value={field.value}
            placeholder={field.placeholder}
            onChange={(e) => field.set(e.target.value)}
            required
            className="font-dm-sans text-sm text-near-black bg-transparent border-b border-borders py-2 outline-none focus:border-near-black transition-colors"
          />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase">Powód zwrotu</label>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="font-dm-sans text-sm text-near-black bg-transparent border-b border-borders py-2 outline-none focus:border-near-black transition-colors resize-none"
        />
      </div>
      {error && <p className="font-dm-sans text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 disabled:opacity-50"
      >
        {loading ? "Wysyłanie..." : "Wyślij zgłoszenie zwrotu"}
      </button>
    </form>
  );
}

function ReklamacjaForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL as string}/reklamacja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, name, email, description }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
    } catch {
      setError("Coś poszło nie tak. Napisz bezpośrednio na kontakt@sznytdesign.pl.");
    } finally {
      setLoading(false);
    }
  }

  if (success)
    return (
      <div className="flex flex-col gap-4 py-8">
        <p className="font-cormorant text-2xl text-near-black font-light">Reklamacja przyjęta.</p>
        <p className="font-dm-sans text-sm text-secondary-text">Otrzymaliśmy Twoje zgłoszenie. Odezwiemy się w ciągu 14 dni roboczych — w odpowiedzi poprosimy o przesłanie zdjęć dokumentujących problem.</p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
        Opisz problem i wyślij formularz. W odpowiedzi poprosimy o przesłanie dokumentacji zdjęciowej. Reklamację rozpatrzymy w ciągu 14 dni roboczych.
      </p>
      {[
        { label: "Numer zamówienia", value: orderNumber, set: setOrderNumber, type: "text", placeholder: "np. 42" },
        { label: "Imię i nazwisko", value: name, set: setName, type: "text", placeholder: "" },
        { label: "Adres e-mail", value: email, set: setEmail, type: "email", placeholder: "" },
      ].map((field) => (
        <div key={field.label} className="flex flex-col gap-2">
          <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase">{field.label}</label>
          <input
            type={field.type}
            value={field.value}
            placeholder={field.placeholder}
            onChange={(e) => field.set(e.target.value)}
            required
            className="font-dm-sans text-sm text-near-black bg-transparent border-b border-borders py-2 outline-none focus:border-near-black transition-colors"
          />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase">Opis problemu</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Opisz dokładnie, co się stało. Zdjęcia wyślij w odpowiedzi na e-mail potwierdzający."
          className="font-dm-sans text-sm text-near-black bg-transparent border-b border-borders py-2 outline-none focus:border-near-black transition-colors resize-none placeholder:text-secondary-text/50"
        />
      </div>
      {error && <p className="font-dm-sans text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 disabled:opacity-50"
      >
        {loading ? "Wysyłanie..." : "Wyślij zgłoszenie reklamacji"}
      </button>
    </form>
  );
}

function Zwroty() {
  const [tab, setTab] = useState<"zwrot" | "reklamacja">("zwrot");

  return (
    <main className="bg-warm-white px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">Obsługa posprzedażowa</p>
        <h1 className="font-cormorant text-4xl md:text-5xl text-near-black font-light mb-4">
          Zwroty i reklamacje
        </h1>
        <p className="font-dm-sans text-sm text-secondary-text mb-12 max-w-xl">
          Masz 14 dni na zwrot produktu od momentu jego otrzymania. W przypadku wady lub uszkodzenia w transporcie — złóż reklamację. Masz pytania? Sprawdź <Link to="/faq" className="text-accent hover:underline">FAQ</Link> lub <Link to="/kontakt" className="text-accent hover:underline">napisz do nas</Link>.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-borders mb-10">
          <button
            onClick={() => setTab("zwrot")}
            className={`font-dm-sans text-sm tracking-widest uppercase pb-4 pr-8 transition-colors ${tab === "zwrot" ? "text-near-black border-b-2 border-near-black -mb-px" : "text-secondary-text hover:text-near-black"}`}
          >
            Zwrot towaru
          </button>
          <button
            onClick={() => setTab("reklamacja")}
            className={`font-dm-sans text-sm tracking-widest uppercase pb-4 pr-8 transition-colors ${tab === "reklamacja" ? "text-near-black border-b-2 border-near-black -mb-px" : "text-secondary-text hover:text-near-black"}`}
          >
            Reklamacja
          </button>
        </div>

        {tab === "zwrot" ? <ZwrotForm /> : <ReklamacjaForm />}

        {/* Info boxes */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-borders p-6 flex flex-col gap-2">
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase">Zwrot</p>
            <p className="font-cormorant text-xl text-near-black font-light">14 dni na decyzję</p>
            <p className="font-dm-sans text-xs text-secondary-text leading-relaxed">Produkt nieużywany, nieuszkodzony. Koszt odesłania pokrywa Klient. Zwrot środków do 14 dni od otrzymania paczki.</p>
          </div>
          <div className="border border-borders p-6 flex flex-col gap-2">
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase">Reklamacja</p>
            <p className="font-cormorant text-xl text-near-black font-light">Rozpatrzenie w 14 dni</p>
            <p className="font-dm-sans text-xs text-secondary-text leading-relaxed">Wada produktu lub uszkodzenie w transporcie. Koszt odesłania pokrywa Sprzedawca. Wymagana dokumentacja zdjęciowa.</p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Zwroty;
