import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth/AuthForm.css";

const SuperadminResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    favorite_place: "",
    favorite_actor: "",
    favorite_car: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/superadmin/verify-recovery/`, formData);
      navigate("/superadmin/password-recovery", {
        replace: true,
        state: { resetToken: response.data?.reset_token },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify recovery answers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h3>ADMIN RECOVERY QUESTIONS</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form className="recovery-form" onSubmit={handleSubmit} autoComplete="off">
        <label className="recovery-label">what is your favourite place?</label>
        <input
          type="text"
          name="favorite_place"
          value={formData.favorite_place}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <label className="recovery-label">who is your favourite actor?</label>
        <input
          type="text"
          name="favorite_actor"
          value={formData.favorite_actor}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <label className="recovery-label">what is you favourite car model?</label>
        <input
          type="text"
          name="favorite_car"
          value={formData.favorite_car}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <label className="recovery-label">Username or Email</label>
        <input
          type="text"
          name="username"
          placeholder="Admin Username or Email"
          value={formData.username}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>
      <p>
        Back to <a href="/auth?type=login">Login</a>
      </p>
    </div>
  );
};

export default SuperadminResetPassword;
