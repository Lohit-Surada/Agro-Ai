import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/home/SpinnerWheel.css";
import geminiImg        from "../../assets/Gemini_Generated_Image_5dfnce5dfnce5dfn.png";
import imgSoil         from "../../assets/Spinner/Preparation of Soil.webp";
import imgSowing       from "../../assets/Spinner/Sowing.jpg";
import imgManure       from "../../assets/Spinner/Manure and Fertilizer.webp";
import imgIrrigation   from "../../assets/Spinner/irrigation.jpg";
import imgWeeding      from "../../assets/Spinner/weeding.jpg";
import imgHarvesting   from "../../assets/Spinner/Harvesting.jpg";
import imgThreshing    from "../../assets/Spinner/Threshing.jpg";
import imgStorage      from "../../assets/Spinner/Storage-of-crops.png";

const WHEEL_ITEMS = [
  {
    id: "soil-prep",  number: "1.", label: "Preparation of Soil",    color: "#8b5a2b", colorName: "Brown",
    image: imgSoil,
    desc: "Tilling and conditioning the land to create an ideal seedbed, improving aeration, drainage, and nutrient availability for robust crop growth.",
  },
  {
    id: "sowing",     number: "2.", label: "Sowing",                  color: "#1a6b1a", colorName: "Dark Green",
    image: imgSowing,
    desc: "Placing seeds at optimal depth and spacing in prepared soil to ensure uniform germination and healthy plant establishment across the field.",
  },
  {
    id: "manuring",   number: "3.", label: "Manuring & Fertilizing",  color: "#d4a000", colorName: "Yellow",
    image: imgManure,
    desc: "Enriching the soil with organic manure and fertilizers to replenish essential nutrients and significantly boost crop yield and quality.",
  },
  {
    id: "irrigation", number: "4.", label: "Irrigation",              color: "#3f8efc", colorName: "Blue",
    image: imgIrrigation,
    desc: "Supplying controlled amounts of water to crops at critical growth stages to sustain plant health and maximize field productivity.",
  },
  {
    id: "weeding",    number: "5.", label: "Weeding",                  color: "#7ed957", colorName: "Light Green",
    image: imgWeeding,
    desc: "Removing unwanted plants that compete with crops for water, nutrients, and sunlight, safeguarding the crop's yield potential.",
  },
  {
    id: "harvesting", number: "6.", label: "Harvesting",               color: "#f07fd9", colorName: "Pink",
    image: imgHarvesting,
    desc: "Collecting mature crops at peak ripeness to secure maximum nutritional value, quality, and readiness for market or storage.",
  },
  {
    id: "threshing",  number: "7.", label: "Threshing",                color: "#e63535", colorName: "Red",
    image: imgThreshing,
    desc: "Separating harvested grain from stalks and husks through mechanical or manual methods, preparing it for storage or sale.",
  },
  {
    id: "storage",    number: "8.", label: "Storage",                  color: "#f28c28", colorName: "Orange",
    image: imgStorage,
    desc: "Preserving harvested produce under controlled conditions to prevent spoilage, pest damage, and minimise post-harvest losses.",
  },
];

const BASE_SPIN_DURATION_MS = 4200;
const LABEL_OFFSET_DEG = 270;

