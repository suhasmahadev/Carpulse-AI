import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";

export default function StudentRegisterPage() {
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { loginFromToken } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register-student", { usn, email, password });
      
      const { access_token, refresh_token, role, username } = res.data;
      if (access_token) {
        // Assume context exposes a way to forcibly update login state with raw tokens
        // But context login() expects (email, password) normally.
        // Wait! The user's earlier requirement: "SUCCESS: Store tokens, Redirect -> /student"
        // Let's manually store tokens and use window.location or a native login mechanism
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("user_role", role);
        localStorage.setItem("username", username);
        
        // Hard refresh to let AuthContext pick it up seamlessly or call context login method.
        window.location.href = "/student"; 
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <h2>Student Registration</h2>
            <p className="login-subtitle">Link your university tracking account</p>
          </div>
          
          {error && (
            <div className="login-error">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="login-form">
            <div className="input-group">
              <div className="input-icon">
                <i className="fa-solid fa-id-card" />
              </div>
              <input
                type="text"
                placeholder="University Serial Number (e.g. 1RV21CS001)"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <i className="fa-solid fa-envelope" />
              </div>
              <input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <i className="fa-solid fa-lock" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Registering...
                </span>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus" />
                  Complete Registration
                </>
              )}
            </button>

            <div className="login-register-link" style={{ textAlign: "center", marginTop: "1rem" }}>
              Already registered? <Link to="/login" style={{ color: "#FF5A1F", textDecoration: "none" }}>Login here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
