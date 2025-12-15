// pages/FTMixer.jsx
import React, { useState } from "react";
import "../styles/FTMixer.css";

// Custom components since we don't have shadcn
const Slider = ({
  value,
  onValueChange,
  max = 100,
  step = 1,
  className = "",
}) => {
  return (
    <input
      type="range"
      className={`form-range custom-slider ${className}`}
      value={value}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      min="0"
      max={max}
      step={step}
    />
  );
};

const Switch = ({ checked, onCheckedChange }) => {
  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input custom-switch"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
    </div>
  );
};

const Select = ({ value, onValueChange, children, triggerClassName = "" }) => {
  return (
    <select
      className={`form-select custom-select ${triggerClassName}`}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  );
};

const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

const Label = ({ children, className = "" }) => {
  return <label className={`form-label ${className}`}>{children}</label>;
};

const ftComponents = [
  { value: "magnitude", label: "Magnitude" },
  { value: "phase", label: "Phase" },
  { value: "real", label: "Real" },
  { value: "imaginary", label: "Imaginary" },
];

function InputViewport({ index, title, component, onComponentChange }) {
  return (
    <div className="viewport-container">
      <div className="viewport-header">
        <div className="viewport-header-left">
          <div className="viewport-index">
            <span>{index}</span>
          </div>
          <span className="viewport-title">{title}</span>
        </div>
        <Select value={component} onValueChange={onComponentChange}>
          {ftComponents.map((comp) => (
            <SelectItem key={comp.value} value={comp.value}>
              {comp.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="viewport-content">
        {/* Original Image */}
        <div className="viewport-image-container">
          <div className="viewport-placeholder">
            <i className="bi bi-image placeholder-icon"></i>
            <span className="placeholder-text">Original Image</span>
          </div>
        </div>

        {/* FT Component */}
        <div className="viewport-image-container">
          <div className="viewport-placeholder">
            <i className="bi bi-layers placeholder-icon"></i>
            <span className="placeholder-text">FT {component}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputViewport({ label }) {
  return (
    <div className="output-viewport-container">
      <div className="output-viewport-header">
        <div className="viewport-header-left">
          <div className="output-viewport-icon">
            <i className="bi bi-square"></i>
          </div>
          <span className="viewport-title">{label}</span>
        </div>
      </div>

      <div className="output-viewport-content">
        <div className="output-placeholder">
          <i className="bi bi-image placeholder-icon-large"></i>
          <span className="placeholder-text">Mixed Output</span>
          <p className="placeholder-subtext">Adjust sliders to see result</p>
        </div>
      </div>
    </div>
  );
}

function FTMixer() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeOutput, setActiveOutput] = useState("A");
  const [viewportComponents, setViewportComponents] = useState([
    "magnitude",
    "magnitude",
    "magnitude",
    "magnitude",
  ]);
  const [mixerValues, setMixerValues] = useState([
    50, 50, 50, 50, 50, 50, 50, 50,
  ]);
  const [useMagPhase, setUseMagPhase] = useState(true);
  const [useInnerRegion, setUseInnerRegion] = useState(true);
  const [regionSize, setRegionSize] = useState([50]);

  const handleComponentChange = (index, value) => {
    const newComponents = [...viewportComponents];
    newComponents[index] = value;
    setViewportComponents(newComponents);
  };

  const handleSliderChange = (index, value) => {
    const newValues = [...mixerValues];
    newValues[index] = value[0];
    setMixerValues(newValues);
  };

  return (
    <div className="ft-mixer-page">
      <div className="ft-mixer-layout">
        {/* Left Control Panel */}
        <div className={`left-panel ${leftPanelOpen ? "open" : "closed"}`}>
          {leftPanelOpen && (
            <div className="panel-content">
              {/* Image Management */}
              <div className="panel-section">
                <h3 className="panel-title">
                  <i className="bi bi-upload me-2"></i>
                  Image Management
                </h3>
                <div className="image-buttons">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      className="btn btn-outline-primary btn-sm image-btn"
                    >
                      Load Image {num}
                    </button>
                  ))}
                </div>
                <button className="btn btn-outline-secondary btn-sm w-100 mt-2">
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reset All
                </button>
              </div>

              {/* Components Mixer */}
              <div className="panel-section">
                <h3 className="panel-title">
                  <i className="bi bi-sliders me-2"></i>
                  Components Mixer
                </h3>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Label className="panel-label">
                    {useMagPhase ? "Magnitude / Phase" : "Real / Imaginary"}
                  </Label>
                  <Switch
                    checked={useMagPhase}
                    onCheckedChange={setUseMagPhase}
                  />
                </div>

                <div className="sliders-section">
                  {mixerValues.map((value, index) => (
                    <div key={index} className="slider-group">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Label className="slider-label">
                          {useMagPhase
                            ? index % 2 === 0
                              ? `Mag ${Math.floor(index / 2) + 1}`
                              : `Phase ${Math.floor(index / 2) + 1}`
                            : index % 2 === 0
                            ? `Real ${Math.floor(index / 2) + 1}`
                            : `Imag ${Math.floor(index / 2) + 1}`}
                        </Label>
                        <span className="slider-value">{value}%</span>
                      </div>
                      <Slider
                        value={value}
                        onValueChange={(v) => handleSliderChange(index, v)}
                        max={100}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Regions Mixer */}
              <div className="panel-section">
                <h3 className="panel-title">
                  <i className="bi bi-square me-2"></i>
                  Regions Mixer
                </h3>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Label className="panel-label">
                    {useInnerRegion ? "Inner Region" : "Outer Region"}
                  </Label>
                  <Switch
                    checked={useInnerRegion}
                    onCheckedChange={setUseInnerRegion}
                  />
                </div>

                <div className="slider-group">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label className="slider-label">Region Size</Label>
                    <span className="slider-value">{regionSize[0]}%</span>
                  </div>
                  <Slider
                    value={regionSize[0]}
                    onValueChange={(v) => setRegionSize(v)}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Left Panel */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="panel-toggle left-toggle"
        >
          {leftPanelOpen ? (
            <i className="bi bi-chevron-left"></i>
          ) : (
            <i className="bi bi-chevron-right"></i>
          )}
        </button>

        {/* Main Workspace */}
        <div className="main-workspace">
          {/* Output Selection */}
          <div className="workspace-header">
            <span className="header-title">Show mix in:</span>
            <div className="output-selector">
              <button
                className={`btn btn-sm ${
                  activeOutput === "A" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveOutput("A")}
              >
                Output A
              </button>
              <button
                className={`btn btn-sm ${
                  activeOutput === "B" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveOutput("B")}
              >
                Output B
              </button>
            </div>
            <div className="flex-grow-1"></div>
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-play-fill me-2"></i>
              Process Mix
            </button>
          </div>

          {/* Viewports Grid */}
          <div className="workspace-content">
            <div className="viewport-grid">
              {/* Input Viewports - 2x2 Grid */}
              <div className="input-viewports">
                {[1, 2, 3, 4].map((num, index) => (
                  <InputViewport
                    key={num}
                    index={num}
                    title={`Input ${num}`}
                    component={viewportComponents[index]}
                    onComponentChange={(v) => handleComponentChange(index, v)}
                  />
                ))}
              </div>

              {/* Output Viewports */}
              <div className="output-viewports">
                <OutputViewport label="Output A" />
                <OutputViewport label="Output B" />
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Right Panel */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="panel-toggle right-toggle"
        >
          {rightPanelOpen ? (
            <i className="bi bi-chevron-right"></i>
          ) : (
            <i className="bi bi-chevron-left"></i>
          )}
        </button>

        {/* Right Information Panel */}
        <div className={`right-panel ${rightPanelOpen ? "open" : "closed"}`}>
          {rightPanelOpen && (
            <div className="panel-content">
              {/* Current Settings */}
              <div className="panel-section">
                <h3 className="panel-title">Current Settings</h3>
                <div className="settings-card">
                  <div className="setting-item">
                    <span className="setting-label">Mode:</span>
                    <span className="setting-value">
                      {useMagPhase ? "Mag/Phase" : "Real/Imag"}
                    </span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Region:</span>
                    <span className="setting-value">
                      {useInnerRegion ? "Inner" : "Outer"}
                    </span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Region Size:</span>
                    <span className="setting-value">{regionSize[0]}%</span>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Active Output:</span>
                    <span className="setting-value">Output {activeOutput}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="panel-section">
                <h3 className="panel-title">Instructions</h3>
                <div className="instructions-list">
                  <p>
                    1. Load images into the input viewports using the controls
                    on the left.
                  </p>
                  <p>
                    2. Select which FT component to display for each viewport.
                  </p>
                  <p>
                    3. Adjust the mixer sliders to blend components from
                    different images.
                  </p>
                  <p>
                    4. Use region controls to focus on specific frequency areas.
                  </p>
                  <p>5. Click "Process Mix" to see the result.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FTMixer;
