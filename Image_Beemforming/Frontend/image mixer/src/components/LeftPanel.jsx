// components/LeftPanel.jsx
import React from "react";
import { Slider, Label } from "./CustomComponents";

export const LeftPanel = React.memo(
  ({
    leftPanelOpen,
    images,
    magPhaseValues,
    handleImageReplace,
    handleResetAll,
    handleMagPhaseSliderChange,
  }) => {
    if (!leftPanelOpen) return null;

    return (
      <div className={`left-panel open`}>
        <div className="panel-content">
          {/* Image Management */}
          <div className="panel-section d-flex flex-column align-items-center justify-content-between">
            <h3 className="panel-title">
              <i className="bi bi-upload me-2"></i>
              Image Management
            </h3>
            <div className="image-buttons">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  className="btn btn-outline-primary btn-sm image-btn p-0 "
                  onClick={() => handleImageReplace(index)}
                >
                  {images[index]
                    ? `Replace ${index + 1}`
                    : `Load Image ${index + 1}`}
                </button>
              ))}
            </div>
            <button
              className="btn btn-outline-secondary btn-sm w-100 mt-2 border"
              onClick={handleResetAll}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reset All
            </button>
          </div>

          {/* Magnitude / Phase Mixer - Fixed (no toggle) */}
          <div className="panel-section">
            <h3 className="panel-title">
              <i className="bi bi-sliders me-2"></i>
              Magnitude / Phase
            </h3>

            <div className="sliders-section">
              {magPhaseValues.map((value, index) => (
                <div key={index} className="slider-group">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Label className="slider-label">
                      {index % 2 === 0
                        ? `Mag ${Math.floor(index / 2) + 1}`
                        : `Phase ${Math.floor(index / 2) + 1}`}
                    </Label>
                    <span className="slider-value">{value}%</span>
                  </div>
                  <Slider
                    value={value}
                    onValueChange={(v) => handleMagPhaseSliderChange(index, v)}
                    max={100}
                    step={1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
