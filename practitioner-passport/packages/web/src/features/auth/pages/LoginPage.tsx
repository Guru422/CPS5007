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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/redirect", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

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
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </label>

        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="muted" style={{ marginTop: 12 }}>
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}
