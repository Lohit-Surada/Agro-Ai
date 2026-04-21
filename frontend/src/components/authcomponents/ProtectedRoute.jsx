import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { usePopup } from "../../context/PopupContext";

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { auth, isLoading } = useContext(AuthContext);
  const { showPopup } = usePopup();
  const location = useLocation();
  const navigate = useNavigate();
  const role = auth?.role;
  const isLoggedIn = Boolean(auth?.token && role);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isLoggedIn) {
      showPopup("Login required", "alert");
      navigate("/", {
        replace: true,
      });
      return;
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isLoggedIn, allowedRoles, role, showPopup, navigate, location.pathname]);

  if (isLoading || !isLoggedIn) {
    return null;
  }
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
