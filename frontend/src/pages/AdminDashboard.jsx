import { useState } from "react";
import { Routes, Route, Navigate, NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AgentWidget from "../components/AgentWidget";

// Import context and new modular components
import { AdminDataProvider } from "./admin/AdminDataContext";
import AdminDashboardHome from "./admin/AdminDashboardHome";
import AdminDepartments from "./admin/AdminDepartments";
import AdminFaculty from "./admin/AdminFaculty";
import AdminStudents from "./admin/AdminStudents";
import AdminSystemAccess from "./admin/AdminSystemAccess";
import ChatPage from "../pages/ChatPage";
import "./admin/admin-styles.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useState(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: "fa-solid fa-chart-pie", exact: true },
    { name: "Students", path: "/admin/students", icon: "fa-solid fa-user-graduate" },
    { name: "Faculty", path: "/admin/faculty", icon: "fa-solid fa-chalkboard-user" },
    { name: "Departments", path: "/admin/departments", icon: "fa-solid fa-building" },
    { name: "System Access", path: "/admin/system-access", icon: "fa-solid fa-user-shield" },
    { name: "AI Assistant", path: "/admin/ai-assistant", icon: "fa-solid fa-robot" },
  ];

  return (
    <AdminDataProvider>
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileMenuOpen ? "open" : ""}`}>
          <div className="admin-logo">
            <i className="fa-solid fa-graduation-cap"></i>
           Campus mitra
          </div>
          <nav className="admin-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.exact}
                className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className={link.icon}></i>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="admin-main">
          {/* Top Navbar */}
          <header className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <i className="fa-solid fa-bars"></i>
              </button>
              <div className="admin-search">
                <i className="fa-solid fa-search" style={{ color: "#94a3b8" }}></i>
                <input type="text" placeholder="Search system..." />
              </div>
            </div>
            <div className="admin-topbar-right">
              <div className="admin-profile">
                <div className="admin-avatar">{user ? user.charAt(0).toUpperCase() : "A"}</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user}</span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Administrator</span>
                </div>
              </div>
              <button onClick={logout} className="admin-logout-btn" title="Logout">
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          </header>

          {/* Page Routing */}
          <main className="admin-content">
            <Routes>
              <Route path="/" element={<AdminDashboardHome />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="faculty" element={<AdminFaculty />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="system-access" element={<AdminSystemAccess />} />
              <Route path="ai-assistant" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
        
        {/* Chat fully isolated in its own page, so AgentWidget is removed from dashboard layout */}
      </div>
    </AdminDataProvider>
  );
}
