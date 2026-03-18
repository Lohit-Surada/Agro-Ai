// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AUTH_API = `https://agro-aip-3.onrender.com/api/auth`;
const emptyAuth = { token: null, role: null, username: null };

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(emptyAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    const bootstrapSession = async () => {
      try {
        const response = await axios.get(`${AUTH_API}/session/`);
        if (response.data?.authenticated) {
          setAuth({
            token: response.data.token || null,
            role: response.data.role || null,
            username: response.data.username || null,
          });
        } else {
          setAuth(emptyAuth);
        }
      } catch (_error) {
        setAuth(emptyAuth);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const login = (token, role, username) => {
    setAuth({ token, role, username: username || null });
  };

  const logout = async () => {
    try {
      await axios.post(`${AUTH_API}/logout/`);
    } catch (_error) {
      // Clear client state even if the backend session is already gone.
    } finally {
      setAuth(emptyAuth);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
