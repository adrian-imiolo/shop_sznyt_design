import { useState } from "react";

function AdminAddProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    price: "",
    imageUrl: "",
    lifestyleImageUrl: "",
    stock: "",
  });

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Coś poszło nie tak");
        return;
      }
      setFormData({
        name: "",
        tagline: "",
        description: "",
        price: "",
        imageUrl: "",
        lifestyleImageUrl: "",
        stock: "",
      });
    } catch {
      setError("Coś poszło nie tak, spróbuj ponownie");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Stwórz nowy produkt</h1>
      {error && <p className="text-red-600 font-dm-sans">{error}</p>}
      <form onSubmit={handleSubmit} className="flex">
        <label>Nazwa</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Slogan</label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) =>
            setFormData({ ...formData, tagline: e.target.value })
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Opis</label>
        <textarea
          rows={5}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Cena</label>
        <input
          type="text"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Zdjęcie studio</label>
        <input
          type="text"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Zdjęcie lifestyle</label>
        <input
          type="text"
          value={formData.lifestyleImageUrl}
          onChange={(e) =>
            setFormData({ ...formData, lifestyleImageUrl: e.target.value })
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Ilość</label>
        <input
          type="text"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <button className="border border-borders cursor-pointer">
          {loading ? "Wysyłanie" : "Stwórz"}
        </button>
      </form>
    </section>
  );
}

export default AdminAddProduct;
