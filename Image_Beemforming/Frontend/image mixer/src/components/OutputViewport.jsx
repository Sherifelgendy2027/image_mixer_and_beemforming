// components/OutputViewport.jsx
import React, { useState, useEffect } from "react";

export const OutputViewport = React.memo(
    ({
         label,
         images,
         activeOutput,
         magPhaseValues,
         realImagValues,
         autoMix,
     }) => {
        // Visualization State
        const [brightness, setBrightness] = useState(100);
        const [contrast, setContrast] = useState(100);

        // Output Data State
        const [outputImage, setOutputImage] = useState(null);
        const [isLoading, setIsLoading] = useState(false);

        // Dummy effect to simulate or handle output generation
        // In a full implementation, this would fetch/calculate the mixed image
        useEffect(() => {
            // if (autoMix) { ... logic to fetch mixed result ... }
        }, [images, magPhaseValues, realImagValues, autoMix, activeOutput]);

        // Dynamic Filter Style
        const filterStyle = {
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
        };

        return (
            <div className="viewport-container" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <div className="viewport-header">
                    <div className="d-flex justify-content-center w-100">
                        <span className="viewport-title">{label}</span>
                    </div>
                </div>

                <div className="viewport-content" style={{flex: 1, minHeight: 0}}>
                    {/* Result Image (Spatial) - Left Side */}
                    <div className="viewport-image-container">
                        {isLoading ? (
                            <div className="d-flex align-items-center justify-content-center h-100 w-100">
                                <div className="spinner-grow text-primary spinner-grow-sm" role="status"></div>
                            </div>
                        ) : outputImage ? (
                            <img
                                src={outputImage}
                                alt="Output Result"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    ...filterStyle
                                }}
                            />
                        ) : (
                            <div className="placeholder-content">
                                <i className="bi bi-lightning-charge placeholder-icon"></i>
                                <span className="placeholder-text">Output {activeOutput}</span>
                            </div>
                        )}
                    </div>

                    {/* Result Component/Spectrum - Right Side */}
                    {/* Applying filter here as requested for 'two image displays' */}
                    <div className="viewport-image-container ft-component">
                        <div className="placeholder-content" style={filterStyle}>
                            <i className="bi bi-graph-up placeholder-icon"></i>
                            <span className="placeholder-text">Spectrum</span>
                        </div>
                    </div>
                </div>

                {/* Brightness & Contrast Sliders */}
                <div className="viewport-footer d-flex gap-2 px-2 py-1 align-items-center border-top bg-light" style={{height: '50px'}}>
                    <div className="d-flex flex-column flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                            <label style={{fontSize: '0.65rem', fontWeight: 'bold', marginBottom: 0}}>Brightness</label>
                            <span style={{fontSize: '0.65rem'}}>{brightness}%</span>
                        </div>
                        <input
                            type="range"
                            className="form-range"
                            min="0"
                            max="200"
                            step="5"
                            value={brightness}
                            onChange={(e) => setBrightness(e.target.value)}
                            style={{height: '0.8rem', padding: 0}}
                        />
                    </div>
                    <div className="d-flex flex-column flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                            <label style={{fontSize: '0.65rem', fontWeight: 'bold', marginBottom: 0}}>Contrast</label>
                            <span style={{fontSize: '0.65rem'}}>{contrast}%</span>
                        </div>
                        <input
                            type="range"
                            className="form-range"
                            min="0"
                            max="200"
                            step="5"
                            value={contrast}
                            onChange={(e) => setContrast(e.target.value)}
                            style={{height: '0.8rem', padding: 0}}
                        />
                    </div>
                </div>
            </div>
        );
    }
);