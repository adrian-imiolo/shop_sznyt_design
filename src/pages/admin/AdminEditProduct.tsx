import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

function AdminEditProduct() {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    price: "",
    imageUrl: "",
    lifestyleImageUrl: "",
    stock: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await fetch(`${import.meta.env.VITE_API_URL as string}/products/${id}`);
      const data = await res.json();
      setFormData({
        ...data,
        price: String(data.price),
        stock: String(data.stock),
      });
    }
    load();
  }, []);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL as string}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    <>
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h1 className="text-center p-6 text-2xl">Edytuj produkt</h1>
        {error && <p className="text-red-600 font-dm-sans mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
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
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
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
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <Link
              to="/admin"
              className="px-6 border border-near-black text-near-black font-dm-sans py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 cursor-pointer"
            >
              Anuluj
            </Link>
            <button className="px-6 bg-near-black text-warm-white font-dm-sans py-3 hover:bg-accent transition-colors duration-300 cursor-pointer">
              {loading ? "Wysyłanie" : "Potwierdź edycje"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AdminEditProduct;
