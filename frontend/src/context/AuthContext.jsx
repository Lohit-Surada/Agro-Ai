// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AUTH_API = `http://localhost:8000/api/auth`;
const emptyAuth = { token: null, role: null, username: null };
const AUTH_STORAGE_KEY = "agroai_auth_session";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(emptyAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) {
      setAuth(emptyAuth);
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.token && parsed?.role) {
        setAuth({
          token: parsed.token,
          role: parsed.role,
          username: parsed.username || null,
        });
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuth(emptyAuth);
      }
    } catch (_error) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setAuth(emptyAuth);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token, role, username) => {
    const nextAuth = { token, role, username: username || null };
    setAuth(nextAuth);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
  };

  const logout = async () => {
    try {
      await axios.post(`${AUTH_API}/logout/`, {}, { withCredentials: true });
    } catch (_error) {
      // Clear client state even if the backend session is already gone.
    } finally {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setAuth(emptyAuth);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
