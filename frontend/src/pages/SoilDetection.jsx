import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/soil/SoilDetection.css";
import { usePopup } from "../context/PopupContext";
import { AuthContext } from "../context/AuthContext";

function SoilDetection() {
  const { showPopup } = usePopup();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setResult(null);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      setIsPredicting(true);
      const response = await axios.post(`http://localhost:8000/api/soil/detect/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        withCredentials: true,
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.error || "Error detecting soil";
      showPopup(message, "error");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="soil-detection-page">
      <div className="soil-detection-card">

        {/* ── Hero Header ── */}
        <div className="soil-hero">
          <div className="soil-hero-badge"> AI Powered</div>
          <h1 className="soil-hero-title"> Soil   Detection</h1>
          <p className="soil-hero-sub">
            Upload or capture a soil image — our AI identifies the type and recommends suitable crops instantly.
          </p>
        </div>

        {/* ── Card Body ── */}
        <div className="soil-card-body">

          <form className="soil-detection-form" onSubmit={handleUpload}>

            {/* Single input — browser natively shows camera+gallery on mobile, file picker on desktop */}
            <label htmlFor="soil-image-input" className="file-upload-label">
              <div className="upload-icon-wrap">📷</div>
              <span className="upload-main-text">Click to choose a soil image</span>
              <span className="upload-sub-text">JPG, PNG, WEBP supported</span>
            </label>
            <input
              id="soil-image-input"
              className="file-input-hidden"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Selected file indicator */}
            {image && (
              <p className="selected-file">✅ {image.name}</p>
            )}

            {/* Preview */}
            {preview && (
              <div className="preview-wrap">
                <img src={preview} alt="Uploaded Soil" className="preview-image" />
              </div>
            )}

            <button type="submit" className="predict-btn" disabled={!image || isPredicting}>
              {isPredicting ? "🔄 Analysing Soil…" : " Detect Soil Type"}
            </button>
          </form>

          {/* ── Results ── */}
          {result && (
            <div className="soil-result-card">
              <div className="soil-result-header">
                <div className="result-success-icon">✅</div>
                <h3 style={{ color: "#32CD32" }}>Prediction Result</h3>
              </div>

              <div className="soil-result-body">
                {/* 1. Detected type pill */}
                <div className="soil-detected-pill">
                  <div>
                    <div className="soil-detected-label">Detected Soil Type</div>
                    <div className="soil-detected-type">{result.soil_type}</div>
                  </div>
                </div>

                {/* 2. Recommended crops */}
                {result.recommended_crops && result.recommended_crops.length > 0 && (
                  <div className="soil-crops-section">
                    <p className="soil-crops-title">🌾 Recommended Crops</p>
                    <div className="soil-crops-grid">
                      {result.recommended_crops.map((crop, idx) => (
                        <span key={idx} className="soil-crop-chip">{crop}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Advanced Crop Recommendation button */}
                <button
                  type="button"
                  className="soil-adv-btn"
                  onClick={() => navigate("/crop-recommendation")}
                >
                  🌿 Advanced Crop Recommendation
                </button>

                {/* 4. Confidence table */}
                {result.top3 && (
                  <div className="soil-top3">
                    <p className="soil-top3-title">📊 Prediction Confidence</p>
                    <table className="soil-confidence-table">
                      <thead>
                        <tr>
                          <th className="soil-conf-th">Soil Type</th>
                          <th className="soil-conf-th soil-conf-th--right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.top3.map((item, idx) => (
                          <tr key={idx} className={"soil-conf-row" + (idx === 0 ? " soil-conf-row--best" : "")}>
                            <td className="soil-conf-td">
                              <span className="soil-bar-rank">{idx + 1}</span>
                              {item.soil_type}
                            </td>
                            <td className="soil-conf-td soil-conf-td--right">{item.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default SoilDetection;
