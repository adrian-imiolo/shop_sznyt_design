import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";

function ShopLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <CookieBanner />
    </>
  );
}

export default ShopLayout;
