import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";

interface LoginLocationState {
  signupSuccess?: boolean;
  email?: string;
  fullName?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LoginLocationState | null) ?? null;
  const query = new URLSearchParams(location.search);
  const verifiedFromLink = query.get("verified") === "1";
  const verifiedEmail = query.get("email") ?? "";

  const [email, setEmail] = useState(state?.email ?? verifiedEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setErrorMessage("");

    login({
      id: crypto.randomUUID(),
      isAuthenticated: true,
      role,
      fullName
    });

    navigate("/redirect", { replace: true });
  }

  return (
    <div className="page">
      <h1>Login</h1>
      <p className="muted">Mock login for Practitioner Passport development.</p>
      {(state?.signupSuccess || verifiedFromLink) && (
        <p className="muted" style={{ marginTop: 8 }}>
          Account verified successfully. Please log in to continue.
        </p>
      )}
      {error && (
        <p className="muted" style={{ marginTop: 8, color: "#b42318" }}>
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="card">
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

          <label className="label">
            Role

            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="teacher">Academic</option>
            </select>
          </label>

          {errorMessage && (
            <div
              style={{
                color: "#b42318",
                fontSize: "14px"
              }}
            >
              {errorMessage}
            </div>
          )}

          <button className="btn primary" type="submit">
            Continue
          </button>
        </form>

        <div
          style={{
            marginTop: "18px",
            textAlign: "center"
          }}
        >
          <span className="muted">
            Need an account?{" "}
            <Link to="/signup">
              Create one
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}