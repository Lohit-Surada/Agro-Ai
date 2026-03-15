// src/pages/Auth.jsx
import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import AuthForm from "../components/authcomponents/AuthForm";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Auth = () => {
  const { auth, isLoading } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "login"; // login/signup

  if (isLoading) {
    return null;
  }

  if (auth?.token) {
    return <Navigate to="/" replace />;
  }

  return <AuthForm type={type} />;
};

export default Auth;
