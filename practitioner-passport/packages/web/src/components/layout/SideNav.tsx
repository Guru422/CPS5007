import { NavLink } from "react-router-dom";
import { Role, useAuth } from "../../app/providers/AuthProvider";

type NavItem = {
  to: string;
  label: string;
};

function getLinks(role: Role): NavItem[] {
  if (role === "student") {
    return [
      { to: "/student/dashboard", label: "Dashboard" },
      { to: "/student/competencies", label: "Competencies" },
      { to: "/student/qualifications", label: "Qualifications" },
      { to: "/student/development", label: "Development Log" },
      { to: "/student/placements", label: "Placements" },
      { to: "/student/ai-cv", label: "AI CV Generator" },
      { to: "/student/chat", label: "Chat" },
    ];
  }

  if (role === "mentor") {
    return [
      { to: "/mentor/dashboard", label: "Dashboard" },
      { to: "/mentor/progress", label: "Student Progress" },
      { to: "/mentor/qualifications", label: "Qualifications" },
      { to: "/mentor/placements", label: "Placement Progress" },
    ];
  }

  return [
    { to: "/teacher/dashboard", label: "Dashboard" },
    { to: "/teacher/placement-requests", label: "Placement Requests" },
    { to: "/teacher/chat", label: "Chat" },
    { to: "/teacher/reports", label: "Reports" },
  ];
}

export default function SideNav() {
  const { user, logout } = useAuth();
  const links = getLinks(user.role);

  return (
    <aside className="sidebar">
      <div className="brand">Practitioner Passport</div>

      <div className="meta">
        Role: <strong>{user.role}</strong>
      </div>

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

      <button className="btn secondary" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
