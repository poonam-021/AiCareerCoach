import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}
