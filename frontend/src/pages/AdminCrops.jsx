import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminCrops.css";

const BACKEND_ORIGIN = "http://localhost:8000";

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalized}`;
};

function AdminCrops() {
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

  const [crops, setCrops] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const API = useMemo(
    () =>
      axios.create({
        baseURL: "http://localhost:8000/api/search",
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const res = await API.get("/crops/");
      setCrops(res.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching crops", err);
      setError("Unable to load crops.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (event, id) => {
    event.stopPropagation();
    if (!window.confirm("Delete this crop?")) return;

    try {
      setDeletingId(id);
      await API.delete(`/admin/crops/${id}/delete/`);
      setCrops((prev) => prev.filter((crop) => crop._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data?.error || "Unable to delete crop.");
    } finally {
      setDeletingId("");
    }
  };

  if (!token || auth?.role !== "admin") {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-crops-page">
      <div className="admin-crops-header">
        <h2>Manage Crops</h2>
        <button className="primary-btn" onClick={() => navigate("/admin/crops/new")}>
          Add Crop
        </button>
      </div>

      {error && <p className="admin-crops-error">{error}</p>}
      {loading && <p className="admin-crops-empty">Loading crops...</p>}

      {!loading && crops.length === 0 && (
        <p className="admin-crops-empty">
          No crops found. Click <strong>Add Crop</strong> to create one.
        </p>
      )}

      <div className="crop-grid">
        {crops.map((crop) => (
          <article
            className="crop-card"
            key={crop._id}
            onClick={() => navigate(`/admin/crops/${crop._id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate(`/admin/crops/${crop._id}`);
            }}
          >
            <div className="crop-card-image-wrap">
              {toImageUrl(crop.image) ? (
                <img className="crop-card-image" src={toImageUrl(crop.image)} alt={crop.crop_name} />
              ) : (
                <div className="crop-card-placeholder">No image</div>
              )}
            </div>
            <h3 className="crop-card-name">{crop.crop_name || "Untitled Crop"}</h3>
            <button
              className="danger-btn crop-card-delete"
              onClick={(event) => handleDelete(event, crop._id)}
              disabled={deletingId === crop._id}
            >
              {deletingId === crop._id ? "Deleting..." : "Delete"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AdminCrops;
