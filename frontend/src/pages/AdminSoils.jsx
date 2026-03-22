import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminSoils.css";

const BACKEND_ORIGIN = "https://agro-aip-10.onrender.com";

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalized}`;
};

function AdminSoils() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;
  const navigate = useNavigate();
  const location = useLocation();
  const navType = useNavigationType();

  // Disable the browser forward button: when we land here via Back (POP),
  // replace this history entry so there is no forward entry to go to.
  useEffect(() => {
    if (navType === "POP") {
      navigate(location.pathname + location.search, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [soils, setSoils] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const API = useMemo(
    () =>
      axios.create({
        baseURL: `${BACKEND_ORIGIN}/api/search`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  const fetchSoils = async () => {
    try {
      setLoading(true);
      const res = await API.get("/soils/");
      setSoils(res.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching soils", err);
      setError("Unable to load soils.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSoils();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (event, soilId) => {
    event.stopPropagation();
    if (!window.confirm("Delete this soil record?")) return;

    try {
      setDeletingId(soilId);
      await API.delete(`/admin/soils/${soilId}/delete/`);
      setSoils((prev) => prev.filter((soil) => soil._id !== soilId));
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data?.error || "Unable to delete soil.");
    } finally {
      setDeletingId("");
    }
  };

  if (!token || (auth?.role !== "admin" && auth?.role !== "superadmin")) {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-soils-page">
      <div className="admin-soils-header">
        <h2>Manage Soils</h2>
        <button className="primary-btn admin-soils-add-btn" onClick={() => navigate("/admin/soils/new")}>
          Add Soil
        </button>
      </div>

      {error && <p className="admin-soils-error">{error}</p>}
      {loading && <p className="admin-soils-empty">Loading soils...</p>}

      {!loading && soils.length === 0 && (
        <p className="admin-soils-empty">
          No soils available. Click <strong>Add Soil</strong> to create one.
        </p>
      )}

      <div className="soil-grid">
        {soils.map((soil) => (
          <article
            className="soil-card"
            key={soil._id}
            onClick={() => navigate(`/admin/soils/${soil._id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate(`/admin/soils/${soil._id}`);
            }}
          >
            <div className="soil-card-image-wrap">
              {toImageUrl(soil.image) ? (
                <img className="soil-card-image" src={toImageUrl(soil.image)} alt={soil.soil_name} />
              ) : (
                <div className="soil-card-placeholder">No image</div>
              )}
            </div>
            <h3 className="soil-card-name">{soil.soil_name || "Unnamed Soil"}</h3>
            <button
              className="danger-btn soil-card-delete"
              onClick={(event) => handleDelete(event, soil._id)}
              disabled={deletingId === soil._id}
            >
              {deletingId === soil._id ? "Deleting..." : "Delete"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AdminSoils;
