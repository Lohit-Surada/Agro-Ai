// src/components/authcomponents/AuthForm.jsx
import React, { useState, useContext } from "react";
import "../../styles/auth/AuthForm.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopup } from "../../context/PopupContext";
import { validateEmail, validatePassword } from "../../utils/validation";

const AuthForm = ({ type }) => {
  const { login } = useContext(AuthContext);
  const { showPopup } = usePopup();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState(location.state?.message || "");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowResetPassword(false);
    setInfoMessage("");

    if (type === "signup" && !formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (type === "signup" && !validateEmail(formData.email)) {
      setError("Invalid email!");
      return;
    }
    if (type === "login" && !formData.username.trim()) {
      setError("Username or email is required");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 6 characters!");
      return;
    }

    setError("");
    const baseURL = `https://agro-aip-10.onrender.com/api/auth`;

    try {
      let response;
      const endpoint = `${baseURL}/${type}/`;

      if (type === "signup") {
        response = await axios.post(endpoint, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        if (response.data.requires_recovery_setup) {
          navigate("/admin/recovery-setup", {
            replace: true,
            state: {
              setupToken: response.data.setup_token,
              questions: response.data.questions,
              username: response.data.username,
            },
          });
          return;
        }
        showPopup("Signup successful. Please login to continue.", "success");
        navigate("/auth?type=login", {
          replace: true,
          state: { message: "Signup completed. Please login." },
        });
        return;
      } else {
        response = await axios.post(endpoint, {
          username: formData.username,
          password: formData.password,
        });
      }

      if (response.data.role) {
        login(response.data.token, response.data.role, response.data.username);
        navigate("/", { replace: true });
      } else {
        setError(response.data.error || "Unexpected server response");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || err.response.data.message || "Server error! Try again later.");
        if (type === "login" && err.response.data.show_reset_password) {
          setShowResetPassword(true);
        } else if (type === "login") {
          showPopup("Before login, signup is required.", "error");
        }
      } else {
        setError("Server error! Try again later.");
      }
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h3 className="auth-title">
          {type === "signup" ? "Create Account" : "Login"}
        </h3>

        {infoMessage && <p className="auth-info-msg">{infoMessage}</p>}
        {error && <p className="auth-error-msg">{error}</p>}

        <form onSubmit={handleSubmit} autoComplete="off" className="auth-form-fields">
          {type === "signup" && (
            <>
              <div className="auth-field">
                <label className="auth-field-label">Name</label>
                <div className="auth-field-input-wrap">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-field-label">Email</label>
                <div className="auth-field-input-wrap">
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </>
          )}
          {type === "login" && (
            <div className="auth-field">
              <label className="auth-field-label">Email</label>
              <div className="auth-field-input-wrap">
                <input
                  type="text"
                  name="username"
                  placeholder="Username or email"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}
          <div className="auth-field">
            <label className="auth-field-label">Password</label>
            <div className="auth-field-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-show-btn"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  /* Eye-slash: password visible, click to hide */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  /* Eye-open: password hidden, click to show */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="auth-submit-btn">
            {type === "signup" ? "Create Account" : "Login"}
          </button>
        </form>

        {type === "signup" ? (
          <p className="auth-switch-text">
            Already registered?{" "}
            <a href="/auth?type=login">Login here</a>
          </p>
        ) : (
          <>
            <p className="auth-switch-text">
              New to AgroAI?{" "}
              <a href="/auth?type=signup">Register Here</a>
            </p>
            {showResetPassword && (
              <p className="auth-switch-text">
                Forgot password?{" "}
                <a
                  href={`/admin/passwordrecovery${
                    formData.username ? `?username=${encodeURIComponent(formData.username)}` : ""
                  }`}
                >
                  Reset Password
                </a>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
