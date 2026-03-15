// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/shared/Navbar";
import Hero from "../components/homecomponents/Hero";
import FeaturesSection from "../components/homecomponents/FeaturesSection";
import AnimationSection from "../components/homecomponents/AnimationSection";
import Footer from "../components/homecomponents/Footer";

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <AnimationSection />
      <Footer />
    </div>
  );
};

export default Home;