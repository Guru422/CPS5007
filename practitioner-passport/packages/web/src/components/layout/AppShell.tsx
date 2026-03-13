import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import TopNav from "./TopNav";

export default function AppShell() {
  return (
    <div className="shell">
      <SideNav />
      <main className="content">
        <TopNav />
        <Outlet />
      </main>
    </div>
  );
}
