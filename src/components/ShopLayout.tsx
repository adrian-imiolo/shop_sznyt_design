import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import DemoBanner from "./DemoBanner";
import CartFeedback from "./CartFeedback";

function ShopLayout() {
  return (
    <>
      <DemoBanner />
      <Navbar />
      <Outlet />
      <Footer />
      <ScrollToTop />
      <CartFeedback />
    </>
  );
}

export default ShopLayout;
