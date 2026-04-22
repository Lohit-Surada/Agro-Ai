// src/components/homecomponents/Hero.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { usePopup } from "../../context/PopupContext";
import SpinnerWheel from "./SpinnerWheel";
import "../../styles/home/Hero.css";

const Hero = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { showPopup } = usePopup();
  const animatedWords = ["Agro-Ai", "AI Insights", "Smart Farming"];
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = animatedWords[wordIndex];
    const speed = isDeleting ? 85 : 145;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const nextText = currentWord.slice(0, typedText.length + 1);
        setTypedText(nextText);

        if (nextText === currentWord) {
          setTimeout(() => setIsDeleting(true), 1300);
        }
      } else {
        const nextText = currentWord.slice(0, typedText.length - 1);
        setTypedText(nextText);

        if (nextText.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % animatedWords.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, wordIndex]);

  const requireLoginOrNavigate = (path) => {
    if (!auth?.token) {
      showPopup("Login required", "alert");
      return;
    }
    navigate(path);
  };

  const handleCardTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -8;
    const ry = ((x - cx) / cx) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
  };

  const resetCardTilt = (e) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <>
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-top-content">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                AI-Powered Agriculture Platform
              </div>
              <h1 className="hero-heading">
                <span className="hero-heading-line">Grow Smarter with</span>
                <span
                  className="hero-highlight hero-typed-word hero-heading-line hero-heading-accent"
                  aria-label={animatedWords[wordIndex]}
                >
                  {typedText || "Agro-Ai"}
                  <span className="hero-cursor" aria-hidden="true">|</span>
                </span>
              </h1>
            </div>
            <div className="hero-bottom-content">
              <p className="hero-subtitle">
                Intelligent soil analysis and personalized crop recommendations,
                powered by advanced machine learning
              </p>
              <div className="hero-stats-row">
                <div className="hero-stat-item">
                  <span className="hero-stat-num">95%+</span>
                  <span className="hero-stat-lbl">Accuracy</span>
                </div>
                <div className="hero-stat-sep" />
                <div className="hero-stat-item">
                  <span className="hero-stat-num">20+</span>
                  <span className="hero-stat-lbl">Crop Varieties</span>
                </div>
                <div className="hero-stat-sep" />
                <div className="hero-stat-item">
                  <span className="hero-stat-num">Instant</span>
                  <span className="hero-stat-lbl">AI Results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-action-section">
        <div className="hac-grid">
          {/* Soil Detection Card */}
          <div
            className="hac-card hac-soil"
            onClick={() => requireLoginOrNavigate("/soil-detection")}
            onMouseMove={handleCardTilt}
            onMouseLeave={resetCardTilt}
          >
            <div className="hac-card-glow" />
            <div className="hac-icon-wrap">
              <div className="soil-mini-globe">
                <div className="smg-sphere" />
                <div className="smg-ring" />
              </div>
            </div>
            <div className="hac-text">
              <h3 className="hac-title">Soil Detection</h3>
              <p className="hac-desc">
                AI analysis of soil composition, health, and type from a simple image upload
              </p>
              <span className="hac-cta">
                Analyze Now <span className="hac-arrow">→</span>
              </span>
            </div>
          </div>

          {/* Crop Recommendation Card */}
          <div
            className="hac-card hac-crop"
            onClick={() => requireLoginOrNavigate("/crop-recommendation")}
            onMouseMove={handleCardTilt}
            onMouseLeave={resetCardTilt}
          >
            <div className="hac-card-glow" />
            <div className="hac-icon-wrap">
              <div className="crop-mini-plant">
                <div className="cmp-pot" />
                <div className="cmp-stem" />
                <div className="cmp-leaf cmp-leaf-l" />
                <div className="cmp-leaf cmp-leaf-r" />
                <div className="cmp-leaf cmp-leaf-t" />
              </div>
            </div>
            <div className="hac-text">
              <h3 className="hac-title">Crop Recommendation</h3>
              <p className="hac-desc">
                Get optimized crop suggestions based on your soil data and regional climate
              </p>
              <span className="hac-cta">
                Get Suggestions <span className="hac-arrow">→</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <SpinnerWheel />
    </>
  );
};

export default Hero;

