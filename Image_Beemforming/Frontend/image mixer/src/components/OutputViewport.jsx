// components/OutputViewport.jsx
import React, { useState, useEffect } from "react";
import { calculateMixedImage } from "../utils/imageMixing";

export const OutputViewport = React.memo(
  ({
    label,
    images,
    activeOutput,
    magPhaseValues,
    realImagValues,
    autoMix,
  }) => {
    const [mixedResult, setMixedResult] = useState(null);

    useEffect(() => {
      const result = calculateMixedImage(
        images,
        magPhaseValues,
        realImagValues,
        activeOutput === label.split(" ")[1]
      );
      setMixedResult(result);
    }, [images, magPhaseValues, realImagValues, activeOutput, label]);

    const hasImages = images.some((img) => img);
    const isActiveOutput = activeOutput === label.split(" ")[1];

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
            {hasImages ? (
              <>
                <i className="bi bi-layers-half placeholder-icon-large"></i>
                <span className="placeholder-text">
                  {isActiveOutput ? "Active Mix" : "Inactive Mix"}
                </span>
                <div className="output-mix-info">
                  <p className="output-mix-detail">
                    Images: {images.filter((img) => img).length}/4
                  </p>
                  {mixedResult && (
                    <>
                      <p className="output-mix-detail">
                        Mix Intensity: {mixedResult.intensity}%
                      </p>
                      <div className="output-progress">
                        <div
                          className="output-progress-bar"
                          style={{ width: `${mixedResult.intensity}%` }}
                        ></div>
                      </div>
                      {autoMix && isActiveOutput && (
                        <p className="output-mix-detail text-success mt-2">
                          <i className="bi bi-lightning-charge me-1"></i>
                          Auto Mix Active
                        </p>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <i className="bi bi-image placeholder-icon-large"></i>
                <span className="placeholder-text">Mixed Output</span>
                <p className="placeholder-subtext">
                  Load images and adjust sliders
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);
