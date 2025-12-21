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
import { simulateBeamforming } from "../src/utils/beamforming";

function Beamforming() {
  const [units, setUnits] = useState([{ ...defaultUnit }]);
  const [selectedScenario, setSelectedScenario] = useState("5g");
  const [isProcessing, setIsProcessing] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null);

  // Chart refs
  const beamChartRef = useRef(null);
  const polarChartRef = useRef(null);
  const geoChartRef = useRef(null);

  // Chart instances refs
  const beamChartInstance = useRef(null);
  const polarChartInstance = useRef(null);
  const geoChartInstance = useRef(null);

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
            labels: [],
            datasets: [
              {
                label: "Gain (dB)",
                data: [],
                borderColor: "#4fa08b",
                borderWidth: 2,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: "Angle (deg)", color: "#aaa" },
                ticks: { color: "#aaa" },
              },
              y: {
                title: { display: true, text: "Magnitude (dB)", color: "#aaa" },
                min: -60,
                max: 0,
                ticks: { color: "#aaa" },
              },
            },
            plugins: { legend: { display: false } },
          },
        });
      }

      // 2. Polar Chart
      if (polarChartRef.current) {
        const polarCtx = polarChartRef.current.getContext("2d");
        polarChartInstance.current = new Chart(polarCtx, {
          type: "radar",
          data: {
            labels: [],
            datasets: [
              {
                label: "Gain (dB)",
                data: [],
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
                angleLines: { color: "#333" },
                grid: { color: "#333" },
                pointLabels: { display: false },
                suggestedMin: -60,
                suggestedMax: 0,
                ticks: { display: false },
              },
            },
            plugins: { legend: { display: false } },
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
                label: "Elements",
                data: [],
                backgroundColor: "#4fa08b",
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
                title: { display: true, text: "X (m)", color: "#aaa" },
                ticks: { color: "#aaa" },
              },
              y: {
                title: { display: true, text: "Y (m)", color: "#aaa" },
                ticks: { color: "#aaa" },
              },
            },
            plugins: { legend: { display: false } },
          },
        });
      }
    };

    initCharts();

    // Cleanup on unmount
    return () => {
      if (beamChartInstance.current) {
        beamChartInstance.current.destroy();
        beamChartInstance.current = null;
      }
      if (polarChartInstance.current) {
        polarChartInstance.current.destroy();
        polarChartInstance.current = null;
      }
      if (geoChartInstance.current) {
        geoChartInstance.current.destroy();
        geoChartInstance.current = null;
      }
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
      newUnits[index][key] = parseFloat(value);
    }

    setUnits(newUnits);
    requestSimulation(newUnits);
  };

  // Request simulation
  const requestSimulation = async (unitsToSimulate = units) => {
    setIsProcessing(true);
    const payload = { arrays: unitsToSimulate };

    try {
      const mockResponse = await simulateBeamforming(payload);

      // Update heatmap
      if (mockResponse.heatmap) {
        setHeatmapData(mockResponse.heatmap);
      }

      // Update rectangular chart
      if (beamChartInstance.current && mockResponse.beam_angles) {
        beamChartInstance.current.data.labels = mockResponse.beam_angles.map(
          (a) => Math.round(a)
        );
        beamChartInstance.current.data.datasets[0].data =
          mockResponse.beam_values;
        beamChartInstance.current.update("none");
      }

      // Update polar chart
      if (polarChartInstance.current && mockResponse.beam_angles) {
        const polarData = new Array(360).fill(-60);
        const polarLabels = new Array(360).fill("");

        mockResponse.beam_angles.forEach((angle, i) => {
          let idx = Math.round(angle);
          if (idx < 0) idx += 360;
          if (idx >= 0 && idx < 360) {
            polarData[idx] = mockResponse.beam_values[i];
          }
        });

        polarChartInstance.current.data.labels = polarLabels;
        polarChartInstance.current.data.datasets[0].data = polarData;
        polarChartInstance.current.update("none");
      }

      // Update geometry chart
      if (geoChartInstance.current && mockResponse.geometry_x) {
        const points = mockResponse.geometry_x.map((x, i) => ({
          x: x,
          y: mockResponse.geometry_y[i],
        }));
        geoChartInstance.current.data.datasets[0].data = points;
        geoChartInstance.current.update();
      }
    } catch (error) {
      console.error("Simulation error:", error);
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

  return (
    <div className="beamforming-page">
      <div className="beamforming-layout">
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
                    />
                  ))}
                </div>
                <button
                  className="btn btn-outline-primary w-100 mt-2"
                  onClick={addUnit}
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
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
                <div className="switch-group">
                  <Label className="switch-label">Auto Update</Label>
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
            <button
              onClick={() => loadScenario("5g")}
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
            <VisualizationPanel title="Beam Pattern (Rectangular)">
              <div className="chart-container">
                <canvas ref={beamChartRef} id="beamChart"></canvas>
              </div>
            </VisualizationPanel>

            <VisualizationPanel title="Beam Pattern (Polar)">
              <div className="chart-container">
                <canvas ref={polarChartRef} id="polarChart"></canvas>
              </div>
            </VisualizationPanel>

            <VisualizationPanel title="Array Geometry">
              <div className="chart-container">
                <canvas ref={geoChartRef} id="geoChart"></canvas>
              </div>
            </VisualizationPanel>

            <VisualizationPanel title="Heatmap">
              <div className="heatmap-container">
                {heatmapData ? (
                  <img
                    src={heatmapData}
                    alt="Beamforming Heatmap"
                    className="heatmap-img"
                  />
                ) : (
                  <div className="placeholder-content">
                    <i className="bi bi-grid-3x3 placeholder-icon"></i>
                    <span className="placeholder-text">
                      Heatmap will appear here
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
