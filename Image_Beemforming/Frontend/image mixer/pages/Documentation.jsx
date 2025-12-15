import { Link } from "react-router-dom";
import "../styles/Documentation.css";

function Documentation() {
  const sections = [
    {
      title: "Fourier Transform Mixer",
      icon: "bi-soundwave",
      description:
        "Learn how to use the FT Mixer to explore frequency domain representations.",
      topics: [
        "Loading and managing images",
        "Understanding magnitude and phase components",
        "Mixing FT components from different images",
        "Using region selection for frequency filtering",
      ],
      link: "/ft-mixer",
    },
    {
      title: "Beamforming Simulator",
      icon: "bi-broadcast",
      description:
        "Explore antenna array configurations and beam steering principles.",
      topics: [
        "Array geometry and element spacing",
        "Beam steering and pattern formation",
        "Understanding interference patterns",
        "Wave propagation visualization",
      ],
      link: "/beamforming",
    },
  ];

  const concepts = [
    {
      title: "Fourier Transform Basics",
      content:
        "The Fourier Transform decomposes a signal into its frequency components, revealing the magnitude and phase at each frequency. This is fundamental for understanding signal processing, image analysis, and many engineering applications.",
    },
    {
      title: "Magnitude and Phase",
      content:
        "Magnitude represents the strength of each frequency component, while phase represents the timing offset. Both are essential for reconstructing the original signal from its frequency representation.",
    },
    {
      title: "Beamforming Principles",
      content:
        "Beamforming uses multiple antenna elements with controlled phase delays to steer the combined beam in a desired direction. This is used in radar, communications, and acoustic systems.",
    },
    {
      title: "Array Factor",
      content:
        "The array factor describes how antenna elements combine to create the overall beam pattern. Element spacing and count directly affect beam width and side lobe levels.",
    },
  ];

  return (
    <div className="documentation-page">
      {/* Header Section */}
      <section className="doc-header-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="doc-icon-container">
                  <i className="bi bi-journal-text doc-main-icon"></i>
                </div>
                <div>
                  <h1 className="doc-main-title">Documentation</h1>
                  <p className="doc-subtitle">
                    Learn how to use the Signal Processing Lab tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Sections */}
      <section className="doc-tools-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="row">
                {sections.map((section, index) => (
                  <div key={index} className="col-lg-6 mb-4">
                    <div className="doc-tool-card">
                      <div className="doc-tool-header">
                        <div className="d-flex align-items-start gap-3 mb-3">
                          <div className="doc-tool-icon">
                            <i className={`bi ${section.icon}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h2 className="doc-tool-title">{section.title}</h2>
                            <p className="doc-tool-description">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <Link to={section.link} className="doc-tool-link">
                          Open Tool
                          <i className="bi bi-box-arrow-up-right ms-2"></i>
                        </Link>
                      </div>

                      <div className="doc-tool-topics">
                        <h3 className="doc-topics-title">Topics Covered</h3>
                        <ul className="doc-topics-list">
                          {section.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="doc-topic-item">
                              <i className="bi bi-chevron-right doc-topic-icon"></i>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Concepts Section */}
      <section className="doc-concepts-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="d-flex align-items-center gap-3 mb-5">
                <i className="bi bi-question-circle doc-concepts-icon"></i>
                <h2 className="doc-section-title mb-0">Core Concepts</h2>
              </div>

              <div className="row">
                {concepts.map((concept, index) => (
                  <div key={index} className="col-md-6 mb-4">
                    <div className="doc-concept-card">
                      <h3 className="doc-concept-title">{concept.title}</h3>
                      <p className="doc-concept-content">{concept.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="doc-quickstart-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="doc-quickstart-card">
                <h2 className="doc-quickstart-title">
                  Ready to Start Experimenting?
                </h2>
                <p className="doc-quickstart-description">
                  Jump into either tool to begin exploring signal processing
                  concepts through hands-on interaction and real-time
                  visualization.
                </p>
                <div className="doc-quickstart-buttons">
                  <Link to="/ft-mixer" className="btn btn-primary btn-lg me-3">
                    <i className="bi bi-soundwave me-2"></i>
                    FT Mixer
                  </Link>
                  <Link
                    to="/beamforming"
                    className="btn btn-outline-primary btn-lg"
                  >
                    <i className="bi bi-broadcast me-2"></i>
                    Beamforming
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Documentation;
