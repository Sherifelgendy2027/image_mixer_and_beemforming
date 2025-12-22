import React, { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import "../styles/Beamforming.css";

// Import components
import Switch from "../src/components/Switch";
import Label from "../src/components/Label";
import Collapsible from "../src/components/Collapsible";
import UnitCard from "../src/components/UnitCard";
import VisualizationPanel from "../src/components/VisualizationPanel";

// Import constants and utils
import { defaultUnit, scenarios } from "../src/constants/beamforming";
import {
  simulateBeamforming,
  validateApiResponse,
} from "../src/utils/beamforming";

function Beamforming() {
  const [units, setUnits] = useState([{ ...defaultUnit }]);
  const [selectedScenario, setSelectedScenario] = useState("5g");
  const [isProcessing, setIsProcessing] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null);
  const [apiStatus, setApiStatus] = useState("disconnected"); // 'disconnected', 'connected', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  // Chart refs
  const beamChartRef = useRef(null);
  const polarChartRef = useRef(null);
  const geoChartRef = useRef(null);

  // Chart instances refs
  const beamChartInstance = useRef(null);
  const polarChartInstance = useRef(null);
  const geoChartInstance = useRef(null);

  // Test API connection on mount
  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const testPayload = { arrays: [defaultUnit] };
      const response = await fetch("http://localhost:5000/simulate_beam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        setApiStatus("connected");
        setErrorMessage("");
      } else {
        setApiStatus("error");
        setErrorMessage("API server responded with error");
      }
    } catch (error) {
      setApiStatus("disconnected");
      setErrorMessage("Cannot connect to API server. Using mock data.");
      console.log("API Connection Error:", error.message);
    }
  };

  // Initialize charts
  useEffect(() => {
    const initCharts = () => {
      // Clean up existing charts before creating new ones
      if (beamChartInstance.current) {
        beamChartInstance.current.destroy();
      }
      if (polarChartInstance.current) {
        polarChartInstance.current.destroy();
      }
      if (geoChartInstance.current) {
        geoChartInstance.current.destroy();
      }

      // 1. Rectangular Chart
      if (beamChartRef.current) {
        const beamCtx = beamChartRef.current.getContext("2d");
        beamChartInstance.current = new Chart(beamCtx, {
          type: "line",
          data: {
            labels: Array.from({ length: 181 }, (_, i) => i - 90),
            datasets: [
              {
                label: "Gain (dB)",
                data: Array(181).fill(-60),
                borderColor: "#4fa08b",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Angle (degrees)",
                  color: "#aaa",
                  font: { size: 12 },
                },
                ticks: {
                  color: "#aaa",
                  stepSize: 30,
                  callback: function (value) {
                    return value + "°";
                  },
                },
                grid: { color: "rgba(255,255,255,0.1)" },
                min: -90,
                max: 90,
              },
              y: {
                title: {
                  display: true,
                  text: "Magnitude (dB)",
                  color: "#aaa",
                  font: { size: 12 },
                },
                min: -60,
                max: 0,
                ticks: {
                  color: "#aaa",
                  stepSize: 10,
                  callback: function (value) {
                    return value + " dB";
                  },
                },
                grid: { color: "rgba(255,255,255,0.1)" },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                  label: function (context) {
                    return `Angle: ${
                      context.label
                    }°, Gain: ${context.parsed.y.toFixed(2)} dB`;
                  },
                },
              },
            },
          },
        });
      }

      // 2. Polar Chart
      if (polarChartRef.current) {
        const polarCtx = polarChartRef.current.getContext("2d");
        polarChartInstance.current = new Chart(polarCtx, {
          type: "radar",
          data: {
            labels: Array.from({ length: 360 }, (_, i) => i),
            datasets: [
              {
                label: "Gain (dB)",
                data: Array(360).fill(-60),
                borderColor: "#4fa08b",
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                backgroundColor: "rgba(79, 160, 139, 0.2)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: {
                  color: "rgba(255, 255, 255, 0.2)",
                  lineWidth: 1,
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                  circular: true,
                },
                pointLabels: { display: false },
                min: -60,
                max: 0,
                ticks: {
                  display: true,
                  stepSize: 10,
                  backdropColor: "transparent",
                  color: "#aaa",
                  font: { size: 10 },
                },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const angle = context.dataIndex;
                    const gain = context.raw;
                    return `Angle: ${angle}°, Gain: ${gain.toFixed(2)} dB`;
                  },
                },
              },
            },
            elements: {
              line: {
                tension: 0,
              },
            },
          },
        });
      }

      // 3. Geometry Chart
      if (geoChartRef.current) {
        const geoCtx = geoChartRef.current.getContext("2d");
        geoChartInstance.current = new Chart(geoCtx, {
          type: "scatter",
          data: {
            datasets: [
              {
                label: "Array Elements",
                data: [{ x: 0, y: 0 }],
                backgroundColor: "#4fa08b",
                borderColor: "#ffffff",
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: "linear",
                position: "bottom",
                title: {
                  display: true,
                  text: "X Position (meters)",
                  color: "#aaa",
                  font: { size: 12 },
                },
                ticks: {
                  color: "#aaa",
                  callback: function (value) {
                    return value.toFixed(2) + " m";
                  },
                },
                grid: { color: "rgba(255,255,255,0.1)" },
                min: -2,
                max: 2,
              },
              y: {
                title: {
                  display: true,
                  text: "Y Position (meters)",
                  color: "#aaa",
                  font: { size: 12 },
                },
                ticks: {
                  color: "#aaa",
                  callback: function (value) {
                    return value.toFixed(2) + " m";
                  },
                },
                grid: { color: "rgba(255,255,255,0.1)" },
                min: -2,
                max: 2,
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const point = context.raw;
                    return `Element ${context.dataIndex}: (${point.x.toFixed(
                      3
                    )} m, ${point.y.toFixed(3)} m)`;
                  },
                },
              },
            },
          },
        });
      }
    };

    initCharts();

    // Cleanup on unmount
    return () => {
      [beamChartInstance, polarChartInstance, geoChartInstance].forEach(
        (instance) => {
          if (instance.current) {
            instance.current.destroy();
            instance.current = null;
          }
        }
      );
    };
  }, []);

  // Load scenario
  const loadScenario = (name) => {
    const newUnits = JSON.parse(JSON.stringify(scenarios[name]));
    setUnits(newUnits);
    setSelectedScenario(name);
    requestSimulation(newUnits);
  };

  // Add unit
  const addUnit = () => {
    const newUnits = [...units, { ...defaultUnit }];
    setUnits(newUnits);
    requestSimulation(newUnits);
  };

  // Remove unit
  const removeUnit = (index) => {
    if (units.length <= 1) {
      alert("At least one array unit is required");
      return;
    }
    const newUnits = units.filter((_, i) => i !== index);
    setUnits(newUnits);
    requestSimulation(newUnits);
  };

  // Update unit
  const updateUnit = (index, key, value) => {
    const newUnits = [...units];

    if (key === "type") {
      newUnits[index][key] = value;
    } else {
      const numValue = parseFloat(value);
      newUnits[index][key] = isNaN(numValue) ? 0 : numValue;

      // Validate ranges
      if (key === "steering" && (numValue < -90 || numValue > 90)) {
        alert("Steering angle must be between -90 and 90 degrees");
        return;
      }
      if (key === "frequency" && numValue <= 0) {
        alert("Frequency must be positive");
        return;
      }
      if (key === "elements" && (numValue < 1 || !Number.isInteger(numValue))) {
        alert("Number of elements must be a positive integer");
        return;
      }
    }

    setUnits(newUnits);

    // Auto-simulate if auto-update is enabled
    if (true) {
      // You can connect this to a state variable for auto-update toggle
      requestSimulation(newUnits);
    }
  };

  // Request simulation
  const requestSimulation = async (unitsToSimulate = units) => {
    setIsProcessing(true);
    setErrorMessage("");

    const payload = {
      arrays: unitsToSimulate.map((unit) => ({
        frequency: unit.frequency,
        elements: unit.elements,
        spacing: unit.spacing,
        steering: unit.steering,
        type: unit.type,
        curvature: unit.curvature,
        x_pos: unit.x_pos,
        y_pos: unit.y_pos,
      })),
    };

    console.log("Sending simulation request:", payload);

    try {
      const response = await simulateBeamforming(payload);

      // Validate response
      validateApiResponse(response);

      // Update heatmap
      if (response.heatmap) {
        setHeatmapData(response.heatmap);
      } else {
        setHeatmapData(null);
      }

      // Update rectangular chart
      if (
        beamChartInstance.current &&
        response.beam_angles &&
        response.beam_values
      ) {
        beamChartInstance.current.data.labels = response.beam_angles;
        beamChartInstance.current.data.datasets[0].data = response.beam_values;

        // Find main lobe for better scaling
        const maxGain = Math.max(...response.beam_values);
        if (maxGain > -10) {
          beamChartInstance.current.options.scales.y.max =
            Math.ceil(maxGain / 10) * 10;
        }

        beamChartInstance.current.update("none");
      }

      // Update polar chart
      if (
        polarChartInstance.current &&
        response.beam_angles &&
        response.beam_values
      ) {
        // Convert -90 to 90 degrees to 0 to 360 degrees for polar chart
        const polarData = new Array(360).fill(-60);
        response.beam_angles.forEach((angle, i) => {
          let polarAngle = Math.round(angle);
          if (polarAngle < 0) polarAngle += 360;
          if (polarAngle >= 0 && polarAngle < 360) {
            polarData[polarAngle] = response.beam_values[i];
          }
        });

        polarChartInstance.current.data.datasets[0].data = polarData;
        polarChartInstance.current.update("none");
      }

      // Update geometry chart
      if (
        geoChartInstance.current &&
        response.geometry_x &&
        response.geometry_y
      ) {
        const points = response.geometry_x.map((x, i) => ({
          x: x,
          y: response.geometry_y[i],
        }));

        // Update chart bounds based on data
        const allX = points.map((p) => p.x);
        const allY = points.map((p) => p.y);
        const xMin = Math.min(...allX);
        const xMax = Math.max(...allX);
        const yMin = Math.min(...allY);
        const yMax = Math.max(...allY);

        // Add padding to bounds
        const xPadding = Math.max(0.1, (xMax - xMin) * 0.2);
        const yPadding = Math.max(0.1, (yMax - yMin) * 0.2);

        geoChartInstance.current.options.scales.x.min = xMin - xPadding;
        geoChartInstance.current.options.scales.x.max = xMax + xPadding;
        geoChartInstance.current.options.scales.y.min = yMin - yPadding;
        geoChartInstance.current.options.scales.y.max = yMax + yPadding;

        geoChartInstance.current.data.datasets[0].data = points;
        geoChartInstance.current.update();
      }

      // Update API status
      if (apiStatus === "disconnected" && !response.heatmap?.includes("mock")) {
        setApiStatus("connected");
      }
    } catch (error) {
      console.error("Simulation error:", error);
      setErrorMessage(error.message || "Failed to simulate beamforming");
      setApiStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize with 5g scenario
  useEffect(() => {
    loadScenario("5g");
  }, []);

  const [openSections, setOpenSections] = useState({
    scenarios: true,
    units: true,
    visualization: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Add a quick actions bar
  const quickActions = [
    { label: "Clear All", icon: "bi-trash", action: () => loadScenario("5g") },
    { label: "Add Unit", icon: "bi-plus-circle", action: addUnit },
    { label: "Test API", icon: "bi-wifi", action: testApiConnection },
  ];

  return (
    <div className="beamforming-page">
      <div className="beamforming-layout">
        {/* API Status Indicator */}
        <div className={`api-status-indicator ${apiStatus}`}>
          <div className="api-status-dot" />
          <span className="api-status-text">
            API:{" "}
            {apiStatus === "connected"
              ? "Connected"
              : apiStatus === "disconnected"
              ? "Using Mock Data"
              : "Error"}
          </span>
          {errorMessage && (
            <span className="api-error-message"> - {errorMessage}</span>
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="quick-actions-bar">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={action.action}
              title={action.label}
            >
              <i className={`bi ${action.icon}`} />
              <span className="quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Left Control Sidebar */}
        <div className="control-sidebar">
          <div className="sidebar-content">
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
                <div className="scenario-buttons">
                  <button
                    className={`btn btn-sm ${
                      selectedScenario === "5g"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } mb-1`}
                    onClick={() => loadScenario("5g")}
                  >
                    <i className="bi bi-wifi me-2"></i>
                    5G Array
                  </button>
                  <button
                    className={`btn btn-sm ${
                      selectedScenario === "ultrasound"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } mb-1`}
                    onClick={() => loadScenario("ultrasound")}
                  >
                    <i className="bi bi-soundwave me-2"></i>
                    Ultrasound
                  </button>
                  <button
                    className={`btn btn-sm ${
                      selectedScenario === "ablation"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => loadScenario("ablation")}
                  >
                    <i className="bi bi-thermometer-high me-2"></i>
                    Ablation
                  </button>
                </div>
              </div>
            </Collapsible>

            {/* Units Configuration */}
            <Collapsible
              open={openSections.units}
              onOpenChange={() => toggleSection("units")}
              trigger={
                <div className="collapsible-header">
                  <i className="bi bi-broadcast collapsible-icon"></i>
                  <span className="collapsible-title">
                    Array Units ({units.length})
                  </span>
                </div>
              }
            >
              <div className="panel-card">
                <div id="unitsContainer">
                  {units.map((unit, index) => (
                    <UnitCard
                      key={index}
                      unit={unit}
                      index={index}
                      onUpdate={updateUnit}
                      onRemove={removeUnit}
                      isProcessing={isProcessing}
                    />
                  ))}
                </div>
                <button
                  className="btn btn-outline-primary w-100 mt-2"
                  onClick={addUnit}
                  disabled={isProcessing || units.length >= 5}
                  title={units.length >= 5 ? "Maximum 5 units allowed" : ""}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Unit
                </button>
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
                  <Label className="switch-label">Show Heatmap</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      if (!checked) setHeatmapData(null);
                    }}
                  />
                </div>
                <div className="switch-group">
                  <Label className="switch-label">Auto Update</Label>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
                <div className="switch-group">
                  <Label className="switch-label">Show Elements</Label>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
              </div>
            </Collapsible>
          </div>

          {/* Action Buttons */}
          <div className="sidebar-footer">
            <button
              onClick={() => requestSimulation()}
              className="btn btn-primary w-100 mb-2 simulate-btn"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="bi bi-circle animate-pulse me-2"></i>
                  Simulating...
                </>
              ) : (
                <>
                  <i className="bi bi-play-fill me-2"></i>
                  Run Simulation
                </>
              )}
            </button>
            <div className="d-flex gap-2">
              <button
                onClick={() => loadScenario("5g")}
                className="btn btn-outline-primary flex-grow-1"
                disabled={isProcessing}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset
              </button>
              <button
                onClick={testApiConnection}
                className="btn btn-outline-secondary"
                title="Test API Connection"
              >
                <i className="bi bi-wifi"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="main-visualization">
          {/* Visualization Grid */}
          <div className="visualization-grid">
            <VisualizationPanel
              title="Beam Pattern (Rectangular)"
              loading={isProcessing}
            >
              <div className="chart-container">
                <canvas ref={beamChartRef} id="beamChart"></canvas>
              </div>
            </VisualizationPanel>

            <VisualizationPanel
              title="Beam Pattern (Polar)"
              loading={isProcessing}
            >
              <div className="chart-container">
                <canvas ref={polarChartRef} id="polarChart"></canvas>
              </div>
            </VisualizationPanel>

            <VisualizationPanel title="Array Geometry" loading={isProcessing}>
              <div className="chart-container">
                <canvas ref={geoChartRef} id="geoChart"></canvas>
              </div>
            </VisualizationPanel>

            <VisualizationPanel
              title="Interference Pattern Heatmap"
              loading={isProcessing}
            >
              <div className="heatmap-container">
                {heatmapData ? (
                  <img
                    src={heatmapData}
                    alt="Beamforming Heatmap"
                    className="heatmap-img"
                    onError={() => setHeatmapData(null)}
                  />
                ) : (
                  <div className="placeholder-content">
                    <i className="bi bi-grid-3x3 placeholder-icon"></i>
                    <span className="placeholder-text">
                      {isProcessing
                        ? "Generating heatmap..."
                        : "Heatmap will appear here"}
                    </span>
                  </div>
                )}
              </div>
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
                {isProcessing ? "Simulating..." : "Ready"}
              </span>
            </div>

            <div className="status-divider" />

            <div className="status-values">
              <div className="status-item">
                <span className="status-label">Units: </span>
                <span className="status-value">{units.length}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Total Elements: </span>
                <span className="status-value">
                  {units.reduce((sum, unit) => sum + unit.elements, 0)}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Frequency: </span>
                <span className="status-value">{units[0]?.frequency} MHz</span>
              </div>
              <div className="status-item">
                <span className="status-label">Scenario: </span>
                <span className="status-value">
                  {selectedScenario.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Beamforming;
