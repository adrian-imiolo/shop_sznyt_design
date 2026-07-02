import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";
import DemoBanner from "../../components/DemoBanner";

function AdminLayout() {
  return (
    <>
      <DemoBanner />
      <AdminNav />
      <Outlet />
    </>
  );
}

export default AdminLayout;
