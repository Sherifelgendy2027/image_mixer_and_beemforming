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
  const [loadingStates, setLoadingStates] = useState([false, false, false, false]); // Track upload loading per slot

  // Component Image State (for the right side of the viewport)
  const [componentImages, setComponentImages] = useState([null, null, null, null]);
  const [componentLoadingStates, setComponentLoadingStates] = useState([false, false, false, false]); // Track component fetch loading

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

  // Function to fetch the specific component image
  const fetchComponent = useCallback(async (slotIndex, type) => {
    // Set loading state for this component slot
    setComponentLoadingStates((prev) => {
      const newStates = [...prev];
      newStates[slotIndex - 1] = true;
      return newStates;
    });

    try {
      console.log(`Getting the ${type} component of the image in slot ${slotIndex}`);
      const response = await fetch(`/api/component/${slotIndex}/${type}`);
      if (response.ok) {
        const data = await response.json();
        // data.image_data is expected to be a base64 string
        console.log(`The image data of the ${type} component of the image in slot ${slotIndex}:`, data);
        setComponentImages((prev) => {
          const newImages = [...prev];
          newImages[slotIndex - 1] = data.image_data;
          return newImages;
        });
      } else {
        console.error(`Failed to fetch component ${type} for slot ${slotIndex}`);
        setComponentImages((prev) => {
          const newImages = [...prev];
          newImages[slotIndex - 1] = null;
          return newImages;
        });
      }
    } catch (error) {
      console.error(`Error fetching component for slot ${slotIndex}:`, error);
      setComponentImages((prev) => {
        const newImages = [...prev];
        newImages[slotIndex - 1] = null;
        return newImages;
      });
    } finally {
      // Turn off loading state
      setComponentLoadingStates((prev) => {
        const newStates = [...prev];
        newStates[slotIndex - 1] = false;
        return newStates;
      });
    }
  }, []);

  const handleComponentChange = useCallback((index, value) => {
    setViewportComponents((prev) => {
      const newComponents = [...prev];
      newComponents[index] = value;
      return newComponents;
    });

    // If an image is loaded in this slot, fetch the new component immediately
    if (images[index]) {
      fetchComponent(index + 1, value);
    }
  }, [images, fetchComponent]);

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
  const uploadImage = useCallback(async (file, slotIndex) => {
    // Set loading state for this slot to true
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[slotIndex - 1] = true;
      return newStates;
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log(`Uploading image to slot ${slotIndex}`);
      const response = await fetch(`/api/upload/${slotIndex}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log(`Image uploaded to slot ${slotIndex}:`, data);

      let processedSrc;

      // Option 1: Use the backend's static serving endpoint
      if (data.filepath) {
        const cleanPath = data.filepath.replace(/\\/g, "/");
        processedSrc = `/static/uploads/${cleanPath.split('/').pop()}`;
      }

      // Update state with processed image path
      setImages((prev) => {
        const newImages = [...prev];
        // Ensure the slot still has an image
        if (newImages[slotIndex - 1]) {
          newImages[slotIndex - 1] = {
            ...newImages[slotIndex - 1],
            processedSrc: processedSrc || `/api/uploaded-image/${slotIndex}`
          };
        }
        return newImages;
      });

      // Once uploaded, fetch the currently selected component
      const currentComponentType = viewportComponents[slotIndex - 1];
      await fetchComponent(slotIndex, currentComponentType);

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      // Set loading state for this slot to false
      setLoadingStates(prev => {
        const newStates = [...prev];
        newStates[slotIndex - 1] = false;
        return newStates;
      });
    }
  }, [viewportComponents, fetchComponent]);

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

    // If we are clearing an image (imageData is null/empty but handled by removing),
    // we should also clear the component image.
    // Ideally this logic is handled by setting images to null if appropriate.
    // Here we just ensure component image is cleared if image is reset.
    // Since handleImageLoad is mostly for loading, if we had a remove logic it would be separate.
  }, [uploadImage]);

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
                      isLoading={loadingStates[0]}
                      componentImage={componentImages[0]}
                      isComponentLoading={componentLoadingStates[0]}
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
                      isLoading={loadingStates[1]}
                      componentImage={componentImages[1]}
                      isComponentLoading={componentLoadingStates[1]}
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
                      isLoading={loadingStates[2]}
                      componentImage={componentImages[2]}
                      isComponentLoading={componentLoadingStates[2]}
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
                      isLoading={loadingStates[3]}
                      componentImage={componentImages[3]}
                      isComponentLoading={componentLoadingStates[3]}
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