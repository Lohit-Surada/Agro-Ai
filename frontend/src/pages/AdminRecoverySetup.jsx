import React, { useContext, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/auth/AuthForm.css";

const fallbackQuestions = {
  favorite_place: "what is your favourite place?",
  favorite_actor: "who is your favourite actor?",
  favorite_car: "what is you favourite car model?",
};

const AdminRecoverySetup = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const setupToken = location.state?.setupToken || "";
  const questions = location.state?.questions || fallbackQuestions;

  const [formData, setFormData] = useState({
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
    if (!setupToken) {
      setError("Recovery setup token missing. Signup again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post(`https://agro-aip-10.onrender.com/api/auth/admin/recovery-setup/`, {
        setup_token: setupToken,
        ...formData,
      });
      logout();
      navigate("/auth?type=login", {
          replace: true,
          state: { message: "Recovery setup completed. Please login as admin." },
        });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save recovery answers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h3>ADMIN RECOVERY SETUP</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form className="recovery-form" onSubmit={handleSubmit} autoComplete="off">
        <label className="recovery-label">{questions.favorite_place}</label>
        <input
          type="text"
          name="favorite_place"
          value={formData.favorite_place}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <label className="recovery-label">{questions.favorite_actor}</label>
        <input
          type="text"
          name="favorite_actor"
          value={formData.favorite_actor}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <label className="recovery-label">{questions.favorite_car}</label>
        <input
          type="text"
          name="favorite_car"
          value={formData.favorite_car}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Answers"}
        </button>
      </form>
    </div>
  );
};

export default AdminRecoverySetup;
