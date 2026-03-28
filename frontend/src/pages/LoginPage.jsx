// src/pages/LoginPage.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginRequest } from "../api/authApi";

const ROLES = [
  { value: "student", label: "Student", icon: "fa-user-graduate" },
  { value: "faculty", label: "Professor", icon: "fa-chalkboard-teacher" },
  { value: "hod", label: "HOD", icon: "fa-user-tie" },
  { value: "admin", label: "Principal", icon: "fa-user-shield" },
];

const roleRoutes = {
  student: "/student",
  faculty: "/faculty",
  hod: "/hod",
  admin: "/admin",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginRequest(email, password);

      // Verify role matches selection
      if (data.role !== selectedRole) {
        setError(`Your account role is "${data.role}", not "${selectedRole}". Please select the correct role.`);
        setIsLoading(false);
        return;
      }

      login(data);
      navigate(roleRoutes[data.role]);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Login failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Dynamic Background */}
      <div className="login-bg-overlay" />
      
      <div className="login-container glass-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-glow">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <h1 className="neon-text">Campus Mitra</h1>
            <p className="login-subtitle">System Authentication Gateway</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Role Selector */}
            <div className="role-selector capsule-selector">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-btn ${selectedRole === r.value ? "active" : ""}`}
                  onClick={() => setSelectedRole(r.value)}
                >
                  <i className={`fa-solid ${r.icon}`} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Email */}
            <div className="input-group clear-input-group">
              <div className="input-icon">
                <i className="fa-solid fa-envelope" />
              </div>
              <input
                id="login-email"
                type="email"
                placeholder="Secure ID (Email)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="clear-input"
              />
            </div>

            {/* Password */}
            <div className="input-group clear-input-group">
              <div className="input-icon">
                <i className="fa-solid fa-lock" />
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="Access Token (Password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="clear-input"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="login-error glow-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn projection-capsule"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner neon-spinner" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <i className="fa-solid fa-satellite-dish" />
                  INITIATE PROTOCOL
                </>
              )}
            </button>
            <div className="login-register-link" style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link to="/register-student" style={{ color: "#FF5A1F", textDecoration: "none" }}>
                New Student? Register here
              </Link>
              <br />
              <Link to="/register-faculty" style={{ color: "#FF5A1F", textDecoration: "none", marginTop: "0.5rem", display: "inline-block" }}>
                New Faculty? Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
