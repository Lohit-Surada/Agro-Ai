import React, { useContext, useState } from "react";
import axios from "axios";
import "../styles/crop/CropRecommendation.css";
import { usePopup } from "../context/PopupContext";
import { AuthContext } from "../context/AuthContext";

function CropRecommendation() {
  const { showPopup } = usePopup();
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const [result, setResult] = useState("");
  const API = axios.create({
    baseURL: `http://localhost:8000/api`,
    withCredentials: true,
    headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/crop/predict/", formData);
      setResult(res.data.recommended_crop);
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.error || "Prediction failed";
      showPopup(message, "error");
    }
  };

  return (
    <div className="crop-reco-page">
      <div className="crop-reco-card">
         <div className="crop-hero-badge"> AI Powered</div>
        <h2>{"\uD83C\uDF3E Crop Recommendation"}</h2>
        <p className="crop-reco-subtitle">
          Enter soil and climate values to get the best crop suggestion.
        </p>

        <form className="crop-reco-form" onSubmit={handleSubmit}>
          <input type="text" inputMode="decimal" name="N" value={formData.N} placeholder="Nitrogen (N)" onChange={handleChange} required />
          <input type="text" inputMode="decimal" name="P" value={formData.P} placeholder="Phosphorus (P)" onChange={handleChange} required />
          <input type="text" inputMode="decimal" name="K" value={formData.K} placeholder="Potassium (K)" onChange={handleChange} required />
          <input type="text" inputMode="decimal" name="temperature" value={formData.temperature} placeholder="Temperature (C)" onChange={handleChange} required />
          <input type="text" inputMode="decimal" name="humidity" value={formData.humidity} placeholder="Humidity (%)" onChange={handleChange} required />
          <input type="text" inputMode="decimal" name="ph" value={formData.ph} placeholder="pH" onChange={handleChange} required />
          <input type="text" inputMode="decimal" name="rainfall" value={formData.rainfall} placeholder="Rainfall (mm)" onChange={handleChange} required />

          <button type="submit" className="crop-reco-btn">
            {"\uD83D\uDD0D Predict Crop"}
          </button>
        </form>

        {result && (
          <div className="crop-reco-result">
            <h3>{"\u2705 Recommended Crop"}</h3>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropRecommendation;
