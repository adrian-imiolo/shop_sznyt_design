import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import DemoBanner from "./DemoBanner";

function ShopLayout() {
  return (
    <>
      <DemoBanner />
      <Navbar />
      <Outlet />
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default ShopLayout;
