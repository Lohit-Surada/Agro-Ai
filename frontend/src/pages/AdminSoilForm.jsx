import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useId } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminSoils.css";

const BACKEND_ORIGIN = "https://agro-aip-10.onrender.com";

const createEmptyForm = () => ({
  image: null,
  soil_name: "",
  description: "",
  soil_type: "",
  texture: "",
  region: "",
  ph_level: "",
  text_ph: "",
  water_holding_capacity: "",
  rainfall: "",
  drainage: "",
  nutrient_content: {
    nitrogen: "",
    phosphorus: "",
    potassium: "",
  },
  suitable_crops: "",
});

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalized}`;
};

function AdminSoilForm() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;
  const { soilId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(soilId);
  const soilImageInputId = useId();

  const [form, setForm] = useState(createEmptyForm());
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

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
      if (!isEdit) return;

      try {
        setLoading(true);
        const res = await API.get(`/soils/${soilId}/`);
        const soil = res.data || {};
        setForm({
          image: null,
          soil_name: soil.soil_name || "",
          description: soil.description || "",
          soil_type: soil.soil_type || "",
          texture: soil.texture || "",
          region: soil.region || "",
          ph_level: soil.ph_level || "",
          text_ph: soil.ph_level || "",
          water_holding_capacity: soil.water_holding_capacity || "",
          rainfall: soil.rainfall || "",
          drainage: soil.drainage || "",
          nutrient_content: {
            nitrogen: soil.nutrient_content?.nitrogen || "",
            phosphorus: soil.nutrient_content?.phosphorus || "",
            potassium: soil.nutrient_content?.potassium || "",
          },
          suitable_crops: soil.suitable_crops || "",
        });
        setPreviewUrl(toImageUrl(soil.image));
        setError("");
      } catch (err) {
        console.error("Failed to load soil", err);
        setError(err.response?.data?.error || "Unable to load soil.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSoil();
  }, [API, isEdit, soilId, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNutrientChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      nutrient_content: {
        ...prev.nutrient_content,
        [name]: value,
      },
    }));
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

    if (!form.soil_name.trim()) {
      setError("Soil name is required.");
      return;
    }

    const payload = new FormData();
    payload.append("soil_name", form.soil_name);
    payload.append("description", form.description);
    payload.append("soil_type", form.soil_type);
    payload.append("texture", form.texture);
    payload.append("region", form.region);
    payload.append("ph_level", form.text_ph);
    payload.append("water_holding_capacity", form.water_holding_capacity);
    payload.append("rainfall", form.rainfall);
    payload.append("drainage", form.drainage);
    payload.append("nutrient_content", JSON.stringify(form.nutrient_content));
    payload.append("suitable_crops", form.suitable_crops);
    if (form.image) payload.append("image", form.image);

    try {
      setSaving(true);
      if (isEdit) {
        await API.put(`/admin/soils/${soilId}/`, payload);
        navigate(`/admin/soils/${soilId}`);
        return;
      }

      const res = await API.post("/admin/soils/", payload);
      const newId = res.data?.soil_id;
      if (newId) {
        navigate(`/admin/soils/${newId}`);
      } else {
        navigate("/admin/soils");
      }
    } catch (err) {
      console.error("Failed to save soil", err);
      setError(err.response?.data?.error || "Unable to save soil.");
    } finally {
      setSaving(false);
    }
  };

  if (!token || (auth?.role !== "admin" && auth?.role !== "superadmin")) {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-soils-page">
      <div className="admin-soils-header">
        <h2>{isEdit ? "Edit Soil" : "Add Soil"}</h2>
      </div>

      {loading && <p className="admin-soils-empty">Loading form...</p>}
      {error && <p className="admin-soils-error">{error}</p>}

      {!loading && (
        <form className="soil-form-card" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-grid">
            <label>
              Soil Name
              <input name="soil_name" value={form.soil_name} onChange={handleChange} required />
            </label>

            <label>
              Texture
              <select name="texture" value={form.texture} onChange={handleChange}>
                <option value="">Select texture</option>
                <option value="Sandy">Sandy</option>
                <option value="Loamy">Loamy</option>
                <option value="Clayey">Clayey</option>
                <option value="Silty">Silty</option>
              </select>
            </label>

            

            

             <label htmlFor="">
              pH_level(0-14)
              <input name="text_ph" value={form.text_ph} onChange={handleChange} />
             </label>

            <label>
              Nitrogen (kg/hectare)
              <input
                name="nitrogen"
                value={form.nutrient_content.nitrogen}
                onChange={handleNutrientChange}
              />
            </label>

            <label>
              Phosphorus (kg/hectare)
              <input
                name="phosphorus"
                value={form.nutrient_content.phosphorus}
                onChange={handleNutrientChange}
              />
            </label>

            <label>
              Potassium (kg/hectare)
              <input
                name="potassium"
                value={form.nutrient_content.potassium}
                onChange={handleNutrientChange}
              />
            </label>

            <label>
              Water Holding Capacity
              <select name="water_holding_capacity" value={form.water_holding_capacity} onChange={handleChange}>
                <option value="">Select water holding capacity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label>
              Drainage
              <select name="drainage" value={form.drainage} onChange={handleChange}>
                <option value="">Select drainage</option>
                <option value="Poor">Poor</option>
                <option value="Moderate">Moderate</option>
                <option value="Good">Good</option>
              </select>
            </label>

            <label>
              Rainfall (in mm)
              <input name="rainfall" value={form.rainfall} onChange={handleChange} />
            </label>

            <label>
              Suitable Crops
              <input name="suitable_crops" value={form.suitable_crops} onChange={handleChange} />
            </label>

            <label>
              Region
              <input name="region" value={form.region} onChange={handleChange} />
            </label>

            <label>
              Description
              <textarea name="description" rows="5" value={form.description} onChange={handleChange} />
            </label>
          </div>

          <div className="soil-image-upload">
            <input
              id={soilImageInputId}
              className="soil-image-input"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label htmlFor={soilImageInputId} className="soil-image-trigger">
              {previewUrl ? "Change Soil Image" : "Upload Soil Image"}
            </label>
            {previewUrl && (
              <div className="soil-image-preview-card">
                <img src={previewUrl} alt="Selected soil" className="form-preview" />
              </div>
            )}
          </div>

          <div className="soil-form-actions">
            <button className="primary-btn form-submit" type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Soil" : "Create Soil"}
            </button>
            <button
              type="button"
              className="danger-btn form-cancel"
              onClick={() => navigate(isEdit ? `/admin/soils/${soilId}` : "/admin/soils")}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminSoilForm;
