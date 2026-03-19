import { useState } from "react";
import { Link } from "react-router-dom";
import { Role, useAuth } from "../../../app/providers/AuthProvider";

export default function SignupPage() {
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSentMessage, setEmailSentMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailSentMessage("");
    setPreviewUrl(null);
    const passwordPolicy = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordPolicy.test(password)) {
      setError("Password must be at least 8 characters and include uppercase, number and special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }
    setSending(true);
    try {
      const result = await signup({ role, fullName, email, studentId, password, confirmPassword });
      setEmailSentMessage(result.message);
      setPreviewUrl(typeof result.previewUrl === "string" ? result.previewUrl : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <h1>Sign Up</h1>
      <p className="muted">Create a mock Practitioner Passport account.</p>
      {error && (
        <p className="muted" style={{ marginTop: 8, color: "#b42318" }}>
          {error}
        </p>
      )}
      {emailSentMessage && (
        <p className="muted" style={{ marginTop: 8 }}>
          {emailSentMessage}
        </p>
      )}
      {previewUrl && (
        <p className="muted" style={{ marginTop: 8 }}>
          Development preview: <a href={previewUrl}>open magic link</a>
        </p>
      )}

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

        <label className="label">
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 chars, uppercase, number, special"
          />
        </label>

        <label className="label">
          Confirm password
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
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

        <button className="btn primary" type="submit" disabled={sending}>
          {sending ? "Sending link..." : "Create account"}
        </button>

        <p className="muted" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
