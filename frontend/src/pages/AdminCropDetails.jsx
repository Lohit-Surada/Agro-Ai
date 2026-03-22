import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminCrops.css";

const BACKEND_ORIGIN = "https://agro-aip-10.onrender.com";

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalized}`;
};

const toDisplayValue = (value) => {
  if (value === null || value === undefined) return "-----";
  const text = String(value).trim();
  return text ? text : "-----";
};

function AdminCropDetails() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;
  const { cropId } = useParams();
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API = useMemo(
    () =>
      axios.create({
        baseURL: `https://agro-aip-10.onrender.com/api/search`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/crops/${cropId}/`);
        setCrop(res.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch crop", err);
        setError(err.response?.data?.error || "Unable to load crop details.");
      } finally {
        setLoading(false);
      }
    };

    if (token && cropId) fetchCrop();
  }, [API, cropId, token]);

  if (!token || auth?.role !== "admin") {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-crops-page">
      <div className="admin-crops-header">
        <h2>Crop Details</h2>
        <button className="primary-btn" onClick={() => navigate(`/admin/crops/${cropId}/edit`)}>
          Edit Crop
        </button>
      </div>

      {loading && <p className="admin-crops-empty">Loading details...</p>}
      {error && <p className="admin-crops-error">{error}</p>}

      {crop && !loading && !error && (
        <section className="crop-details-layout">
          <div className="crop-details-hero">
            {toImageUrl(crop.image) ? (
              <img src={toImageUrl(crop.image)} alt={crop.crop_name} className="crop-details-image" />
            ) : (
              <div className="crop-card-placeholder details-placeholder">No image</div>
            )}
            <h3>{toDisplayValue(crop.crop_name)}</h3>
          </div>

          <div className="crop-info-card">
            <div className="info-grid">
              <div className="info-row">
                <p className="info-label">Crop Name</p>
                <p className="info-value">{toDisplayValue(crop.crop_name)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Season</p>
                <p className="info-value">{toDisplayValue(crop.season)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Soil Type</p>
                <p className="info-value">{toDisplayValue(crop.soil_type)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Temperature (Celsius)</p>
                <p className="info-value">{toDisplayValue(crop.temperature_celsius)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">pH Range</p>
                <p className="info-value">{toDisplayValue(crop.ph_range)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Humidity (%)</p>
                <p className="info-value">{toDisplayValue(crop.humidity_percent)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Rainfall (mm)</p>
                <p className="info-value">{toDisplayValue(crop.rainfall_mm)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Crop Duration (Days)</p>
                <p className="info-value">{toDisplayValue(crop.crop_duration_days)}</p>
              </div>
              <div className="info-row info-row-full">
                <p className="info-label">Description</p>
                <p className="info-value">{toDisplayValue(crop.description)}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminCropDetails;
