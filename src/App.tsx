import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import ScrollOnNav from "./utils/ScrollOnNav";
import AdminProducts from "./pages/admin/AdminProducts";
import ShopLayout from "./components/ShopLayout";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollOnNav />
        <Routes>
          <Route element={<ShopLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sklep" element={<Shop />} />
            <Route path="/sklep/:id" element={<ProductDetail />} />
            <Route path="/o-nas" element={<About />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/koszyk" element={<Cart />} />
          </Route>
          <Route path="/admin" element={<AdminProducts />} />
          <Route path="/admin/produkty/nowy" element={<AdminProducts />} />
          <Route path="/admin/produkty/:id" element={<AdminProducts />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
