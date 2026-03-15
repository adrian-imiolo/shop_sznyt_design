import { useState } from "react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Coś poszło nie tak. Spróbuj ponownie.");
        return;
      }
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError("Coś poszło nie tak. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* Hero header */}
      <section className="bg-near-black px-6 py-32 flex items-end">
        <div className="max-w-6xl mx-auto w-full">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
            Kontakt
          </p>
          <h1 className="font-cormorant text-5xl md:text-7xl text-warm-white font-light leading-tight">
            Porozmawiajmy.
          </h1>
        </div>
      </section>

      {/* Form section */}
      <section className="bg-warm-white px-6 py-24">
        <div className="max-w-xl mx-auto">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-10">
            Napisz do nas
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase">
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-dm-sans text-sm text-near-black bg-transparent border-b border-borders py-2 outline-none focus:border-near-black transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-dm-sans text-sm text-near-black bg-transparent border-b border-borders py-2 outline-none focus:border-near-black transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase">
                Wiadomość
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="font-dm-sans text-sm text-near-black bg-transparent border-b border-borders py-2 outline-none focus:border-near-black transition-colors resize-none"
              />
            </div>
            {success && (
              <p className="font-dm-sans text-sm text-accent">
                Wiadomość wysłana. Odezwiemy się wkrótce.
              </p>
            )}
            {error && (
              <p className="font-dm-sans text-sm text-red-500">{error}</p>
            )}
            <button
              disabled={loading}
              type="submit"
              className="self-start font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
            >
              {loading ? "Wysyłanie..." : "Wyślij"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Contact;
