import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role, useAuth } from "../../../app/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [emailOrId, setEmailOrId] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [paid, setPaid] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ role, paid, emailOrId });
    navigate("/redirect", { replace: true });
  };

  return (
    <div className="page">
      <h1>Login (Mock)</h1>
      <p className="muted">Temporary login for front-end development.</p>

      <form onSubmit={onSubmit} className="card">
        <label className="label">
          Student ID / Email
          <input
            className="input"
            value={emailOrId}
            onChange={(e) => setEmailOrId(e.target.value)}
            placeholder="e.g. 2413708 or name@uni.ac.uk"
          />
        </label>

        <label className="label">
          Role
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>

        {role === "student" && (
          <label className="checkboxRow">
            <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
            Paid subscription active
          </label>
        )}

        <button className="btn primary" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}