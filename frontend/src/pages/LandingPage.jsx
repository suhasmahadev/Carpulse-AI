import { Link } from "react-router-dom";
import Hyperspeed from "../components/Hyperspeed.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="landing-bg">
          <Hyperspeed />
        </div>

        <div className="landing-content">
          <h1>
            <span className="brand-main">Marine Fishery</span>{" "}
            <span className="brand-highlight">Management</span>
          </h1>
          <p className="landing-subtitle">
            Intelligent fishery management system that keeps your operations
            organized, monitored, and one step ahead.
          </p>

          <div className="landing-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn primary">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
