// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - blocks unauthenticated and role-mismatched access.
 *
 * Usage:
 *   <ProtectedRoute allowedRole="student">
 *     <StudentDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to the user's own dashboard instead
    const roleRoutes = {
      student: "/student",
      faculty: "/faculty",
      hod: "/hod",
      admin: "/admin",
    };
    return <Navigate to={roleRoutes[role] || "/login"} replace />;
  }

  return children;
}
