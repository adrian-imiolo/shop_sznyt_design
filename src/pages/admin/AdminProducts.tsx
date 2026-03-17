import { useState, useEffect } from "react";

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
      <div className="flex-col items-center align-center mx-auto mt-5">
        <h1>Panel admina</h1>
        {products.map((product) => (
          <div
            className="font-dm-sans flex mx-auto items-center my-20 border-borders border-solid border-2 w-1/2 gap-5"
            key={product.id}
          >
            <ul className="border-borders">
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Id:</strong> {product.id}
              </li>
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Nazwa:</strong> {product.name}
              </li>
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Slogan:</strong> {product.tagline}
              </li>
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Opis:</strong> {product.description}
              </li>
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Cena:</strong> {product.price}
              </li>
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Zdjęcie studio:</strong> {product.imageUrl}
              </li>
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Zdjęcie lifestyle:</strong> {product.lifestyleImageUrl}
              </li>
              <li className="p-2 border-solid border-2 border-borders">
                <strong>Ilość:</strong> {product.stock}
              </li>
            </ul>
            <button className="px-4 cursor-pointer">Edytuj</button>
            <button
              className="px-4 cursor-pointer"
              onClick={() => handleDelete(product.id)}
            >
              Usuń
            </button>
          </div>
        ))}
      </div>
    </>
  );
  // return console.log(products);
}

export default AdminProducts;
