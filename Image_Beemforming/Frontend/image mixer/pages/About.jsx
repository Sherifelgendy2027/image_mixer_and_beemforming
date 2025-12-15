// pages/About.jsx
import React from "react";
import "../styles/About.css";

function About() {
  const goals = [
    {
      icon: "bi-mortarboard",
      title: "Educational Focus",
      description:
        "Designed specifically for learning signal processing concepts through interactive experimentation.",
    },
    {
      icon: "bi-bullseye",
      title: "Hands-on Learning",
      description:
        "Real-time visualization and immediate feedback help build intuition for complex concepts.",
    },
    {
      icon: "bi-lightbulb",
      title: "Conceptual Clarity",
      description:
        "Clear visual representations make abstract mathematical concepts tangible and understandable.",
    },
    {
      icon: "bi-people",
      title: "Accessible Design",
      description:
        "Intuitive interface designed for students at various levels of signal processing experience.",
    },
  ];

  const technologies = [
    "React with JavaScript",
    "Bootstrap CSS",
    "Canvas Rendering",
    "Interactive Visualizations",
    "Responsive Design",
  ];

  return (
    <div className="about-page">
      {/* Header Section */}
      <section className="about-header-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-4 mb-4">
                <div className="about-icon-container">
                  <i className="bi bi-graph-up about-main-icon"></i>
                </div>
                <div>
                  <h1 className="about-main-title">Signal Processing Lab</h1>
                  <p className="about-subtitle">
                    Interactive Educational Platform
                  </p>
                </div>
              </div>

              <p className="about-description">
                An educational web application designed to help students and
                engineers understand signal processing concepts through visual
                experimentation. This platform provides interactive tools for
                exploring Fourier Transform components and Beamforming
                principles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="goals-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <h2 className="section-title mb-5">Project Goals</h2>

              <div className="row">
                {goals.map((goal, index) => (
                  <div key={index} className="col-md-6 mb-4">
                    <div className="goal-card">
                      <div className="goal-icon mb-3">
                        <i className={`bi ${goal.icon}`}></i>
                      </div>
                      <h3 className="goal-title">{goal.title}</h3>
                      <p className="goal-description">{goal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="row">
                <div className="col-lg-6 mb-5 mb-lg-0">
                  <h2 className="feature-section-title mb-4">
                    FT Mixer Capabilities
                  </h2>
                  <ul className="features-list">
                    {[
                      "Load and visualize multiple images simultaneously",
                      "View magnitude, phase, real, and imaginary components",
                      "Mix FT components from different sources",
                      "Apply region-based frequency filtering",
                      "Compare results in dual output viewports",
                    ].map((item, index) => (
                      <li key={index} className="feature-item">
                        <div className="feature-number">{index + 1}</div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-lg-6">
                  <h2 className="feature-section-title mb-4">
                    Beamforming Capabilities
                  </h2>
                  <ul className="features-list">
                    {[
                      "Configure array geometry and element count",
                      "Adjust element spacing in wavelength units",
                      "Steer beam direction with real-time updates",
                      "Visualize beam patterns and side lobes",
                      "Observe interference patterns and wave propagation",
                    ].map((item, index) => (
                      <li key={index} className="feature-item">
                        <div className="feature-number feature-number-teal">
                          {index + 1}
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="technologies-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3 mb-5">
                <i className="bi bi-code-slash technologies-icon"></i>
                <h2 className="section-title mb-0">Built With</h2>
              </div>

              <div className="d-flex flex-wrap gap-3">
                {technologies.map((tech, index) => (
                  <span key={index} className="technology-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credits Section */}
      <section className="credits-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <p className="credits-text">
                Developed as an educational resource for signal processing
                courses.
              </p>
              <p className="credits-year">
                © {new Date().getFullYear()} Signal Processing Lab. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
