import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/home/AdminSoils.css";

const BACKEND = "http://localhost:8000";

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND}/${normalized}`;
};

const asDisplay = (value) => {
  if (value === null || value === undefined) return "-----";
  const text = String(value).trim();
  return text || "-----";
};

const SoilDetails = () => {
  const { soilId } = useParams();
  const [soil, setSoil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSoil = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND}/api/search/soils/${soilId}/`);
        setSoil(response.data || null);
        setError("");
      } catch (_error) {
        setError("Unable to load soil details.");
      } finally {
        setLoading(false);
      }
    };

    if (soilId) {
      fetchSoil();
    }
  }, [soilId]);

  return (
    <div className="admin-soils-page">
      <div className="admin-soils-header">
        <h2>Soil Details</h2>
      </div>

      {loading && <p className="admin-soils-empty">Loading soil details...</p>}
      {error && <p className="admin-soils-error">{error}</p>}

      {soil && !loading && !error && (
        <section className="soil-details-layout">
          <div className="soil-details-hero">
            {toImageUrl(soil.image) ? (
              <img src={toImageUrl(soil.image)} alt={soil.soil_name} className="soil-details-image" />
            ) : (
              <div className="soil-card-placeholder details-placeholder">No image</div>
            )}
            <h3>{asDisplay(soil.soil_name)}</h3>
          </div>

          <div className="soil-info-card">
            <div className="info-grid">
              <div className="info-row"><p className="info-label">Soil Name</p><p className="info-value">{asDisplay(soil.soil_name)}</p></div>
              <div className="info-row"><p className="info-label">Texture</p><p className="info-value">{asDisplay(soil.texture)}</p></div>
              <div className="info-row"><p className="info-label">pH Level (0-14)</p><p className="info-value">{asDisplay(soil.ph_level)}</p></div>
              <div className="info-row"><p className="info-label">Nitrogen (kg/hectare)</p><p className="info-value">{asDisplay(soil.nutrient_content?.nitrogen)}</p></div>
              <div className="info-row"><p className="info-label">Phosphorus (kg/hectare)</p><p className="info-value">{asDisplay(soil.nutrient_content?.phosphorus)}</p></div>
              <div className="info-row"><p className="info-label">Potassium (kg/hectare)</p><p className="info-value">{asDisplay(soil.nutrient_content?.potassium)}</p></div>
              <div className="info-row"><p className="info-label">Water Holding Capacity</p><p className="info-value">{asDisplay(soil.water_holding_capacity)}</p></div>
              <div className="info-row"><p className="info-label">Drainage</p><p className="info-value">{asDisplay(soil.drainage)}</p></div>
              <div className="info-row"><p className="info-label">Rainfall (in mm)</p><p className="info-value">{asDisplay(soil.rainfall)}</p></div>
              <div className="info-row info-row-full"><p className="info-label">Suitable Crops</p><p className="info-value">{asDisplay(soil.suitable_crops)}</p></div>
              <div className="info-row"><p className="info-label">Region</p><p className="info-value">{asDisplay(soil.region)}</p></div>
              <div className="info-row info-row-full"><p className="info-label">Description</p><p className="info-value">{asDisplay(soil.description)}</p></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SoilDetails;
