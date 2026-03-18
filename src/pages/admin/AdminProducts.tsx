import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type Products = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  lifestyleImageUrl: string;
  stock: number;
};

function AdminProducts() {
  const [products, setProducts] = useState<Products[] | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:3000/products");
      const data = await res.json();
      setProducts(data);
    }
    load();
  }, []);

  function handleDelete(id: number) {
    fetch(`http://localhost:3000/products/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => setProducts(products!.filter((p) => p.id !== id)));
  }

  if (!products) return <p>Ładowanie...</p>;

  return (
    <>
      <div className="flex justify-between py-5 w-full bg-near-black text-xl font-dm-sans text-warm-white">
        <h1 className="p-6">Panel admina</h1>
        <Link
          to="/admin/produkty/nowy"
          className="border-solid border border-white p-6 mr-5 hover:bg-warm-white hover:text-near-black transition-colors duration-300"
        >
          Dodaj produkt
        </Link>
      </div>
      <div className="p-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
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
            {products.map((product) => (
              <tr className="border-b border-borders" key={product.id}>
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
                    onClick={() => handleDelete(product.id)}
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
