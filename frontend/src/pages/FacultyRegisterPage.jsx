import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";

export default function FacultyRegisterPage() {
  const [faculty_code, setFacultyCode] = useState("");
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
      const res = await api.post("/auth/register-faculty", { faculty_code, email, password });
      
      const { access_token, refresh_token, role, username } = res.data;
      if (access_token) {
        // SUCCESS: Store tokens, Redirect -> /faculty
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("user_role", role);
        localStorage.setItem("username", username);
        
        window.location.href = "/faculty"; 
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
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
              <i className="fa-solid fa-chalkboard-teacher" />
            </div>
            <h2>Faculty Registration</h2>
            <p className="login-subtitle">Link your university academic account</p>
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
                <i className="fa-solid fa-id-badge" />
              </div>
              <input
                type="text"
                placeholder="Faculty Code (e.g. 4MH23)"
                value={faculty_code}
                onChange={(e) => setFacultyCode(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <i className="fa-solid fa-envelope" />
              </div>
              <input
                type="email"
                placeholder="faculty@university.edu"
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
