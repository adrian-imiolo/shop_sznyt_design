import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

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
      navigate("/admin");
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
          required
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Slogan</label>
        <input
          required
          type="text"
          value={formData.tagline}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tagline: e.target.value }))
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Opis</label>
        <textarea
          required
          rows={5}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Cena</label>
        <input
          required
          type="text"
          value={formData.price}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, price: e.target.value }))
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Zdjęcie studio</label>
        <input
          required
          type="text"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Zdjęcie lifestyle</label>
        <input
          required
          type="text"
          value={formData.lifestyleImageUrl}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              lifestyleImageUrl: e.target.value,
            }))
          }
          className="border border-borders text-sm font-dm-sans p-2"
        />
        <label>Ilość</label>
        <input
          required
          type="text"
          value={formData.stock}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, stock: e.target.value }))
          }
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
