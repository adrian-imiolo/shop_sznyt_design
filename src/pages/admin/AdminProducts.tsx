import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import Skeleton from "../../components/Skeleton";
import { apiFetch } from "../../lib/api";
import { useResource } from "../../hooks/useResource";

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
  const { data: loaded, error: loadFailed } = useResource<Products[]>("/products");
  // delete/reorder mutate the list locally; until then the loaded resource is the list
  const [override, setOverride] = useState<Products[] | null>(null);
  const products = override ?? loaded;
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const error = actionError ?? (loadFailed ? "Nie udało się załadować produktów." : null);

  async function handleDelete(id: number) {
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE", auth: getToken });
      setOverride(products!.filter((p) => p.id !== id));
    } catch {
      setActionError("Nie udało się usunąć produktu.");
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
    setOverride(updated);

    try {
      await apiFetch("/products/reorder", {
        method: "PATCH",
        auth: getToken,
        body: [
          { id: updated[index].id, sortOrder: updated[index].sortOrder },
          { id: updated[swapIndex].id, sortOrder: updated[swapIndex].sortOrder },
        ],
      });
    } catch {
      setActionError("Nie udało się zapisać kolejności.");
    }
  }

  if (error) return <p className="p-4 text-red-600 font-dm-sans text-sm">{error}</p>;

  if (!products)
    return (
      <div className="flex flex-col items-center p-4 w-full overflow-x-auto">
        <table className="mt-2 w-full border-collapse min-w-[900px]">
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
          <div className="flex flex-col items-center z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-warm-white border border-borders p-6 md:p-12">
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

      <div className="flex flex-col items-center p-4 w-full overflow-x-auto">
        <table className="mt-2 w-full border-collapse min-w-[900px]">
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
                  <div className="flex flex-col gap-1 -my-1">
                    <button
                      onClick={() => move(index, "up")}
                      disabled={index === 0}
                      className="text-secondary-text hover:text-near-black disabled:opacity-20 disabled:cursor-not-allowed leading-none text-base p-2 -m-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Przesuń wyżej"
                      aria-label="Przesuń wyżej"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(index, "down")}
                      disabled={index === products.length - 1}
                      className="text-secondary-text hover:text-near-black disabled:opacity-20 disabled:cursor-not-allowed leading-none text-base p-2 -m-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Przesuń niżej"
                      aria-label="Przesuń niżej"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.tagline}</td>
                <td className="p-3 max-w-[12rem] truncate" title={product.description}>{product.description}</td>
                <td className="p-3">{product.price}</td>
                <td className="p-3 max-w-[12rem] truncate" title={product.imageUrl}>{product.imageUrl}</td>
                <td className="p-3 max-w-[12rem] truncate" title={product.lifestyleImageUrl}>{product.lifestyleImageUrl}</td>
                <td className="p-3">{product.stock}</td>
                <td className="p-3">
                  <div className="flex flex-col gap-3">
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
                  </div>
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
