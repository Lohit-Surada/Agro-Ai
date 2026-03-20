import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/auth/AdminRecoveryFlow.css";

const questionPrompts = [
  {
    name: "favorite_place",
    label: "Favorite Place",
    question: "What is your favourite place?",
    placeholder: "Enter your answer",
  },
  {
    name: "favorite_actor",
    label: "Favorite Actor",
    question: "Who is your favourite actor?",
    placeholder: "Enter your answer",
  },
  {
    name: "favorite_car",
    label: "Favorite Car Model",
    question: "What is your favourite car model?",
    placeholder: "Enter your answer",
  },
];

const AdminPasswordRecovery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    favorite_place: "",
    favorite_actor: "",
    favorite_car: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const username = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (location.state?.username || params.get("username") || "").trim();
  }, [location.search, location.state]);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!username) {
      setError("Admin username or email is missing. Start the reset flow from the login page.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/auth/admin/verify-recovery/", {
        username,
        ...formData,
      });

      navigate("/admin/resetpassword", {
        replace: true,
        state: { resetToken: response.data?.reset_token, username },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Recovery answers are incorrect.");
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
            Admin Recovery Verification
          </div>

          {!username && (
            <div className="admin-recovery-info">
              Start from the login page and enter your admin email or username before opening password recovery.
            </div>
          )}
          {error && <div className="admin-recovery-error">{error}</div>}

          <form className="admin-recovery-form" onSubmit={handleSubmit} autoComplete="off">
            {questionPrompts.map((field) => (
              <div className="admin-recovery-field" key={field.name}>
                <label className="admin-recovery-label" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  className="admin-recovery-input"
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  required
                />
              </div>
            ))}

            <div className="admin-recovery-actions">
              <button type="submit" className="admin-recovery-button" disabled={loading || !username}>
                {loading ? "Verifying answers..." : "Reset password"}
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

export default AdminPasswordRecovery;
