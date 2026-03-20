import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/auth/AdminRecoveryFlow.css";

const AdminResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = useMemo(() => location.state?.resetToken || "", [location.state]);
  const username = useMemo(() => location.state?.username || "", [location.state]);

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
      setError("Reset session expired. Verify your recovery answers again.");
      return;
    }

    if (formData.new_password.length < 6) {
      setError("Password must be at least 6 characters long.");
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

      setMessage(response.data?.message || "Password reset successful.");
      setTimeout(() => navigate("/auth?type=login", { replace: true }), 1400);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-recovery-page">
      <div className="admin-recovery-shell">
        <div className="admin-recovery-card">
          <div className="admin-recovery-badge">
            <span className="admin-recovery-badge-dot" />
            Admin Password Reset
          </div>
          {error && <div className="admin-recovery-error">{error}</div>}
          {message && <div className="admin-recovery-success">{message}</div>}

          <form className="admin-recovery-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="admin-recovery-field">
              <label className="admin-recovery-label" htmlFor="new_password">
                New password
              </label>
              <input
                id="new_password"
                className="admin-recovery-input"
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter a new password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="admin-recovery-field">
              <label className="admin-recovery-label" htmlFor="confirm_password">
                Confirm password
              </label>
              <input
                id="confirm_password"
                className="admin-recovery-input"
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter the password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="admin-recovery-actions">
              <button type="submit" className="admin-recovery-button" disabled={loading}>
                {loading ? "Resetting Password..." : "Save New Password"}
              </button>
              <div className="admin-recovery-secondary">
                Back to <Link to="/auth?type=login">Login</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;
