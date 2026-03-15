import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/auth/AuthForm.css";

const SuperadminPasswordRecovery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken || "";

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!resetToken) {
      setError("Reset session expired. Start from recovery questions again.");
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/api/auth/admin/reset-password/", {
        reset_token: resetToken,
        new_password: formData.new_password,
      });
      setMessage(response.data?.message || "Password reset successful");
      setTimeout(() => navigate("/auth?type=login", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h3>ADMIN PASSWORD RECOVERY</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form className="recovery-form" onSubmit={handleSubmit} autoComplete="off">
        <label className="recovery-label">New Password</label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />
        <label className="recovery-label">Confirm Password</label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default SuperadminPasswordRecovery;
