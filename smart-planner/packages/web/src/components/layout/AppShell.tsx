import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

type NavItem = {
  to: string;
  label: string;
};

export default function AppShell() {
  const { user, logout } = useAuth();

  const links: NavItem[] = [];

  if (user.role === "student") {
    links.push(
      { to: "/student/dashboard", label: "Dashboard" },
      { to: "/student/assignments", label: "Assignments" },
      { to: "/student/ai", label: "AI Assistant" }
    );
  } else if (user.role === "parent") {
    links.push({ to: "/parent/dashboard", label: "Parent Dashboard" });
  } else if (user.role === "teacher") {
    links.push({ to: "/teacher/dashboard", label: "Teacher Dashboard" });
  }

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">Smart Planner</div>

        <div className="meta">
          Role: <strong>{user.role}</strong>{" "}
          {user.role === "student" && (user.paid ? "(Paid)" : "(Free)")}
        </div>

        {/* Navigation */}
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }: { isActive: boolean }) =>
                isActive ? "navLink active" : "navLink"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <button className="btn secondary" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}