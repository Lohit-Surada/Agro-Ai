// src/pages/CropsList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import "../styles/public/CropsList.css";

const BACKEND = "https://agro-aip-10.onrender.com";

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND}/${normalized}`;
};

const CropsList = () => {
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

  const [crops,        setCrops]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [query,        setQuery]        = useState("");
  const [filter,       setFilter]       = useState("all"); // all | season | soil

  useEffect(() => {
    axios.get(`${BACKEND}/api/search/crops/`)
      .then(r => setCrops(r.data))
      .catch(() => setCrops([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = crops.filter(c => {
    const q = query.toLowerCase();
    if (!q) return true;
    if (filter === "season") return (c.season || "").toLowerCase().includes(q);
    if (filter === "soil")   return (c.soil_type || "").toLowerCase().includes(q);
    return (c.crop_name || "").toLowerCase().includes(q);
  });

  const seasons = [...new Set(crops.map(c => c.season).filter(Boolean))];

  return (
    <>
      {/* ── HERO BANNER (full-width, outside cl-page) ── */}
      <div className="cl-hero">
        <span className="cl-hero-eyebrow">AgroAI Database</span>
        <h1 className="cl-hero-title">🌾 Crop Library</h1>
        <p className="cl-hero-sub">
          Browse all {loading ? "…" : crops.length} crops our AI supports — seasons, soil requirements, growth duration, and more.
        </p>
      </div>
      <div className="cl-page">
        {/* ── SEARCH + FILTER ── */}
        <div className="cl-controls">
          <div className="cl-search-wrap">
            <span className="cl-search-icon">🔍</span>
            <input
              className="cl-search"
              type="text"
              placeholder={`Search by ${filter === "season" ? "season" : filter === "soil" ? "soil type" : "crop name"}…`}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button className="cl-clear" onClick={() => setQuery("")}>✕</button>}
          </div>
          <div className="cl-filter-tabs">
            {[["all","Name"],["season","Season"],["soil","Soil Type"]].map(([k,label]) => (
              <button
                key={k}
                className={`cl-tab${filter === k ? " cl-tab--active" : ""}`}
                onClick={() => { setFilter(k); setQuery(""); }}
              >{label}</button>
            ))}
          </div>
        </div>

        {seasons.length > 0 && filter === "season" && (
          <div className="cl-season-chips">
            {seasons.map(s => (
              <button
                key={s}
                className={`cl-chip${query === s.toLowerCase() ? " cl-chip--active" : ""}`}
                onClick={() => setQuery(query === s.toLowerCase() ? "" : s.toLowerCase())}
              >{s}</button>
            ))}
          </div>
        )}

        {/* ── LIST ── */}
        {loading ? (
          <div className="cl-loading">
            <div className="cl-spinner" />
            <p>Loading crops…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cl-empty">
            <span className="cl-empty-icon">🌱</span>
            <p>No crops match your search.</p>
          </div>
        ) : (
          <>
            <p className="cl-count">Showing {filtered.length} of {crops.length} crops</p>
            <div className="cl-grid">
              {filtered.map(c => (
                <article
                  className="cl-card"
                  key={c._id}
                  onClick={() => navigate(`/crop/${c._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") navigate(`/crop/${c._id}`);
                  }}
                >
                  <div className="cl-card-img-wrap">
                    {toImageUrl(c.image) ? (
                      <img
                        className="cl-card-img"
                        src={toImageUrl(c.image)}
                        alt={c.crop_name}
                        onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div className="cl-card-img-fallback" style={{ display: toImageUrl(c.image) ? "none" : "flex" }}>
                      🌾
                    </div>
                  </div>
                  <h3 className="cl-card-name">{c.crop_name}</h3>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CropsList;
