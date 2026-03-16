import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/home/AdminCrops.css";

const BACKEND = import.meta.env.VITE_API_BASE_URL;

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND}/${normalized}`;
};

const asDisplay = (v) => {
  if (Array.isArray(v)) return v.join(", ");
  const t = String(v ?? "").trim();
  return t && t !== "0" ? t : "-----";
};

const CropDetails = () => {
  const { cropId } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND}/api/search/crops/${cropId}/`);
        setCrop(response.data || null);
        setError("");
      } catch (_error) {
        setError("Unable to load crop details.");
      } finally {
        setLoading(false);
      }
    };

    if (cropId) {
      fetchCrop();
    }
  }, [cropId]);

  return (
    <div className="admin-crops-page">
      <div className="admin-crops-header">
        <h2>Crop Details</h2>
      </div>

      {loading && <p className="admin-crops-empty">Loading crop details...</p>}
      {error && <p className="admin-crops-error">{error}</p>}

      {crop && !loading && !error && (
        <section className="crop-details-layout">
          <div className="crop-details-hero">
            {toImageUrl(crop.image) ? (
              <img src={toImageUrl(crop.image)} alt={crop.crop_name} className="crop-details-image" />
            ) : (
              <div className="crop-card-placeholder details-placeholder">No image</div>
            )}
            <h3>{asDisplay(crop.crop_name)}</h3>
          </div>

          <div className="crop-info-card">
            <h4 className="info-card-title">Agricultural Crop Information</h4>
            <div className="info-grid">
              <div className="info-row"><p className="info-label">Crop Name</p><p className="info-value">{asDisplay(crop.crop_name)}</p></div>
              <div className="info-row"><p className="info-label">Season</p><p className="info-value">{asDisplay(crop.season)}</p></div>
              <div className="info-row"><p className="info-label">Soil Type</p><p className="info-value">{asDisplay(crop.soil_type)}</p></div>
              <div className="info-row"><p className="info-label">Temperature (Celsius)</p><p className="info-value">{asDisplay(crop.temperature_celsius)}</p></div>
              <div className="info-row"><p className="info-label">pH Range</p><p className="info-value">{asDisplay(crop.ph_range)}</p></div>
              <div className="info-row"><p className="info-label">Humidity (%)</p><p className="info-value">{asDisplay(crop.humidity_percent)}</p></div>
              <div className="info-row"><p className="info-label">Rainfall (mm)</p><p className="info-value">{asDisplay(crop.rainfall_mm)}</p></div>
              <div className="info-row"><p className="info-label">Duration (Days)</p><p className="info-value">{asDisplay(crop.crop_duration_days)}</p></div>
              <div className="info-row info-row-full"><p className="info-label">Description</p><p className="info-value">{asDisplay(crop.description)}</p></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CropDetails;
