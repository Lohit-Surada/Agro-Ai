// src/components/homecomponents/FeaturesSection.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/home/FeaturesSection.css";

const API_BASE = "https://agro-aip-10.onrender.com/api";

const FeaturesSection = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const role = auth?.role;

  const [cropCount,  setCropCount]  = useState(null);
  const [soilCount,  setSoilCount]  = useState(null);
  const [userCount,  setUserCount]  = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/search/crops/`)
      .then(r => setCropCount(r.data.length))
      .catch(() => setCropCount(0));

    axios.get(`${API_BASE}/search/soils/`)
      .then(r => setSoilCount(r.data.length))
      .catch(() => setSoilCount(0));

    axios.get(`${API_BASE}/auth/stats/`)
      .then(r => setUserCount(r.data.users || 0))
      .catch(() => setUserCount(0));
  }, []);

  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -7;
    const ry = ((x - cx) / cx) * 7;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
  };

  const resetTilt = (e) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <section className="features-section">
      <div className="fs-header">
        <span className="fs-eyebrow">Why AgroAI?</span>
        <h2 className="fs-title">Agriculture Powered by Intelligence</h2>
        <p className="fs-subtitle">
          Combining cutting-edge AI with agricultural science for smarter, data-driven farming decisions
        </p>
      </div>

      <div className="fs-grid">

        {/* ── CROPS CARD ── */}
        <div className="fs-card fdc fdc--crop" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
          <div className="fdc-anim-area">
            {/* CSS plant animation */}
            <div className="plant3d">
              <div className="plant3d-pot" />
              <div className="plant3d-stem" />
              <div className="plant3d-leaf plant3d-leaf--left" />
              <div className="plant3d-leaf plant3d-leaf--right" />
              <div className="plant3d-leaf plant3d-leaf--top" />
              <span className="ps ps1">✦</span>
              <span className="ps ps2">✦</span>
              <span className="ps ps3">✦</span>
            </div>
          </div>
          <div className="fdc-body">
            <div className="fdc-count-pill fdc-pill--crop">
              <span className="fdc-count-num">{cropCount === null ? "…" : cropCount}</span>
              <span className="fdc-count-lbl">Crops</span>
            </div>
            <h3 className="fdc-title">Crop Library</h3>
            <p className="fdc-desc">
              Explore the full catalogue of crops our AI supports — from cereals and pulses to fruits and cash crops.
            </p>
            <button className="fdc-view-btn fdc-btn--crop" onClick={() => navigate("/crops")}>
              View All Crops →
            </button>
          </div>
          <div className="fdc-bar fdc-bar--crop" />
        </div>

        {/* ── USERS CARD ── */}
        <div className="fs-card fdc fdc--users" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
          <div className="fdc-anim-area">
            {/* CSS people animation */}
            <div className="users-anim">
              <div className="ua-circle ua-c1" />
              <div className="ua-circle ua-c2" />
              <div className="ua-circle ua-c3" />
              <div className="ua-person ua-p1"><div className="ua-head" /><div className="ua-body" /></div>
              <div className="ua-person ua-p2"><div className="ua-head" /><div className="ua-body" /></div>
              <div className="ua-person ua-p3"><div className="ua-head" /><div className="ua-body" /></div>
              <div className="ua-rings">
                <div className="ua-ring ua-ring1" />
                <div className="ua-ring ua-ring2" />
              </div>
            </div>
          </div>
          <div className="fdc-body">
            <div className="fdc-count-pill fdc-pill--users">
              <span className="fdc-count-num">{userCount === null ? "…" : userCount.toLocaleString()}</span>
              <span className="fdc-count-lbl">Farmers</span>
            </div>
            <h3 className="fdc-title">Our Community</h3>
            <p className="fdc-desc">
              Thousands of Indian farmers trust AgroAI for real-time soil and crop intelligence — growing smarter every day.
            </p>
          </div>
          <div className="fdc-bar fdc-bar--users" />
        </div>

        {/* ── SOILS CARD ── */}
        <div className="fs-card fdc fdc--soils" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
          <div className="fdc-anim-area">
            {/* CSS soil layers animation */}
            <div className="soil-anim">
              <div className="soil-globe">
                <div className="soil-globe-sphere" />
                <div className="soil-globe-ring" />
                <span className="sgp sgp1" /><span className="sgp sgp2" /><span className="sgp sgp3" />
              </div>
            </div>
          </div>
          <div className="fdc-body">
            <div className="fdc-count-pill fdc-pill--soils">
              <span className="fdc-count-num">{soilCount === null ? "…" : soilCount}</span>
              <span className="fdc-count-lbl">Soils</span>
            </div>
            <h3 className="fdc-title">Soil Library</h3>
            <p className="fdc-desc">
              Discover all soil types our deep-learning model can detect — with pH ranges and recommended crops for each.
            </p>
            <button className="fdc-view-btn fdc-btn--soils" onClick={() => navigate("/soils")}>
              View All Soils →
            </button>
          </div>
          <div className="fdc-bar fdc-bar--soils" />
        </div>

      </div>

      {role === "admin" && (
        <div className="fs-admin-access">
          <h4 className="fsa-title">⚙️ Admin Quick Access</h4>
          <div className="fsa-grid">
            <button className="fsa-btn" onClick={() => navigate("/admin/crops")}>
              🌾 Manage Crops
            </button>
            <button className="fsa-btn" onClick={() => navigate("/admin/soils")}>
              🌍 Manage Soils
            </button>
            <button className="fsa-btn" onClick={() => navigate("/admin/users")}>
              👥 Manage Users
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturesSection;
