import { useAuth } from "../../app/providers/AuthProvider";

export default function TopNav() {
  const { user } = useAuth();

  return (
    <header className="topNav">
      <div className="topNavTitle">Practitioner Passport</div>
      <div className="topNavMeta">
        Signed in as <strong>{user.role}</strong>
        {user.fullName ? ` • ${user.fullName}` : ""}
      </div>
    </header>
  );
}