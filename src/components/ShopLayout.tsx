import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";

function ShopLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <CookieBanner />
      <ScrollToTop />
    </>
  );
}

export default ShopLayout;
