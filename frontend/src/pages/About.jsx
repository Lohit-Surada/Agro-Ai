import React from "react";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/homecomponents/Footer";
import "../styles/public/About.css";

const innovationCards = [
  {
    title: "AI Soil Detection",
    description:
      "Image-based soil analysis helps users classify soil type quickly, reducing manual trial-and-error.",
    tag: "Computer Vision",
  },
  {
    title: "Crop Recommendation Engine",
    description:
      "A predictive model evaluates soil and environmental inputs to suggest suitable crops for better farm decisions.",
    tag: "ML Decision Support",
  },
  {
    title: "Role-Based Access",
    description:
      "Secure user and admin workflows ensure reliable access control for platform features and management tools.",
    tag: "Security",
  },
  {
    title: "Unified Search and Discovery",
    description:
      "Integrated crop and soil discovery flows help users move from learning to action inside one interface.",
    tag: "Product UX",
  },
];

const processSteps = [
  {
    title: "Authenticate",
    detail:
      "Users sign in to open protected AI features and maintain controlled access across the platform.",
  },
  {
    title: "Capture Inputs",
    detail:
      "Users upload soil images or enter agronomic values such as N, P, K, pH, humidity, temperature, and rainfall.",
  },
  {
    title: "Run AI Inference",
    detail:
      "Backend models process the inputs to identify soil conditions and generate recommendation outputs.",
  },
  {
    title: "Act on Insights",
    detail:
      "Users review predictions, confidence cues, and suggested crops to make practical field decisions.",
  },
  {
    title: "Improve Over Time",
    detail:
      "Admin management and evolving data pipelines support continuous improvement of system quality and reliability.",
  },
];

const achievementPoints = [
  "Delivered an end-to-end platform combining authentication, soil intelligence, crop prediction, and search in a single UI.",
  "Implemented protected feature access to keep advanced modules available only to authenticated users.",
  "Enabled admin operations for managing crop, soil, and user records from dedicated interfaces.",
  "Built a clean, guided experience from onboarding to prediction with consistent component-driven design.",
  "Integrated API-first backend communication for real-time inference and dynamic content rendering.",
];

const About = () => {
  return (
    <div className="about-page">
      <Navbar />

      <main className="about-main">
        <section className="about-hero">
          <p className="about-kicker">About AgroAI</p>
          <h1 className="about-title">Building Practical AI for Smart Agriculture</h1>
          <p className="about-subtitle">
            AgroAI is designed as a full agricultural intelligence workflow: secure user access,
            soil understanding, crop recommendation, and searchable knowledge in one experience.
          </p>
        </section>

        <section className="about-section">
          <div className="about-section-head">
            <h2>Current Innovations</h2>
            <p>Key product and engineering capabilities currently powering the platform.</p>
          </div>
          <div className="innovation-grid">
            {innovationCards.map((item) => (
              <article className="innovation-card" key={item.title}>
                <span className="innovation-tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section process-section">
          <div className="about-section-head">
            <h2>How The Process Works</h2>
            <p>From login to actionable output, this is the complete user flow.</p>
          </div>
          <div className="process-timeline">
            {processSteps.map((step, index) => (
              <div className="process-item" key={step.title}>
                <div className="process-index">{index + 1}</div>
                <div className="process-content">
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-head">
            <h2>Project Achievements</h2>
            <p>Milestones already accomplished in the current release of AgroAI.</p>
          </div>
          <ul className="achievement-list">
            {achievementPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
