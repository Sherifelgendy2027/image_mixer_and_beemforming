import React, { useState, useCallback, useEffect } from "react";
import "../styles/FTMixer.css";

// Import components
import { InputViewport } from "../src/components/InputViewport";
import { OutputViewport } from "../src/components/OutputViewport";
import { LeftPanel } from "../src/components/LeftPanel";
import { RightPanel } from "../src/components/RightPanel";

// Main FTMixer component
function FTMixer() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeOutput, setActiveOutput] = useState("A");
  const [autoMix, setAutoMix] = useState(false);
  const [viewportComponents, setViewportComponents] = useState([
    "magnitude",
    "magnitude",
    "magnitude",
    "magnitude",
  ]);
  const [magPhaseValues, setMagPhaseValues] = useState([
    50, 50, 50, 50, 50, 50, 50, 50,
  ]);
  const [realImagValues, setRealImagValues] = useState([
    50, 50, 50, 50, 50, 50, 50, 50,
  ]);
  const [useInnerRegion, setUseInnerRegion] = useState(true);
  const [regionSize, setRegionSize] = useState([50]);

  // Image state
  const [images, setImages] = useState([null, null, null, null]);
  const [unifiedSize, setUnifiedSize] = useState(null);

  const [regionEnable, setRegionEnable] = useState(true);

  // Calculate unified size whenever images change
  useEffect(() => {
    const loadedImages = images.filter((img) => img !== null);
    if (loadedImages.length === 0) {
      setUnifiedSize(null);
      return;
    }

    const minWidth = Math.min(...loadedImages.map((img) => img.originalWidth));
    const minHeight = Math.min(
      ...loadedImages.map((img) => img.originalHeight)
    );
    setUnifiedSize({ width: minWidth, height: minHeight });
  }, [images]);

  const handleComponentChange = useCallback((index, value) => {
    setViewportComponents((prev) => {
      const newComponents = [...prev];
      newComponents[index] = value;
      return newComponents;
    });
  }, []);

  const handleMagPhaseSliderChange = useCallback((index, value) => {
    setMagPhaseValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value[0];
      return newValues;
    });
  }, []);

  const handleRealImagSliderChange = useCallback((index, value) => {
    setRealImagValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value[0];
      return newValues;
    });
  }, []);

  const handleImageLoad = useCallback((index, imageData) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = imageData;
      return newImages;
    });
  }, []);

  const handleImageReplace = useCallback(
    (index) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              handleImageLoad(index, {
                src: event.target?.result,
                originalWidth: img.width,
                originalHeight: img.height,
              });
            };
            img.src = event.target?.result;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },
    [handleImageLoad]
  );

  const handleResetAll = useCallback(() => {
    setMagPhaseValues([50, 50, 50, 50, 50, 50, 50, 50]);
  }, []);

  const handleResetRightPanel = useCallback(() => {
    setRealImagValues([50, 50, 50, 50, 50, 50, 50, 50]);
    setRegionSize([50]);
  }, []);

  return (
    <div className="ft-mixer-page">
      <div className="ft-mixer-layout">
        {/* Left Control Panel */}
        <LeftPanel
          leftPanelOpen={leftPanelOpen}
          images={images}
          magPhaseValues={magPhaseValues}
          handleImageReplace={handleImageReplace}
          handleResetAll={handleResetAll}
          handleMagPhaseSliderChange={handleMagPhaseSliderChange}
        />

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
                className={`btn btn-sm p-1 ${
                  activeOutput === "A" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveOutput("A")}
              >
                Output A
              </button>
              <button
                className={`btn btn-sm p-1 ${
                  activeOutput === "B" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveOutput("B")}
              >
                Output B
              </button>
            </div>
            <div className="flex-grow-1 d-flex justify-content-center">
              {unifiedSize && (
                <p className="unified-size-info">
                  Unified size: {unifiedSize.width} × {unifiedSize.height}px
                </p>
              )}
            </div>
            {/* Auto Mix Toggle Button */}
            <button
              className={`btn btn-sm border ${
                autoMix ? "btn-success" : "btn-outline-secondary"
              }`}
              onClick={() => setAutoMix(!autoMix)}
            >
              <i
                className={`bi ${
                  autoMix ? "bi-toggle-on" : "bi-toggle-off"
                } me-2`}
              ></i>
              Auto Mix {autoMix ? "ON" : "OFF"}
            </button>
          </div>

          {/* Viewports Grid */}
          <div className="workspace-content">
            <div className="viewport-grid">
              {/* Row 1: Input 1, Input 2, Output A */}
              <div className="viewport-row">
                <InputViewport
                  index={0}
                  title="Input 1"
                  component={viewportComponents[0]}
                  onComponentChange={(v) => handleComponentChange(0, v)}
                  image={images[0]}
                  unifiedSize={unifiedSize}
                  onImageLoad={handleImageLoad}
                  onImageReplace={handleImageReplace}
                />
                <InputViewport
                  index={1}
                  title="Input 2"
                  component={viewportComponents[1]}
                  onComponentChange={(v) => handleComponentChange(1, v)}
                  image={images[1]}
                  unifiedSize={unifiedSize}
                  onImageLoad={handleImageLoad}
                  onImageReplace={handleImageReplace}
                />
                <OutputViewport
                  label="Output A"
                  images={images}
                  activeOutput={activeOutput}
                  magPhaseValues={magPhaseValues}
                  realImagValues={realImagValues}
                  autoMix={autoMix && activeOutput === "A"}
                />
              </div>

              {/* Row 2: Input 3, Input 4, Output B */}
              <div className="viewport-row">
                <InputViewport
                  index={2}
                  title="Input 3"
                  component={viewportComponents[2]}
                  onComponentChange={(v) => handleComponentChange(2, v)}
                  image={images[2]}
                  unifiedSize={unifiedSize}
                  onImageLoad={handleImageLoad}
                  onImageReplace={handleImageReplace}
                />
                <InputViewport
                  index={3}
                  title="Input 4"
                  component={viewportComponents[3]}
                  onComponentChange={(v) => handleComponentChange(3, v)}
                  image={images[3]}
                  unifiedSize={unifiedSize}
                  onImageLoad={handleImageLoad}
                  onImageReplace={handleImageReplace}
                />
                <OutputViewport
                  label="Output B"
                  images={images}
                  activeOutput={activeOutput}
                  magPhaseValues={magPhaseValues}
                  realImagValues={realImagValues}
                  autoMix={autoMix && activeOutput === "B"}
                />
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

        {/* Right Information Panel - Updated with Region Mixer and Real/Imaginary */}
        <RightPanel
          rightPanelOpen={rightPanelOpen}
          useInnerRegion={useInnerRegion}
          regionSize={regionSize}
          realImagValues={realImagValues}
          setUseInnerRegion={setUseInnerRegion}
          setRegionSize={setRegionSize}
          handleResetRightPanel={handleResetRightPanel}
          handleRealImagSliderChange={handleRealImagSliderChange}
          regionEnable={regionEnable}
          setRegionEnable={setRegionEnable}
        />
      </div>
    </div>
  );
}

export default FTMixer;
