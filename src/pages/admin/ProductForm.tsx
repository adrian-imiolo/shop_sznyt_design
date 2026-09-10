import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import type { Product } from "../../types";
import { apiFetch, ApiError } from "../../lib/api";
import { validateProductForm } from "./productFormValidation";
import type { ProductFieldErrors, ProductFormValues } from "./productFormValidation";

type ProductFieldConfig = {
  key: keyof ProductFormValues;
  label: string;
  kind?: "textarea";
};

const PRODUCT_FIELDS: ProductFieldConfig[] = [
  { key: "name", label: "Nazwa" },
  { key: "tagline", label: "Slogan" },
  { key: "description", label: "Opis", kind: "textarea" },
  { key: "price", label: "Cena" },
  { key: "imageUrl", label: "Zdjęcie studio" },
  { key: "lifestyleImageUrl", label: "Zdjęcie lifestyle" },
  { key: "stock", label: "Ilość" },
];

const BLANK_VALUES: ProductFormValues = {
  name: "",
  tagline: "",
  description: "",
  price: "",
  imageUrl: "",
  lifestyleImageUrl: "",
  stock: "",
};

const INPUT_CLASS = "border border-borders text-sm font-dm-sans p-2";

function formValues(product?: Product): ProductFormValues {
  if (!product) return BLANK_VALUES;
  return {
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    price: String(product.price),
    imageUrl: product.imageUrl,
    lifestyleImageUrl: product.lifestyleImageUrl,
    stock: String(product.stock),
  };
}

type ProductFormProps = {
  /** Absent means create a new product; present means edit this one. */
  product?: Product;
};

/**
 * The admin product form behind both create and edit (issue #162): owns field
 * state, validation, and the submit lifecycle, so the pages that mount it carry
 * nothing but their own data loading.
 *
 * `product` seeds state at mount and is never re-read — an editing caller must
 * mount this only once the product has loaded.
 */
function ProductForm({ product }: ProductFormProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<ProductFormValues>(() => formValues(product));
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const validation = validateProductForm(values);
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      return;
    }

    setFieldErrors({});
    setError("");
    setLoading(true);
    try {
      await apiFetch(product ? `/products/${product.id}` : "/products", {
        method: product ? "PUT" : "POST",
        auth: getToken,
        body: validation.payload,
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
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-center p-6 text-2xl">
        {product ? "Edytuj produkt" : "Dodaj produkt"}
      </h1>
      {error && <p className="text-red-600 font-dm-sans mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:items-center">
          {PRODUCT_FIELDS.map(({ key, label, kind }) => (
            <Fragment key={key}>
              <label htmlFor={`product-${key}`}>{label}</label>
              <div className="flex flex-col gap-1">
                {kind === "textarea" ? (
                  <textarea
                    id={`product-${key}`}
                    required
                    rows={5}
                    value={values[key]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                ) : (
                  <input
                    id={`product-${key}`}
                    required
                    type="text"
                    value={values[key]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                )}
                {fieldErrors[key] && (
                  <p className="font-dm-sans text-xs text-red-500">{fieldErrors[key]}</p>
                )}
              </div>
            </Fragment>
          ))}
        </div>
        <div className="flex gap-4 mt-4 justify-center">
          <Link
            to="/admin"
            className="px-6 border border-near-black text-near-black font-dm-sans py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 cursor-pointer"
          >
            Anuluj
          </Link>
          <button
            disabled={loading}
            className="px-6 bg-near-black text-warm-white font-dm-sans py-3 hover:bg-accent transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Wysyłanie" : product ? "Potwierdź edycję" : "Stwórz produkt"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
