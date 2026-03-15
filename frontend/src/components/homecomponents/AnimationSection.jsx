// src/components/homecomponents/AnimationSection.jsx
import React from "react";
import "../../styles/home/AnimationSection.css";

const sliderModules = import.meta.glob("../../assets/slider/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
});

const sliderImages = Object.entries(sliderModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, module]) => module.default)
  .filter(Boolean);

const AnimationSection = () => {
  const loopImages = sliderImages.length > 1 ? [...sliderImages, ...sliderImages] : sliderImages;

  return (
    <section className="animation-section">
      <div className="slider">
        {loopImages.map((img, idx) => (
          <div key={idx} className="slide">
            <img src={img} alt={`Slider ${idx + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnimationSection;
