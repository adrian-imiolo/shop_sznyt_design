import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import Skeleton from "../../components/Skeleton";

type Products = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  lifestyleImageUrl: string;
  stock: number;
  sortOrder: number;
};

function AdminProducts() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Products[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/products`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts(data);
      } catch {
        setError("Nie udało się załadować produktów.");
      }
    }
    load();
  }, []);

  async function handleDelete(id: number) {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL as string}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setProducts(products!.filter((p) => p.id !== id));
    } catch {
      setError("Nie udało się usunąć produktu.");
    }
  }

  async function move(index: number, direction: "up" | "down") {
    if (!products) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= products.length) return;

    const updated = [...products];
    const aOrder = updated[index].sortOrder;
    const bOrder = updated[swapIndex].sortOrder;
    updated[index] = { ...updated[index], sortOrder: bOrder };
    updated[swapIndex] = { ...updated[swapIndex], sortOrder: aOrder };

    // swap positions in array too
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setProducts(updated);

    try {
      const token = await getToken();
      await fetch(`${import.meta.env.VITE_API_URL as string}/products/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify([
          { id: updated[index].id, sortOrder: updated[index].sortOrder },
          { id: updated[swapIndex].id, sortOrder: updated[swapIndex].sortOrder },
        ]),
      });
    } catch {
      setError("Nie udało się zapisać kolejności.");
    }
  }

  if (error) return <p className="p-4 text-red-600 font-dm-sans text-sm">{error}</p>;

  if (!products)
    return (
      <div className="flex flex-col items-center p-4">
        <table className="mt-2 w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left w-16">Kolejność</th>
              <th className="p-3 text-left">Nazwa</th>
              <th className="p-3 text-left w-32">Slogan</th>
              <th className="p-3 text-left">Opis</th>
              <th className="p-3 text-left w-16">Cena</th>
              <th className="p-3 text-left">Zdjęcie studio</th>
              <th className="p-3 text-left">Zdjęcie lifestyle</th>
              <th className="p-3 text-left w-16">Ilość</th>
              <th className="p-3 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr className="border-b border-borders" key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <td className="p-3" key={j}><Skeleton className="h-5 w-full" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <>
      {isDeleteModalOpen && (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-10"></div>
          <div className="flex flex-col items-center z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 bg-warm-white border border-borders p-20">
            <p className="font-cormorant text-2xl font-light text-near-black">
              Czy na pewno chcesz usunąć ten produkt?
            </p>
            <div className="flex gap-6 mt-4">
              <button
                className="border border-near-black px-6 py-2 hover:bg-near-black hover:text-warm-white transition-colors duration-300 font-dm-sans cursor-pointer"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Anuluj
              </button>
              <button
                className="bg-red-600 text-white px-6 py-2 hover:bg-red-800 transition-colors duration-300 font-dm-sans cursor-pointer"
                onClick={() => {
                  handleDelete(productToDelete!);
                  setIsDeleteModalOpen(false);
                }}
              >
                Usuń
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col items-center p-4">
        <table className="mt-2 w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left w-16">Kolejność</th>
              <th className="p-3 text-left">Nazwa</th>
              <th className="p-3 text-left w-32">Slogan</th>
              <th className="p-3 text-left">Opis</th>
              <th className="p-3 text-left w-16">Cena</th>
              <th className="p-3 text-left">Zdjęcie studio</th>
              <th className="p-3 text-left">Zdjęcie lifestyle</th>
              <th className="p-3 text-left w-16">Ilość</th>
              <th className="p-3 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr className="border-b border-borders" key={product.id}>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => move(index, "up")}
                      disabled={index === 0}
                      className="text-secondary-text hover:text-near-black disabled:opacity-20 disabled:cursor-not-allowed leading-none text-base"
                      title="Przesuń wyżej"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(index, "down")}
                      disabled={index === products.length - 1}
                      className="text-secondary-text hover:text-near-black disabled:opacity-20 disabled:cursor-not-allowed leading-none text-base"
                      title="Przesuń niżej"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.tagline}</td>
                <td className="p-3">{product.description}</td>
                <td className="p-3">{product.price}</td>
                <td className="p-3">{product.imageUrl}</td>
                <td className="p-3">{product.lifestyleImageUrl}</td>
                <td className="p-3">{product.stock}</td>
                <td className="gap-3 flex-col p-3">
                  <Link
                    className="text-accent hover:underline"
                    to={`/admin/produkty/${product.id}`}
                  >
                    Edytuj
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setProductToDelete(product.id);
                    }}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminProducts;
