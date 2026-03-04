import { Link } from "react-router-dom";

export default function FeatureLocked() {
  return (
    <div className="card">
      <h2>Feature Locked</h2>
      <p className="muted">This feature requires an active student subscription.</p>
      <Link className="btn secondary" to="/student/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}