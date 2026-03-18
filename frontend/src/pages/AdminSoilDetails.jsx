import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminSoils.css";

const BACKEND_ORIGIN = "https://agro-aip-3.onrender.com";

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

function AdminSoilDetails() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;
  const { soilId } = useParams();
  const navigate = useNavigate();

  const [soil, setSoil] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API = useMemo(
    () =>
      axios.create({
        baseURL: `${BACKEND_ORIGIN}/api/search`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  useEffect(() => {
    const fetchSoil = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/soils/${soilId}/`);
        setSoil(res.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch soil", err);
        setError(err.response?.data?.error || "Unable to load soil details.");
      } finally {
        setLoading(false);
      }
    };

    if (token && soilId) fetchSoil();
  }, [API, soilId, token]);

  if (!token || auth?.role !== "admin") {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-soils-page">
      <div className="admin-soils-header">
        <h2>Soil Details</h2>
        <button className="primary-btn" onClick={() => navigate(`/admin/soils/${soilId}/edit`)}>
          Edit Soil
        </button>
      </div>

      {loading && <p className="admin-soils-empty">Loading details...</p>}
      {error && <p className="admin-soils-error">{error}</p>}

      {soil && !loading && !error && (
        <section className="soil-details-layout">
          <div className="soil-details-hero">
            {toImageUrl(soil.image) ? (
              <img src={toImageUrl(soil.image)} alt={soil.soil_name} className="soil-details-image" />
            ) : (
              <div className="soil-card-placeholder details-placeholder">No image</div>
            )}
            <h3>{toDisplayValue(soil.soil_name)}</h3>
          </div>

          <div className="soil-info-card">
            <h4 className="info-card-title">Agricultural Soil Information</h4>
            <div className="info-grid">
              <div className="info-row">
                <p className="info-label">Soil Name</p>
                <p className="info-value">{toDisplayValue(soil.soil_name)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Soil Type</p>
                <p className="info-value">{toDisplayValue(soil.soil_type)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">pH Level</p>
                <p className="info-value">{toDisplayValue(soil.ph_level)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Nitrogen</p>
                <p className="info-value">{toDisplayValue(soil.nutrient_content?.nitrogen)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Phosphorus</p>
                <p className="info-value">{toDisplayValue(soil.nutrient_content?.phosphorus)}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Potassium</p>
                <p className="info-value">{toDisplayValue(soil.nutrient_content?.potassium)}</p>
              </div>
              <div className="info-row info-row-full">
                <p className="info-label">Suitable Crops</p>
                <p className="info-value">{toDisplayValue(soil.suitable_crops)}</p>
              </div>
              <div className="info-row info-row-full">
                <p className="info-label">Description</p>
                <p className="info-value">{toDisplayValue(soil.description)}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminSoilDetails;
