"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);   // { username, role }
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);  // true while we check localStorage

  // On mount: restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("ccl_token");
    const savedUser  = localStorage.getItem("ccl_user");
    if (savedToken && savedUser) {
      // eslint-disable-next-line
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed.");
    const userInfo = { username: data.username, role: data.role };
    localStorage.setItem("ccl_token", data.access_token);
    localStorage.setItem("ccl_user", JSON.stringify(userInfo));
    setToken(data.access_token);
    setUser(userInfo);
    return userInfo;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ccl_token");
    localStorage.removeItem("ccl_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
