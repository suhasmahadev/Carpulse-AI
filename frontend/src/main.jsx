import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StudentRegisterPage from "./pages/StudentRegisterPage.jsx";
import FacultyRegisterPage from "./pages/FacultyRegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Role dashboards
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentAiPlanner from "./pages/StudentAiPlanner.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ChatPage from "./pages/ChatPage.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import './styles/globals.css';
import './styles/chat.css';
import './styles/dashboards.css';
import './styles/student-dashboard.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register-student" element={<StudentRegisterPage />} />
            <Route path="register-faculty" element={<FacultyRegisterPage />} />
            
            {/* Student Dashboard */}
            <Route
              path="student"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="student/planner"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentAiPlanner />
                </ProtectedRoute>
              }
            />

            {/* Faculty Dashboard */}
            <Route
              path="faculty"
              element={
                <ProtectedRoute allowedRole="faculty">
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* HOD Dashboard */}
            <Route
              path="hod"
              element={
                <ProtectedRoute allowedRole="hod">
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="admin/*"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Chat Agent Page */}
            <Route
              path="chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
