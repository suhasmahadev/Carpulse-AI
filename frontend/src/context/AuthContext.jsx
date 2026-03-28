// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { refreshTokenRequest, fetchCurrentUser } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate state from localStorage on mount
  useEffect(() => {
    const savedAccess = localStorage.getItem("accessToken");
    const savedRefresh = localStorage.getItem("refreshToken");
    const savedRole = localStorage.getItem("role");
    const savedUser = localStorage.getItem("username");

    if (savedAccess && savedRefresh) {
      setAccessToken(savedAccess);
      setRefreshToken(savedRefresh);
      setRole(savedRole);
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((data) => {
    // data: { access_token, refresh_token, role, username }
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setRole(data.role);
    setUser(data.username);

    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const savedRefresh = localStorage.getItem("refreshToken");
    if (!savedRefresh) {
      logout();
      return null;
    }

    try {
      const data = await refreshTokenRequest(savedRefresh);
      setAccessToken(data.access_token);
      localStorage.setItem("accessToken", data.access_token);
      return data.access_token;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  const value = {
    user,
    role,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    loading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
