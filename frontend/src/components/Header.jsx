import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { APP_NAME } from "../config/constants.js";
import { useState, useEffect } from "react";
import api from "../api/apiClient";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role === "student") {
      api.get("/academic/me").then(res => {
         if (res.data?.id) {
           api.get(`/api/student/notifications/${res.data.id}`)
              .then(nres => {
                 setNotifications(nres.data.notifications || []);
              }).catch(() => {});
         }
      }).catch(() => {});
    }
  }, [isAuthenticated, role]);

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabels = {
    student: "Student",
    faculty: "Professor",
    hod: "HOD",
    admin: "Principal",
  };

  const roleRoutes = {
    student: "/student",
    faculty: "/faculty",
    hod: "/hod",
    admin: "/admin",
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <span className="logo-icon">
          <i className="fa-solid fa-graduation-cap" />
        </span>
        <span className="logo-text">{APP_NAME}</span>
      </div>

      <nav className="header-nav">
        {isAuthenticated && role && (
          <>
            <Link to={roleRoutes[role]} className={isActive(roleRoutes[role])}>
              Dashboard
            </Link>
            {role === "student" && (
                <Link to="/student/planner" className={isActive("/student/planner")}>
                  AI Planner
                </Link>
            )}
            <Link to="/chat" className={isActive("/chat")}>
              Assistant
            </Link>
          </>
        )}
      </nav>

      <div className="header-right">
        {isAuthenticated && (
          <>
            {role === "student" && (
                <div style={{ position: "relative", marginRight: "1rem" }}>
                    <i 
                      className="fa-solid fa-bell" 
                      onClick={() => setShowDropdown(!showDropdown)}
                      style={{ fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
                    ></i>
                    {notifications.filter(n => !n.read_status).length > 0 && (
                        <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", borderRadius: "50%", padding: "2px 5px", fontSize: "0.6rem" }}>
                            {notifications.filter(n => !n.read_status).length}
                        </span>
                    )}

                    {showDropdown && (
                        <div style={{
                            position: "absolute", top: "2rem", right: "0", background: "white", width: "250px", 
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", 
                            borderRadius: "8px", border: "1px solid #e2e8f0", zIndex: 1000
                        }}>
                            <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontWeight: "bold", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                                Notifications
                            </div>
                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", background: n.read_status ? "white" : "#f0fdf4" }}>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#334155" }}>{n.message}</p>
                                        <small style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{new Date(n.timestamp).toLocaleDateString()}</small>
                                    </div>
                                )) : (
                                    <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                                        No alerts
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <span className="user-badge">
              <i className="fa-solid fa-user-circle" />
              <span className="user-badge-text">
                {user} <span className="role-chip">{roleLabels[role]}</span>
              </span>
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
