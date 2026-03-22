import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminCrops.css";

const BACKEND_ORIGIN = "http://localhost:8000";

const createEmptyForm = () => ({
  image: null,
  crop_name: "",
  description: "",
  season: "",
  crop_duration_days: "",
  soil_type: "",
  temperature_celsius: "",
  ph_range: "",
  humidity_percent: "",
  rainfall_mm: "",
});

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalized}`;
};

function AdminCropForm() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;
  const { cropId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(cropId);

  const [form, setForm] = useState(createEmptyForm());
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const API = useMemo(
    () =>
      axios.create({
        baseURL: `http://localhost:8000/api/search`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  useEffect(() => {
    const fetchCrop = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const res = await API.get(`/crops/${cropId}/`);
        const crop = res.data || {};
        setForm({
          crop_name: crop.crop_name || "",
          description: crop.description || "",
          season: crop.season || "",
          crop_duration_days: crop.crop_duration_days != null ? String(crop.crop_duration_days) : "",
          soil_type: crop.soil_type || "",
          temperature_celsius: crop.temperature_celsius || "",
          ph_range: crop.ph_range || "",
          humidity_percent: crop.humidity_percent || "",
          rainfall_mm: crop.rainfall_mm || "",
          image: null,
        });
        setPreviewUrl(toImageUrl(crop.image));
        setError("");
      } catch (err) {
        console.error("Failed to load crop for edit", err);
        setError(err.response?.data?.error || "Unable to load crop.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCrop();
  }, [API, cropId, isEdit, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const decimalFields = new Set([
      "temperature_celsius",
      "ph_range",
      "humidity_percent",
      "rainfall_mm",
    ]);

    if (name === "crop_duration_days" && value !== "" && !/^\d+$/.test(value)) {
      return;
    }
    if (decimalFields.has(name) && value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.crop_name.trim()) {
      setError("Crop name is required.");
      return;
    }

    const payload = new FormData();
    payload.append("crop_name", form.crop_name);
    payload.append("description", form.description);
    payload.append("season", form.season);
    payload.append("crop_duration_days", String(form.crop_duration_days || 0));
    payload.append("soil_type", form.soil_type);
    payload.append("temperature_celsius", form.temperature_celsius);
    payload.append("ph_range", form.ph_range);
    payload.append("humidity_percent", form.humidity_percent);
    payload.append("rainfall_mm", form.rainfall_mm);
    if (form.image) payload.append("image", form.image);

    try {
      setSaving(true);
      if (isEdit) {
        await API.put(`/admin/crops/${cropId}/`, payload);
        navigate(`/admin/crops/${cropId}`);
        return;
      }

      const res = await API.post("/admin/crops/", payload);
      const newId = res.data?.crop_id;
      if (newId) {
        navigate(`/admin/crops/${newId}`);
      } else {
        navigate("/admin/crops");
      }
    } catch (err) {
      console.error("Save failed", err);
      setError(err.response?.data?.error || "Unable to save crop.");
    } finally {
      setSaving(false);
    }
  };

  if (!token || (auth?.role !== "admin" && auth?.role !== "superadmin")) {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-crops-page">
      <div className="admin-crops-header">
        <h2>{isEdit ? "Edit Crop" : "Add Crop"}</h2>
      </div>

      {loading && <p className="admin-crops-empty">Loading form...</p>}
      {error && <p className="admin-crops-error">{error}</p>}

      {!loading && (
        <form className="crop-form-card" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-grid">
            <label>
              Crop Name
              <input name="crop_name" value={form.crop_name} onChange={handleChange} required />
            </label>

            <label>
              Description
              <textarea name="description" rows="5" value={form.description} onChange={handleChange} />
            </label>

            <label>
              Season
              <input name="season" value={form.season} onChange={handleChange} />
            </label>

            <label>
              Crop Duration (Days)
              <input
                type="text"
                name="crop_duration_days"
                value={form.crop_duration_days}
                onChange={handleChange}
              />
            </label>

            <label>
              Soil Type
              <input name="soil_type" value={form.soil_type} onChange={handleChange} />
            </label>

            <label>
              Temperature (Celsius)
              <input
                type="text"
                name="temperature_celsius"
                value={form.temperature_celsius}
                onChange={handleChange}
              />
            </label>

            <label>
              pH Range
              <input type="text" name="ph_range" value={form.ph_range} onChange={handleChange} />
            </label>

            <label>
              Humidity Percent
              <input type="text" name="humidity_percent" value={form.humidity_percent} onChange={handleChange} />
            </label>

            <label>
              Rainfall (mm)
              <input type="text" name="rainfall_mm" value={form.rainfall_mm} onChange={handleChange} />
            </label>
          </div>

          <label className="file-field">
            Crop Image
            <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
          </label>

          {previewUrl && <img src={previewUrl} alt="preview" className="form-preview" />}

          <div className="crop-form-actions">
            <button className="primary-btn form-submit" type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Crop" : "Create Crop"}
            </button>
            <button
              type="button"
              className="danger-btn form-cancel"
              onClick={() => navigate(isEdit ? `/admin/crops/${cropId}` : "/admin/crops")}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminCropForm;
