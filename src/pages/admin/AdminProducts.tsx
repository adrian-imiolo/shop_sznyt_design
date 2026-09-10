import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import Skeleton from "../../components/Skeleton";
import RevenueBanner from "./RevenueBanner";
import { apiFetch } from "../../lib/api";
import { useResource } from "../../hooks/useResource";
import { useOptimisticSave } from "../../hooks/useOptimisticSave";
import { swapProductOrder } from "./productReorder";

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
  // delete mutates the list locally, after the DELETE call confirms — reorder's
  // optimistic/revert state lives in ProductsTable instead (useOptimisticSave)
  const [deleted, setDeleted] = useState<Products[] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const products = deleted ?? loaded;
  const error = actionError ?? (loadFailed ? "Nie udało się załadować produktów." : null);

  async function handleDelete(id: number) {
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE", auth: getToken });
      setDeleted(products!.filter((p) => p.id !== id));
    } catch {
      setActionError("Nie udało się usunąć produktu.");
    }
  }

  if (error)
    return (
      <div className="p-4 w-full">
        <RevenueBanner />
        <p className="mt-4 text-red-600 font-dm-sans text-sm">{error}</p>
      </div>
    );

  if (!products)
    return (
      <div className="p-4 w-full">
        <RevenueBanner />
        <div className="w-full overflow-x-auto">
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

      <div className="p-4 w-full">
        <RevenueBanner />
        {/* Remounts when a delete confirms (products.length changes), resetting
            the reorder hook's draft/persisted to the fresh list. Reordering
            never changes the length, so this only fires on delete. */}
        <ProductsTable
          key={products.length}
          initialProducts={products}
          onRequestDelete={(id) => {
            setIsDeleteModalOpen(true);
            setProductToDelete(id);
          }}
        />
      </div>
    </>
  );
}

function ProductsTable({
  initialProducts,
  onRequestDelete,
}: {
  initialProducts: Products[];
  onRequestDelete: (id: number) => void;
}) {
  const { getToken } = useAuth();

  const patchReorder = useCallback(
    (draft: Products[]) =>
      apiFetch("/products/reorder", {
        method: "PATCH",
        auth: getToken,
        body: draft.map((p) => ({ id: p.id, sortOrder: p.sortOrder })),
      }),
    [getToken],
  );

  const { draft: products, saving, error, edit, save } = useOptimisticSave(
    initialProducts,
    patchReorder,
    "Nie udało się zapisać kolejności.",
  );

  function move(index: number, direction: "up" | "down") {
    const updated = swapProductOrder(products, index, direction);
    if (!updated) return;
    edit(updated);
    save(updated);
  }

  return (
    <>
      {error && (
        <p role="alert" className="mt-4 text-red-600 font-dm-sans text-sm">{error}</p>
      )}
      <div className="w-full overflow-x-auto">
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
                      disabled={index === 0 || saving}
                      className="text-secondary-text hover:text-near-black disabled:opacity-20 disabled:cursor-not-allowed leading-none text-base p-2 -m-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Przesuń wyżej"
                      aria-label="Przesuń wyżej"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(index, "down")}
                      disabled={index === products.length - 1 || saving}
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
                    className="text-accent hover:underline min-h-[40px] flex items-center"
                    to={`/admin/produkty/${product.id}`}
                  >
                    Edytuj
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-800 min-h-[40px] flex items-center"
                    onClick={() => onRequestDelete(product.id)}
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
