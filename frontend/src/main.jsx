import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import EstimatePricePage from "./pages/EstimatePricePage.jsx";
import VesselsPage from "./pages/VesselsPage.jsx";
import SpeciesPage from "./pages/SpeciesPage.jsx";
import CatchPage from "./pages/CatchPage.jsx";
import AuctionsPage from "./pages/AuctionsPage.jsx";
import StoragePage from "./pages/StoragePage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import './styles/globals.css';
import './styles/logs.css';
import './styles/chat.css';


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/vessels"
              element={
                <ProtectedRoute>
                  <VesselsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/species"
              element={
                <ProtectedRoute>
                  <SpeciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/catch"
              element={
                <ProtectedRoute>
                  <CatchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/auctions"
              element={
                <ProtectedRoute>
                  <AuctionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/storage"
              element={
                <ProtectedRoute>
                  <StoragePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/estimate" element={
              <ProtectedRoute><EstimatePricePage /></ProtectedRoute>} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
