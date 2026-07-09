import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import type { Product } from "../../types";
import { apiFetch, ApiError } from "../../lib/api";
import { useResource } from "../../hooks/useResource";

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

  const { data: product, error: loadFailed } = useResource<Product>(`/products/${id}`);

  useEffect(() => {
    if (!product) return;
    setFormData({
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      lifestyleImageUrl: product.lifestyleImageUrl,
      stock: String(product.stock),
    });
  }, [product]);

  const displayError = error || (loadFailed ? "Nie udało się załadować produktu." : "");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch(`/products/${id}`, {
        method: "PUT",
        auth: getToken,
        body: {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        },
      });
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
    } catch (err) {
      setError(
        err instanceof ApiError && err.message ? err.message : "Coś poszło nie tak, spróbuj ponownie",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h1 className="text-center p-6 text-2xl">Edytuj produkt</h1>
        {displayError && <p className="text-red-600 font-dm-sans mb-4">{displayError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:items-center">
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