const SpinnerWheel = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [spinDurationMs, setSpinDurationMs] = useState(BASE_SPIN_DURATION_MS);
  const timeoutRef = useRef(null);

  const sliceAngle = useMemo(() => 360 / WHEEL_ITEMS.length, []);
  const wheelBackground = useMemo(() => {
    const stops = WHEEL_ITEMS.map((item, index) => {
      const start = index * sliceAngle;
      const end = (index + 1) * sliceAngle;
      return `${item.color} ${start}deg ${end}deg`;
    }).join(", ");

    return `conic-gradient(from -90deg, ${stops})`;
  }, [sliceAngle]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const spinWheel = () => {
    if (isSpinning) {
      return;
    }

    const randomTurns = Math.floor(Math.random() * 4) + 6;
    const randomOffset = Math.random() * 360;
    const nextDuration = Math.floor(Math.random() * 1200) + 3600;
    const nextRotation = rotation + randomTurns * 360 + randomOffset;

    setIsSpinning(true);
    setSelectedItem(null);
    setSpinDurationMs(nextDuration);
    setRotation(nextRotation);

    timeoutRef.current = setTimeout(() => {
      const normalizedRotation = ((nextRotation % 360) + 360) % 360;
      // relativeAngle is the absolute wheel angle (0 = 12 o'clock) now under the top
      const relativeAngle = (360 - normalizedRotation) % 360;
      // Pointer is at right (3 o'clock = 90° clockwise from top), shift accordingly
      const pointerAngle = (relativeAngle + 90) % 360;
      // The conic-gradient starts at 'from -90deg' = 270° (12 o'clock).
      const gradientStartDeg = 270;
      const adjustedAngle = (pointerAngle - gradientStartDeg + 360) % 360;
      const resultIndex = Math.floor(adjustedAngle / sliceAngle) % WHEEL_ITEMS.length;

      setSelectedItem(WHEEL_ITEMS[resultIndex]);
      setIsSpinning(false);
    }, nextDuration);
  };

  const IDLE_WORDS = "Spin the wheel to know the phases in agriculture".split(" ");

  return (
    <section className="spinner-section" aria-label="Smart farming spinner wheel">
      <div className="spinner-layout">

        {/* ── Left info frame ── */}
        <div className="spinner-info-frame">
          {!isSpinning && !selectedItem && (
            <div className="info-idle">
              <img
                src={geminiImg}
                alt="Smart farming illustration"
                className="idle-gemini-img"
              />
              <div className="idle-img-caption">
                <span className="idle-caption-icon" aria-hidden="true">🌾</span>
                <p className="idle-caption-text">Spin the wheel to explore agriculture phases</p>
              </div>
            </div>
          )}

          {isSpinning && (
            <div className="info-spinning">
              <div className="spin-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
              <p className="info-spin-text">Spinning…</p>
            </div>
          )}

          {!isSpinning && selectedItem && (
            <div className="info-result">
              {/* Phase number badge — top-left corner */}
              <div
                className="result-phase-badge"
                style={{ background: selectedItem.color }}
                aria-label={`Phase ${selectedItem.number}`}
              >
                <span className="result-phase-label">Phase</span>
                <span className="result-phase-num">{selectedItem.number}</span>
              </div>

              {/* Full-bleed item image */}
              <img
                src={selectedItem.image}
                alt={selectedItem.label}
                className="result-item-img"
              />

              {/* Bottom info bar */}
              <div className="result-info-bar" style={{ borderTop: `3px solid ${selectedItem.color}` }}>
                <p className="result-item-name">{selectedItem.label}</p>
                <p className="result-item-desc">{selectedItem.desc}</p>
                <span className="result-spin-again">🔄 Spin again to explore more</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: wheel ── */}
        <div className="wheel-wrap">
          <h2 className="wheel-section-title">Smart Farming Wheel</h2>
          <div className="wheel-area">
            <div
              className="spin-wheel"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: `${spinDurationMs}ms`,
                background: wheelBackground,
                "--winner-color": selectedItem?.color ?? "transparent",
              }}
              role="img"
              aria-label="Spinner wheel with eight agriculture stages"
            >
              {WHEEL_ITEMS.map((item, index) => {
                const angle = index * sliceAngle + sliceAngle / 2 + LABEL_OFFSET_DEG;
                const labelRotation = angle > 90 && angle < 270 ? 180 : 0;

                return (
                  <div
                    key={item.id}
                    className="wheel-label-holder"
                    style={{
                      "--segment-angle": `${angle}deg`,
                      "--label-rotation": `${labelRotation}deg`,
                      "--segment-color": item.color,
                    }}
                  >
                    <div className="wheel-label">
                      <span className="wheel-number">{item.number}</span>
                      <span className="wheel-text">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>



            {/* Centre dot */}
            <div className="wheel-center-dot" aria-hidden="true" />
            {/* Right-side pointer pin */}
            <div className="wheel-pointer-right" aria-hidden="true" />
          </div>

          <button
            type="button"
            className="wheel-spin-btn wheel-spin-btn-hover wheel-spin-btn-action"
            onClick={spinWheel}
            disabled={isSpinning}
          >
            {isSpinning ? "Spinning…" : "Spin Wheel"}
          </button>
        </div>

      </div>
    </section>
  );
};

export default SpinnerWheel;
