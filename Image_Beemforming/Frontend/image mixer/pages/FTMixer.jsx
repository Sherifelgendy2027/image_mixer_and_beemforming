import React, { useState, useCallback, useEffect } from "react";
import "../styles/FTMixer.css";

// Import components
import { InputViewport } from "../src/components/InputViewport";
import { OutputViewport } from "../src/components/OutputViewport";
import { LeftPanel } from "../src/components/LeftPanel";
import { RightPanel } from "../src/components/RightPanel";

// Removed BASE_IMAGE_PATH - we'll use a different approach
// const BASE_IMAGE_PATH = "../../../../Backend";

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

  // Upload function - Modified to use a URL that Vite can serve
  const uploadImage = async (file, slotIndex) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/upload/${slotIndex}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log(`Image uploaded to slot ${slotIndex}:`, data);

      // Instead of using a relative path, we'll use an absolute URL
      // that points to where the backend serves static files
      let processedSrc;

      // Option 1: Use the backend's static serving endpoint
      if (data.filepath) {
        const cleanPath = data.filepath.replace(/\\/g, "/");
        // Assuming your backend serves static files at /static/uploads/
        processedSrc = `/static/uploads/${cleanPath.split('/').pop()}`;

        // Or if you have a proxy set up to forward /api/uploads to your backend:
        // processedSrc = `/api/uploads/${cleanPath.split('/').pop()}`;
      }

      // Option 2: Or use a direct URL to the uploaded file
      // processedSrc = `/api/uploaded-image/${slotIndex}`;

      // Update state with processed image path
      setImages((prev) => {
        const newImages = [...prev];
        // Ensure the slot still has an image (user hasn't cleared it while uploading)
        if (newImages[slotIndex - 1]) {
          newImages[slotIndex - 1] = {
            ...newImages[slotIndex - 1],
            // Store a URL that can be served by the backend
            processedSrc: processedSrc || `/api/uploaded-image/${slotIndex}`
          };
        }
        return newImages;
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleImageLoad = useCallback((index, imageData) => {
    // Trigger upload if file object is present
    if (imageData && imageData.file) {
      uploadImage(imageData.file, index + 1); // API expects 1-based index (1-4)
    }

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
                  file: file, // Pass file object for upload
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