import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await API.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("auth_token");
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    if (data.token) localStorage.setItem("auth_token", data.token);
    setUser(data);
    return data;
  };

  const register = async (email, password, name) => {
    const { data } = await API.post("/auth/register", { email, password, name });
    if (data.token) localStorage.setItem("auth_token", data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await API.post("/auth/logout"); } catch {}
    localStorage.removeItem("auth_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
