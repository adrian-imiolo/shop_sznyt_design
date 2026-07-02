import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";
import DemoBanner from "../../components/DemoBanner";
import Seo from "../../components/Seo";

function AdminLayout() {
  return (
    <>
      <Seo
        title="Panel admina"
        description="Panel administracyjny Sznyt Design — zarządzanie produktami i zamówieniami sklepu."
      />
      <DemoBanner />
      <AdminNav />
      <Outlet />
    </>
  );
}

export default AdminLayout;
