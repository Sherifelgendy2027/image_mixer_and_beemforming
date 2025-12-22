import React, { useState } from "react";

export const OutputViewport = React.memo(({
                                              label,
                                              outputImage,
                                              isActive,
                                              isProcessing
                                          }) => {
    // Visualization State
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);

    const filterStyle = { filter: `brightness(${brightness}%) contrast(${contrast}%)` };

    // Robustly handle the image source
    // Checks if the backend already included the header, otherwise adds it.
    const imgSrc = outputImage
        ? (outputImage.startsWith('data:image') ? outputImage : `data:image/png;base64,${outputImage}`)
        : null;

    return (
        <div className={`viewport-container ${isActive ? 'border-primary' : ''}`} style={{display: 'flex', flexDirection: 'column', height: '100%', borderWidth: isActive ? '2px' : '1px'}}>
            <div className={`viewport-header ${isActive ? 'bg-primary bg-opacity-10' : ''}`}>
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex align-items-center gap-2">
                        <i className={`bi bi-bullseye ${isActive ? 'text-primary' : 'text-muted'}`}></i>
                        <span className={`viewport-title ${isActive ? 'text-primary fw-bold' : ''}`}>{label}</span>
                    </div>
                    {/* Loader removed from header */}
                </div>
            </div>

            <div className="viewport-content d-flex justify-content-center align-items-center" style={{flex: 1, minHeight: 0, padding: 0}}>
                <div className="viewport-image-container w-100 h-100 bg-white" style={{borderRadius: 0, border: 'none', position: 'relative'}}>

                    {/* Processing Overlay in Image Container */}
                    {isProcessing && (
                        <div
                            className="d-flex flex-column align-items-center justify-content-center"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 10,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(2px)'
                            }}
                        >
                            <div className="spinner-border text-primary" role="status" style={{width: '2.5rem', height: '2.5rem'}}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="mt-2 text-primary fw-bold small">Processing...</span>
                        </div>
                    )}

                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={label}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                ...filterStyle
                            }}
                            className="viewport-image"
                            onError={(e) => {
                                console.error("Output image failed to load. Source snippet:", imgSrc.substring(0, 50));
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="placeholder-content">
                            <i className="bi bi-image placeholder-icon"></i>
                            <span className="placeholder-text">Output will appear here</span>
                        </div>
                    )}
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
});