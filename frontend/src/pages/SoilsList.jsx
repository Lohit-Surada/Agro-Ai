// src/pages/SoilsList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import "../styles/public/SoilsList.css";

const BACKEND = "https://agro-aip-10.onrender.com";

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND}/${normalized}`;
};

const SoilsList = () => {
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

  const [soils,        setSoils]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [query,        setQuery]        = useState("");

  useEffect(() => {
    axios.get(`${BACKEND}/api/search/soils/`)
      .then(r => setSoils(r.data))
      .catch(() => setSoils([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = soils.filter(s =>
    !query || (s.soil_name || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* ── HERO BANNER (full-width, outside sl-page) ── */}
      <div className="sl-hero">
        <span className="sl-hero-eyebrow">AgroAI Database</span>
        <h1 className="sl-hero-title">🌍 Soil Database</h1>
        <p className="sl-hero-sub">
          Explore all {loading ? "…" : soils.length} soil types our deep-learning model can detect — pH levels, nutrient content, and recommended crops.
        </p>
      </div>

      <div className="sl-page">
        {/* ── SEARCH ── */}
        <div className="sl-controls">
          <div className="sl-search-wrap">
            <span className="sl-search-icon">🔍</span>
            <input
              className="sl-search"
              type="text"
              placeholder="Search by soil name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button className="sl-clear" onClick={() => setQuery("")}>✕</button>}
          </div>
        </div>

        {/* ── LIST ── */}
        {loading ? (
          <div className="sl-loading">
            <div className="sl-spinner" />
            <p>Loading soils…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sl-empty">
            <span className="sl-empty-icon">🌱</span>
            <p>No soils match your search.</p>
          </div>
        ) : (
          <>
            <p className="sl-count">Showing {filtered.length} of {soils.length} soil types</p>
            <div className="sl-grid">
              {filtered.map(s => (
                <article
                  className="sl-card"
                  key={s._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/soil/${s._id}`)}
                  onKeyDown={e => {
                    if (e.key === "Enter") navigate(`/soil/${s._id}`);
                  }}
                >
                  <div className="sl-card-img-wrap">
                    {toImageUrl(s.image) ? (
                      <img
                        className="sl-card-img"
                        src={toImageUrl(s.image)}
                        alt={s.soil_name}
                        onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div className="sl-card-img-fallback" style={{ display: toImageUrl(s.image) ? "none" : "flex" }}>
                      🌍
                    </div>
                  </div>
                  <h3 className="sl-card-name">{s.soil_name}</h3>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SoilsList;
