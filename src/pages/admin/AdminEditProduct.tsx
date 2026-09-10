import { useParams } from "react-router-dom";
import type { Product } from "../../types";
import { useResource } from "../../hooks/useResource";
import ProductForm from "./ProductForm";

function AdminEditProduct() {
  const { id } = useParams();
  const { data: product, error: loadFailed } = useResource<Product>(`/products/${id}`);

  if (loadFailed)
    return (
      <div className="max-w-2xl mx-auto py-10 px-6">
        <p className="text-red-600 font-dm-sans">Nie udało się załadować produktu.</p>
      </div>
    );

  // ProductForm seeds its fields at mount, so it waits for the real product
  if (!product)
    return (
      <div className="max-w-2xl mx-auto py-10 px-6">
        <p className="font-dm-sans text-sm text-secondary-text">Ładowanie...</p>
      </div>
    );

  return <ProductForm product={product} />;
}

export default AdminEditProduct;
