import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

function AdminLayout() {
  return (
    <>
      <AdminNav />
      <Outlet />
    </>
  );
}

export default AdminLayout;
