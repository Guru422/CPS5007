import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Role, useAuth } from "../../../app/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState<Role>("student");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ role, fullName, email, studentId });
    navigate("/redirect", { replace: true });
  };

  return (
    <div className="page">
      <h1>Login</h1>
      <p className="muted">Mock login for Practitioner Passport development.</p>

      <form onSubmit={onSubmit} className="card">
        <label className="label">
          Full name
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </label>

        <label className="label">
          Email
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </label>

        {role === "student" && (
          <label className="label">
            Student ID
            <input
              className="input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter your student ID"
            />
          </label>
        )}

        <label className="label">
          Role
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>

        <button className="btn primary" type="submit">
          Login
        </button>

        <p className="muted" style={{ marginTop: 12 }}>
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}
