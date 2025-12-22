import React, { useState, useCallback, useEffect } from "react";
import "../styles/FTMixer.css";

// Import components
import { InputViewport } from "../src/components/InputViewport";
import { OutputViewport } from "../src/components/OutputViewport";
import { LeftPanel } from "../src/components/LeftPanel";

// Main FTMixer component
function FTMixer() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [activeOutput, setActiveOutput] = useState("A");
  const [autoMix, setAutoMix] = useState(false);

  // Mix Mode State: 'magnitude_phase' | 'real_imaginary'
  const [mixMode, setMixMode] = useState('magnitude_phase');

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

  // Region State
  const [useInnerRegion, setUseInnerRegion] = useState(true);
  const [regionSize, setRegionSize] = useState([50]); // Keeps track of slider value
  const [regionEnable, setRegionEnable] = useState(false); // Default disabled

  // Unified Region Rect State (Normalized 0-1)
  const [regionRect, setRegionRect] = useState({ x: 0.25, y: 0.25, w: 0.5, h: 0.5 });

  // Image state
  const [images, setImages] = useState([null, null, null, null]);
  const [loadingStates, setLoadingStates] = useState([false, false, false, false]);

  // Component Image State
  const [componentImages, setComponentImages] = useState([null, null, null, null]);
  const [componentLoadingStates, setComponentLoadingStates] = useState([false, false, false, false]);

  const [unifiedSize, setUnifiedSize] = useState(null);

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
    setComponentLoadingStates((prev) => {
      const newStates = [...prev];
      newStates[slotIndex - 1] = true;
      return newStates;
    });

    try {
      const response = await fetch(`/api/component/${slotIndex}/${type}`);
      if (response.ok) {
        const data = await response.json();
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
      setComponentLoadingStates((prev) => {
        const newStates = [...prev];
        newStates[slotIndex - 1] = false;
        return newStates;
      });
    }
  }, []);

  // Effect to enforce valid components when Region Mixer is enabled
  useEffect(() => {
    if (!regionEnable) return;

    // Calculate what the components *should* be
    const nextComponents = viewportComponents.map((comp) => {
      if (mixMode === 'magnitude_phase') {
        if (comp === 'real' || comp === 'imaginary') return 'magnitude';
      } else if (mixMode === 'real_imaginary') {
        if (comp === 'magnitude' || comp === 'phase') return 'real';
      }
      return comp;
    });

    // Check if any change is needed
    const isDifferent = nextComponents.some((comp, i) => comp !== viewportComponents[i]);

    if (isDifferent) {
      // Update state
      setViewportComponents(nextComponents);

      // Trigger fetches for changed components if an image exists in that slot
      nextComponents.forEach((comp, index) => {
        if (comp !== viewportComponents[index] && images[index]) {
          fetchComponent(index + 1, comp);
        }
      });
    }
  }, [mixMode, regionEnable, viewportComponents, images, fetchComponent]);

  // Handle Region Slider Change
  // SCALES region relative to its current center
  const handleRegionSliderChange = useCallback((value) => {
    const sizePercent = value[0];
    setRegionSize(value); // Update slider UI

    setRegionRect((currentRect) => {
      const newSize = sizePercent / 100;

      // Calculate current center
      const cx = currentRect.x + currentRect.w / 2;
      const cy = currentRect.y + currentRect.h / 2;

      // Calculate new top-left based on center and new size
      let newX = cx - newSize / 2;
      let newY = cy - newSize / 2;

      // Clamp to bounds to ensure it stays inside [0,1]
      // Max possible x is 1 - newSize, min is 0
      newX = Math.max(0, Math.min(newX, 1 - newSize));
      newY = Math.max(0, Math.min(newY, 1 - newSize));

      return {
        x: newX,
        y: newY,
        w: newSize,
        h: newSize
      };
    });
  }, []);

  // Handle Manual Region Interaction (Drag/Resize)
  const handleRegionManualChange = useCallback((newRect) => {
    setRegionRect(newRect);
    // Update slider to match the max dimension of the new rect roughly
    const maxDim = Math.max(newRect.w, newRect.h);
    setRegionSize([Math.round(maxDim * 100)]);
  }, []);

  const handleComponentChange = useCallback((index, value) => {
    setViewportComponents((prev) => {
      const newComponents = [...prev];
      newComponents[index] = value;
      return newComponents;
    });

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

  const uploadImage = useCallback(async (file, slotIndex) => {
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[slotIndex - 1] = true;
      return newStates;
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/upload/${slotIndex}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      let processedSrc;

      if (data.filepath) {
        const cleanPath = data.filepath.replace(/\\/g, "/");
        processedSrc = `/static/uploads/${cleanPath.split('/').pop()}`;
      }

      setImages((prev) => {
        const newImages = [...prev];
        if (newImages[slotIndex - 1]) {
          newImages[slotIndex - 1] = {
            ...newImages[slotIndex - 1],
            processedSrc: processedSrc || `/api/uploaded-image/${slotIndex}`
          };
        }
        return newImages;
      });

      const currentComponentType = viewportComponents[slotIndex - 1];
      await fetchComponent(slotIndex, currentComponentType);

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoadingStates(prev => {
        const newStates = [...prev];
        newStates[slotIndex - 1] = false;
        return newStates;
      });
    }
  }, [viewportComponents, fetchComponent]);

  const handleImageLoad = useCallback((index, imageData) => {
    if (imageData && imageData.file) {
      uploadImage(imageData.file, index + 1);
    }

    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = imageData;
      return newImages;
    });
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
                  file: file,
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

  const handleResetMagPhase = useCallback(() => {
    setMagPhaseValues([50, 50, 50, 50, 50, 50, 50, 50]);
  }, []);

  const handleResetRealImag = useCallback(() => {
    setRealImagValues([50, 50, 50, 50, 50, 50, 50, 50]);
    setRegionSize([50]);
    setRegionRect({ x: 0.25, y: 0.25, w: 0.5, h: 0.5 });
  }, []);

  return (
      <div className="ft-mixer-page">
        <div className="ft-mixer-layout">
          {/* Left Control Panel */}
          <LeftPanel
              leftPanelOpen={leftPanelOpen}
              images={images}
              handleImageReplace={handleImageReplace}

              // Mix Mode Props
              mixMode={mixMode}
              setMixMode={setMixMode}

              // Mag/Phase Props
              magPhaseValues={magPhaseValues}
              handleMagPhaseSliderChange={handleMagPhaseSliderChange}
              handleResetMagPhase={handleResetMagPhase}

              // Real/Imag Props
              realImagValues={realImagValues}
              handleRealImagSliderChange={handleRealImagSliderChange}
              handleResetRealImag={handleResetRealImag}

              // Region Props
              useInnerRegion={useInnerRegion}
              regionSize={regionSize}
              setUseInnerRegion={setUseInnerRegion}
              setRegionSize={handleRegionSliderChange}
              regionEnable={regionEnable}
              setRegionEnable={setRegionEnable}
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
                  className={`btn btn-smQB border ${
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
                      // Region Props
                      regionEnable={regionEnable}
                      regionRect={regionRect}
                      onRegionChange={handleRegionManualChange}
                      useInnerRegion={useInnerRegion}
                      // Disable logic
                      mixMode={mixMode}
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
                      // Region Props
                      regionEnable={regionEnable}
                      regionRect={regionRect}
                      onRegionChange={handleRegionManualChange}
                      useInnerRegion={useInnerRegion}
                      // Disable logic
                      mixMode={mixMode}
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
                      // Region Props
                      regionEnable={regionEnable}
                      regionRect={regionRect}
                      onRegionChange={handleRegionManualChange}
                      useInnerRegion={useInnerRegion}
                      // Disable logic
                      mixMode={mixMode}
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
                      // Region Props
                      regionEnable={regionEnable}
                      regionRect={regionRect}
                      onRegionChange={handleRegionManualChange}
                      useInnerRegion={useInnerRegion}
                      // Disable logic
                      mixMode={mixMode}
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
        </div>
      </div>
  );
}

export default FTMixer;