import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function AdminEditProduct() {
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
      const res = await fetch(`http://localhost:3000/products/${id}`);
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
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: "PUT",
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
    <>
      <div className="flex justify-between py-5 w-full bg-near-black font-dm-sans text-warm-white">
        <h1 className="p-6 text-xl">Edytuj produkt</h1>
        <Link
          to="/admin"
          className="border border-white p-6 mr-5 hover:bg-warm-white hover:text-near-black transition-colors duration-300"
        >
          Wróć
        </Link>
      </div>
      <div className="max-w-2xl mx-auto py-10 px-6">
        {error && <p className="text-red-600 font-dm-sans mb-4">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-[auto_1fr] gap-4 items-center"
        >
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
          <button className="col-span-2 bg-near-black text-warm-white font-dm-sans py-3 hover:bg-accent transition-colors duration-300 cursor-pointer mt-4">
            {loading ? "Wysyłanie" : "Potwierdź edycje"}
          </button>
        </form>
      </div>
    </>
  );
}

export default AdminEditProduct;
