// pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const features = [
  {
    icon: "bi-soundwave",
    title: "Fourier Transform Visualization",
    description:
      "Decompose signals into frequency components and visualize magnitude and phase spectra in real-time.",
  },
  {
    icon: "bi-broadcast",
    title: "Beamforming Simulation",
    description:
      "Design antenna arrays and visualize beam patterns, interference maps, and wave propagation.",
  },
  {
    icon: "bi-lightning-charge",
    title: "Real-time Interaction",
    description:
      "Adjust parameters instantly and see immediate visual feedback for deeper understanding.",
  },
  {
    icon: "bi-bullseye",
    title: "Hands-on Learning",
    description:
      "Learn by doing with interactive experiments designed for educational exploration.",
  },
];

const learningGoals = [
  "Understand frequency domain representation of signals",
  "Visualize how Fourier components combine to form complex signals",
  "Explore phase and magnitude relationships",
  "Learn antenna array geometry and element spacing effects",
  "Observe beam steering and pattern formation",
  "Analyze constructive and destructive interference",
];

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="text-center">
            {/* Badge */}
            <div className="hero-badge">
              <i className="bi bi-lightbulb hero-badge-icon"></i>
              Interactive Educational Platform
            </div>

            {/* Main Heading */}
            <h1 className="hero-title">
              Interactive Signal Processing
              <span className="hero-title-highlight">Laboratory</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              Explore Fourier Transform components and Beamforming principles
              through visual experimentation and hands-on learning.
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons">
              <Link to="/ft-mixer" className="btn btn-primary btn-lg hero-btn">
                <i className="bi bi-soundwave me-2"></i>
                Launch FT Mixer
                <i className="bi bi-arrow-right ms-2"></i>
              </Link>
              <Link
                to="/beamforming"
                className="btn btn-outline-primary btn-lg hero-btn"
              >
                <i className="bi bi-broadcast me-2"></i>
                Launch Beamforming Simulator
              </Link>
            </div>
          </div>

          {/* Decorative Wave Pattern */}
          <div className="hero-wave">
            <svg
              className="hero-wave-svg"
              viewBox="0 0 1200 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,50 Q150,0 300,50 T600,50 T900,50 T1200,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="hero-wave-primary"
              />
              <path
                d="M0,60 Q150,20 300,60 T600,60 T900,60 T1200,60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="hero-wave-secondary"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title mb-3">Powerful Learning Tools</h2>
            <p className="section-description">
              Two comprehensive simulators designed to make complex signal
              processing concepts intuitive and accessible.
            </p>
          </div>

          <div className="row">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3 mb-4">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="row">
            {/* Left Column - Description */}
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="about-badge">
                <i className="bi bi-journal-text me-2"></i>
                About This Platform
              </div>

              <h2 className="about-title">
                Learn Signal Processing Through Visual Exploration
              </h2>

              <p className="about-description">
                This educational platform provides interactive tools for
                understanding fundamental signal processing concepts. Whether
                you're a student learning about Fourier transforms or an
                engineer exploring beamforming techniques, these simulators
                offer hands-on experience with real-time visualization.
              </p>

              <div className="about-goals">
                {learningGoals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="about-goal-item">
                    <i className="bi bi-check-circle-fill about-goal-icon"></i>
                    <span className="about-goal-text">{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Features List */}
            <div className="col-lg-6">
              <div className="learning-objectives-card">
                <h3 className="learning-objectives-title">
                  Key Learning Objectives
                </h3>

                <div className="learning-objectives-list">
                  {learningGoals.map((goal, index) => (
                    <div key={index} className="learning-objective-item">
                      <div className="learning-objective-number">
                        {index + 1}
                      </div>
                      <span className="learning-objective-text">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="text-center">
            <h2 className="cta-title">Ready to Start Exploring?</h2>
            <p className="cta-description">
              Choose a simulator and begin your hands-on learning journey.
            </p>
            <div className="cta-buttons">
              <Link to="/ft-mixer" className="btn btn-primary btn-lg me-3 mb-2">
                <i className="bi bi-soundwave me-2"></i>
                FT Mixer
              </Link>
              <Link
                to="/beamforming"
                className="btn btn-outline-primary btn-lg me-3 mb-2"
              >
                <i className="bi bi-broadcast me-2"></i>
                Beamforming Simulator
              </Link>
              <Link
                to="/documentation"
                className="btn btn-secondary btn-lg mb-2"
              >
                <i className="bi bi-journal-text me-2"></i>
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
