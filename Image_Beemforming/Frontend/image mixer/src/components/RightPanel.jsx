// components/RightPanel.jsx
import React from "react";
import { Slider, Switch, Label } from "./CustomComponents";

export const RightPanel = React.memo(
  ({
    rightPanelOpen,
    useInnerRegion,
    regionSize,
    realImagValues,
    setUseInnerRegion,
    setRegionSize,
    handleResetRightPanel,
    handleRealImagSliderChange,
    regionEnable,
    setRegionEnable,
  }) => {
    if (!rightPanelOpen) return null;

    return (
      <div className={`right-panel open`}>
        <div className="panel-content">
          {/* Region Mixer - Moved from left panel */}
          <div className="panel-section">
            <div className="region-mixer-header">
                <h3 className="panel-title">Region Mixer</h3>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Label className="panel-label">
                    Enable
                  </Label>
                  <Switch
                    checked={regionEnable}
                    onCheckedChange={setRegionEnable}
                  />
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <Label className="panel-label">
                {useInnerRegion ? "Inner Region" : "Outer Region"}
              </Label>
              <Switch
                checked={useInnerRegion}
                onCheckedChange={setUseInnerRegion}
                disable={!regionEnable}
              />
            </div>

            <div className="slider-group">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Label className="slider-label">Region Size</Label>
                <span className="slider-value">{regionEnable ? regionSize[0] + "%" : "---"}</span>
              </div>
              <Slider
                value={regionSize[0]}
                onValueChange={(v) => setRegionSize(v)}
                max={100}
                step={1}
                disable={!regionEnable}
              />
            </div>

            {/* Reset All Button for Right Panel */}
            <button
                className="btn btn-outline-secondary btn-sm w-100 mt-2 border"
                onClick={handleResetRightPanel}
            >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset All
            </button>
          </div>

          {/* Real / Imaginary Mixer */}
          <div className="panel-section">
            <h3 className="panel-title">
              <i className="bi bi-sliders me-2"></i>
              Real / Imaginary
            </h3>

            <div className="sliders-section">
              {realImagValues.map((value, index) => (
                <div key={index} className="slider-group">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label className="slider-label">
                      {index % 2 === 0
                        ? `Real ${Math.floor(index / 2) + 1}`
                        : `Imag ${Math.floor(index / 2) + 1}`}
                    </Label>
                    <span className="slider-value">{value}%</span>
                  </div>
                  <Slider
                    value={value}
                    onValueChange={(v) => handleRealImagSliderChange(index, v)}
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
