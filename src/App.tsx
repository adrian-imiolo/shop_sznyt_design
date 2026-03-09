import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div>
      <Navbar />
      {products.map((product) => (
        <div key={product.id}>
          <p>Product: {product.name}</p>
          <p>Price: {product.price}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
