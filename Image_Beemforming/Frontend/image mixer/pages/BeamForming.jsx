// pages/BeamformingSimulator.jsx
import React, { useState } from "react";
import "../styles/Beamforming.css";

// Custom components
const Slider = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}) => {
  return (
    <input
      type="range"
      className={`form-range beamforming-slider ${className}`}
      value={value}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      min={min}
      max={max}
      step={step}
    />
  );
};

const Switch = ({ checked, onCheckedChange }) => {
  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input beamforming-switch"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
    </div>
  );
};

const Input = ({
  value,
  onChange,
  type = "number",
  className = "",
  placeholder = "",
}) => {
  return (
    <input
      type={type}
      className={`form-control ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

const Select = ({ value, onValueChange, children, triggerClassName = "" }) => {
  return (
    <select
      className={`form-select beamforming-select ${triggerClassName}`}
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

// Collapsible component
const Collapsible = ({ trigger, children, open = false, onOpenChange }) => {
  return (
    <div className="beamforming-collapsible">
      <button
        className="collapsible-trigger"
        onClick={onOpenChange}
        type="button"
      >
        {trigger}
        <i
          className={`bi bi-chevron-down collapsible-chevron ${
            open ? "open" : ""
          }`}
        ></i>
      </button>
      {open && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

const scenarios = [
  { value: "linear", label: "Linear Array" },
  { value: "circular", label: "Circular Array" },
  { value: "planar", label: "Planar Array" },
  { value: "custom", label: "Custom Configuration" },
];

function VisualizationPanel({ title, icon, children }) {
  return (
    <div className="beamforming-viz-panel">
      <div className="viz-panel-header">
        {icon}
        <span className="viz-panel-title">{title}</span>
      </div>
      <div className="viz-panel-content">{children}</div>
    </div>
  );
}

function ArrayGeometryPreview({ elementCount, spacing }) {
  const elements = Array.from(
    { length: Math.min(elementCount, 16) },
    (_, i) => i
  );

  return (
    <div className="array-geometry-preview">
      <div className="elements-container">
        {elements.map((_, index) => (
          <div
            key={index}
            className="array-element"
            style={{
              marginLeft: index > 0 ? `${Math.max(2, spacing / 10)}px` : 0,
            }}
          />
        ))}
      </div>
      <div className="preview-label">
        {elementCount} elements · λ/{((2 / spacing) * 100).toFixed(0)} spacing
      </div>
    </div>
  );
}

function BeamPatternPreview({ steeringAngle }) {
  return (
    <div className="beam-pattern-preview">
      <div className="pattern-svg-container">
        <svg className="pattern-svg" viewBox="-150 -150 300 300">
          {/* Grid circles */}
          {[30, 60, 90, 120].map((r) => (
            <circle
              key={r}
              cx="0"
              cy="0"
              r={r}
              fill="none"
              stroke="#E9ECEF" /* Viz Grid */
              strokeWidth="1"
            />
          ))}

          {/* Angle lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="0"
              y1="0"
              x2={Math.cos((angle * Math.PI) / 180) * 120}
              y2={Math.sin((angle * Math.PI) / 180) * 120}
              stroke="#E9ECEF" /* Viz Grid */
              strokeWidth="1"
            />
          ))}

          {/* Main beam */}
          <path
            d={`M 0,0 L ${
              Math.cos(((steeringAngle - 90) * Math.PI) / 180) * 100
            },${Math.sin(((steeringAngle - 90) * Math.PI) / 180) * 100}`}
            stroke="#007BFF" /* Ring / Sidebar Primary */
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Beam pattern (simplified) */}
          <ellipse
            cx={Math.cos(((steeringAngle - 90) * Math.PI) / 180) * 50}
            cy={Math.sin(((steeringAngle - 90) * Math.PI) / 180) * 50}
            rx="30"
            ry="60"
            fill="rgba(0, 123, 255, 0.2)" /* Primary with opacity */
            stroke="#007BFF" /* Ring / Sidebar Primary */
            strokeWidth="2"
            transform={`rotate(${steeringAngle} ${
              Math.cos(((steeringAngle - 90) * Math.PI) / 180) * 50
            } ${Math.sin(((steeringAngle - 90) * Math.PI) / 180) * 50})`}
          />
        </svg>
      </div>
      <div className="preview-label">Steering: {steeringAngle}°</div>
    </div>
  );
}

function InterferenceMapPreview() {
  return (
    <div className="interference-preview">
      <div className="interference-gradient">
        <div className="placeholder-content">
          <i className="bi bi-grid-3x3 placeholder-icon"></i>
          <span className="placeholder-text">Interference Pattern</span>
        </div>
      </div>
    </div>
  );
}

function WaveVisualizationPreview({ animate = true }) {
  return (
    <div className="wave-preview">
      <svg className="wave-svg" preserveAspectRatio="none">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d="M0,50 Q25,30 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50"
            fill="none"
            stroke={i === 1 ? "#007BFF" : "rgba(0, 123, 255, 0.3)"}
            strokeWidth={i === 1 ? "2" : "1"}
            transform={`translate(0, ${40 + i * 30})`}
            className={animate ? "wave-animation" : ""}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </svg>
      <div className="preview-label">Wave Propagation</div>
    </div>
  );
}

function Beamforming() {
  const [scenario, setScenario] = useState("linear");
  const [elementCount, setElementCount] = useState([8]);
  const [spacing, setSpacing] = useState([50]);
  const [steeringAngle, setSteeringAngle] = useState([0]);
  const [frequency, setFrequency] = useState("1000");
  const [showSideLobes, setShowSideLobes] = useState(true);
  const [animateWaves, setAnimateWaves] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [openSections, setOpenSections] = useState({
    array: true,
    element: true,
    scenarios: false,
    visualization: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSimulate = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1500);
  };

  const handleReset = () => {
    setElementCount([8]);
    setSpacing([50]);
    setSteeringAngle([0]);
    setFrequency("1000");
    setScenario("linear");
    setShowSideLobes(true);
    setAnimateWaves(true);
    setIsProcessing(false);
  };

  return (
    <div className="beamforming-page">
      <div className="beamforming-layout">
        {/* Left Control Sidebar */}
        <div className="control-sidebar">
          <div className="sidebar-content">
            {/* Array Configuration */}
            <Collapsible
              open={openSections.array}
              onOpenChange={() => toggleSection("array")}
              trigger={
                <div className="collapsible-header">
                  <i className="bi bi-broadcast collapsible-icon"></i>
                  <span className="collapsible-title">Array Configuration</span>
                </div>
              }
            >
              <div className="panel-card">
                <div className="slider-group">
                  <div className="slider-header">
                    <Label className="slider-label">Number of Elements</Label>
                    <span className="slider-value">{elementCount[0]}</span>
                  </div>
                  <Slider
                    value={elementCount[0]}
                    onValueChange={(v) => setElementCount(v)}
                    min={2}
                    max={32}
                    step={1}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <Label className="slider-label">Element Spacing (λ)</Label>
                    <span className="slider-value">
                      {(spacing[0] / 100).toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={spacing[0]}
                    onValueChange={(v) => setSpacing(v)}
                    min={10}
                    max={200}
                    step={5}
                  />
                </div>
              </div>
            </Collapsible>

            {/* Beam Steering */}
            <Collapsible
              open={openSections.element}
              onOpenChange={() => toggleSection("element")}
              trigger={
                <div className="collapsible-header">
                  <i className="bi bi-bullseye collapsible-icon"></i>
                  <span className="collapsible-title">Beam Steering</span>
                </div>
              }
            >
              <div className="panel-card">
                <div className="slider-group">
                  <div className="slider-header">
                    <Label className="slider-label">Steering Angle (°)</Label>
                    <span className="slider-value">{steeringAngle[0]}°</span>
                  </div>
                  <Slider
                    value={steeringAngle[0]}
                    onValueChange={(v) => setSteeringAngle(v)}
                    min={-90}
                    max={90}
                    step={1}
                  />
                </div>

                <div className="slider-group">
                  <Label className="slider-label">Frequency (Hz)</Label>
                  <Input
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="beamforming-input"
                  />
                </div>
              </div>
            </Collapsible>

            {/* Scenarios */}
            <Collapsible
              open={openSections.scenarios}
              onOpenChange={() => toggleSection("scenarios")}
              trigger={
                <div className="collapsible-header">
                  <i className="bi bi-grid-3x3 collapsible-icon"></i>
                  <span className="collapsible-title">Scenarios</span>
                </div>
              }
            >
              <div className="panel-card">
                <Select value={scenario} onValueChange={setScenario}>
                  {scenarios.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </Collapsible>

            {/* Visualization Controls */}
            <Collapsible
              open={openSections.visualization}
              onOpenChange={() => toggleSection("visualization")}
              trigger={
                <div className="collapsible-header">
                  <i className="bi bi-soundwave collapsible-icon"></i>
                  <span className="collapsible-title">Visualization</span>
                </div>
              }
            >
              <div className="panel-card">
                <div className="switch-group">
                  <Label className="switch-label">Show Side Lobes</Label>
                  <Switch
                    checked={showSideLobes}
                    onCheckedChange={setShowSideLobes}
                  />
                </div>
                <div className="switch-group">
                  <Label className="switch-label">Animate Waves</Label>
                  <Switch
                    checked={animateWaves}
                    onCheckedChange={setAnimateWaves}
                  />
                </div>
              </div>
            </Collapsible>
          </div>

          {/* Action Buttons */}
          <div className="sidebar-footer">
            <button
              onClick={handleSimulate}
              className="btn btn-primary w-100 mb-2 simulate-btn"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="bi bi-circle animate-pulse me-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-play-fill me-2"></i>
                  Simulate
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="btn btn-outline-primary w-100"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="main-visualization">
          {/* Visualization Grid */}
          <div className="visualization-grid">
            <VisualizationPanel
              title="Array Geometry"
              icon={<i className="bi bi-broadcast viz-icon"></i>}
            >
              <ArrayGeometryPreview
                elementCount={elementCount[0]}
                spacing={spacing[0]}
              />
            </VisualizationPanel>

            <VisualizationPanel
              title="Beam Pattern"
              icon={<i className="bi bi-bullseye viz-icon"></i>}
            >
              <BeamPatternPreview steeringAngle={steeringAngle[0]} />
            </VisualizationPanel>

            <VisualizationPanel
              title="Interference Map"
              icon={<i className="bi bi-grid-3x3 viz-icon"></i>}
            >
              <InterferenceMapPreview />
            </VisualizationPanel>

            <VisualizationPanel
              title="Wave Visualization"
              icon={<i className="bi bi-soundwave viz-icon"></i>}
            >
              <WaveVisualizationPreview animate={animateWaves} />
            </VisualizationPanel>
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-indicator">
              <div
                className={`status-dot ${
                  isProcessing ? "processing" : "ready"
                }`}
              />
              <span className="status-text">
                {isProcessing ? "Processing..." : "Ready"}
              </span>
            </div>

            <div className="status-divider" />

            <div className="status-values">
              <div className="status-item">
                <span className="status-label">Elements: </span>
                <span className="status-value">{elementCount[0]}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Spacing: </span>
                <span className="status-value">
                  {(spacing[0] / 100).toFixed(2)}λ
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Angle: </span>
                <span className="status-value">{steeringAngle[0]}°</span>
              </div>
              <div className="status-item">
                <span className="status-label">Frequency: </span>
                <span className="status-value">{frequency} Hz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Beamforming;
