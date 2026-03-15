// src/components/homecomponents/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home/Footer.css";

const LeafLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="rgba(255,255,255,0.18)"/>
    <path d="M16 26C16 26 8 20 8 13C8 9.13 11.58 6 16 6C20.42 6 24 9.13 24 13C24 20 16 26 16 26Z" fill="#c8f7d5" stroke="#fff" strokeWidth="1.2"/>
    <line x1="16" y1="26" x2="16" y2="14" stroke="#5ecb80" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="16" y1="20" x2="12" y2="16" stroke="#5ecb80" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="16" y1="18" x2="20" y2="14" stroke="#5ecb80" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const FARMER_BENEFITS = [
  {
    icon: "📈",
    stat: "30–40%",
    title: "Higher Crop Yield",
    desc: "AI-driven soil insights help farmers choose the right crop for their land, reducing mismatched planting and boosting overall harvest volume.",
    color: "green",
  },
  {
    icon: "💰",
    stat: "Save ₹8,000+",
    title: "Reduced Input Costs",
    desc: "Knowing your exact soil type means you buy only the fertilisers and amendments you actually need — no over-spending on guesswork.",
    color: "yellow",
  },
  
  {
    icon: "⏱️",
    stat: "< 5 Seconds",
    title: "Instant AI Decisions",
    desc: "No more waiting weeks for lab reports. Upload a soil photo and receive actionable results in seconds, directly on your phone.",
    color: "blue",
  },
  
];



const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">

      {/* ══ SECTION 1: Farmer Benefits ══ */}
      <section className="fb-section">
        <div className="fb-inner">
          <div className="section-header">
            <span className="sec-eyebrow">Why Farmers Love AgroAI</span>
            <h2 className="sec-title">Real Benefits for  Farmers</h2>
            <p className="sec-subtitle">
              AgroAI is built with the Indian farmer in mind — practical, fast, and proven to deliver results on the ground.
            </p>
          </div>
          <div className="fb-grid">
            {FARMER_BENEFITS.map((b) => (
              <div key={b.title} className={`fb-card fb-card--${b.color}`}>
                <div className="fb-card-top">
                  <span className="fb-icon">{b.icon}</span>
                  <span className="fb-stat">{b.stat}</span>
                </div>
                <h4 className="fb-card-title">{b.title}</h4>
                <p className="fb-card-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA Band ══ */}
      <section className="footer-highlights">
        <div className="fh-inner">
          {/* CTA band */}
          <div className="fh-cta-band">
            <div className="fh-cta-text">
              <h3>Start Optimising Your Harvest Today</h3>
              <p>Free to use. No credit card required.</p>
            </div>
            <button className="fh-cta-btn" onClick={() => navigate("/auth")}>
              Get Started — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ── Main footer ── */}
      <div className="footer-main">
        <div className="fm-inner">
          {/* Brand */}
          <div className="fm-brand">
            <span className="fm-logo">AgroAI</span>
            <p className="fm-tagline">
              Empowering Indian farmers with intelligent soil &amp; crop intelligence — from the field to the future.
            </p>
            <div className="fm-badges">
              <span className="fm-badge">AI-Driven</span>
              <span className="fm-badge">Open Science</span>
              <span className="fm-badge">Farmer First</span>
              <span className="fm-badge">Made for India 🇮🇳</span>
            </div>
          </div>

          {/* Agricultural Methods */}
          <div className="fm-col">
            <h5 className="fm-col-title">🌿 Agricultural Methods</h5>
            <ul className="fm-info-list">
              <li>🌱 Organic Farming</li>
              <li>🔄 Crop Rotation</li>
              <li>🌾 Intercropping</li>
              <li>💧 Drip Irrigation</li>
              <li>🦠 Biofertilisers</li>
              <li>🤖 Precision Farming</li>
            </ul>
          </div>

          {/* Key crops */}
          <div className="fm-col">
            <h5 className="fm-col-title">🌾 Featured Crop Groups</h5>
            <ul className="fm-info-list">
              <li>🍚 Cereals — Rice, Wheat, Maize</li>
              <li>🫘 Pulses — Lentil, Chickpea, Soybean</li>
              <li>🌻 Oilseeds — Mustard, Sunflower</li>
              <li>🍅 Vegetables — Tomato, Onion, Potato</li>
              <li>🍎 Fruits — Mango, Banana, Papaya</li>
              <li>🌿 Cash Crops — Sugarcane, Cotton</li>
            </ul>
          </div>

          {/* Did you know */}
          <div className="fm-col">
            <h5 className="fm-col-title">💡 Did You Know?</h5>
            <ul className="fm-fact-list">
              <li>"India has <strong>1.4 billion</strong> people to feed — precision farming is no longer optional."</li>
              <li>"Just <strong>1% improvement</strong> in soil health can increase crop yield by up to 10%."</li>
              <li>"Drip irrigation saves up to <strong>60% water</strong> vs. flood irrigation."</li>
              <li>"<strong>70% of India's</strong> population depends on agriculture for livelihood."</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 AgroAI. All rights reserved.</p>
          <p className="footer-bottom-right">
            Made with <span className="heart">♥</span> for farmers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
