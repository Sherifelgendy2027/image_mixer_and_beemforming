// components/InputViewport.jsx
import React, { useState, useRef, useEffect } from "react";
import { ftComponents } from "./CustomComponents";

export const InputViewport = React.memo(
    ({
         index,
         title,
         component,
         onComponentChange,
         image,
         onImageLoad,
         isLoading,
         componentImage,
         isComponentLoading
     }) => {
        const fileInputRef = useRef(null);
        const [localImage, setLocalImage] = useState(null);
        const [viewMode, setViewMode] = useState("original"); // 'original' | 'processed'

        // Visualization State
        const [brightness, setBrightness] = useState(100);
        const [contrast, setContrast] = useState(100);

        const handleDoubleClick = () => {
            // Prevent file dialog if already loading
            if (!isLoading) {
                fileInputRef.current?.click();
            }
        };

        const handleFileChange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const imageData = {
                            src: event.target?.result,
                            originalWidth: img.width,
                            originalHeight: img.height,
                            file: file, // Pass file object to parent for upload
                        };
                        setLocalImage(imageData);
                        onImageLoad(index, imageData);
                        // Reset to original view when a new file is loaded
                        setViewMode("original");
                    };
                    img.src = event.target?.result;
                };
                reader.readAsDataURL(file);
            }
            e.target.value = "";
        };

        // Update local image when prop changes
        useEffect(() => {
            if (image) {
                setLocalImage(image);
                // If the processed source is removed (e.g. cleared), default back to original
                if (!image.processedSrc) {
                    setViewMode("original");
                }
            } else {
                setLocalImage(null);
                setViewMode("original");
            }
        }, [image]);

        const handleSelectChange = (e) => {
            onComponentChange(e.target.value);
        };

        // Determine which image source to display
        const displaySrc = (viewMode === "processed" && localImage?.processedSrc)
            ? localImage.processedSrc
            : localImage?.src;

        // Dynamic Filter Style
        const filterStyle = { filter: `brightness(${brightness}%) contrast(${contrast}%)` };

        return (
            <div className="viewport-container" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-file-input"
                    disabled={isLoading}
                    style={{display: 'none'}}
                />

                <div className="viewport-header">
                    <div className="viewport-header-left">
                        <div className="viewport-index">
                            <span>{index + 1}</span>
                        </div>
                        <div className="d-flex flex-column justify-content-center">
                            <span className="viewport-title" style={{lineHeight: '1.1'}}>{title}</span>
                            {/* Toggle Switch for Original vs Processed */}
                            {localImage?.processedSrc && !isLoading && (
                                <div className="btn-group btn-group-sm mt-1" role="group" aria-label="Image View Toggle">
                                    <button
                                        type="button"
                                        className={`btn ${viewMode === 'original' ? 'btn-primary' : 'btn-outline-secondary'} py-0 px-1`}
                                        style={{fontSize: '0.65rem', height: '18px'}}
                                        onClick={() => setViewMode('original')}
                                        title="Show Original Uploaded Image"
                                    >
                                        Orig
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${viewMode === 'processed' ? 'btn-primary' : 'btn-outline-secondary'} py-0 px-1`}
                                        style={{fontSize: '0.65rem', height: '18px'}}
                                        onClick={() => setViewMode('processed')}
                                        title="Show Server Processed Image"
                                    >
                                        Proc
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <select
                        className="form-select custom-select w-50"
                        value={component}
                        onChange={handleSelectChange}
                    >
                        {ftComponents.map((comp) => (
                            <option key={comp.value} value={comp.value}>
                                {comp.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="viewport-content" style={{flex: 1, minHeight: 0}}>
                    {/* Original Image - Left Side */}
                    <div
                        className={`viewport-image-container image-placeholder ${isLoading ? 'cursor-wait' : ''}`}
                        onDoubleClick={handleDoubleClick}
                        title={isLoading ? "Uploading..." : "Double-click to load/replace image"}
                    >
                        {isLoading ? (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 bg-light bg-opacity-75" style={{zIndex: 10}}>
                                <div className="spinner-border text-primary mb-2" role="status" style={{width: '2rem', height: '2rem'}}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span className="text-muted small fw-bold">Processing...</span>
                            </div>
                        ) : localImage ? (
                            <img
                                src={displaySrc}
                                alt={`Input ${index + 1}`}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    ...filterStyle
                                }}
                                className="viewport-image"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    console.error("Failed to load image:", displaySrc);
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="placeholder-content">
                                <i className="bi bi-image placeholder-icon"></i>
                                <span className="placeholder-text">Double-click to load</span>
                            </div>
                        )}
                    </div>

                    {/* FT Component - Right Side */}
                    <div className="viewport-image-container ft-component">
                        {isComponentLoading ? (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100">
                                <div className="spinner-grow text-secondary spinner-grow-sm mb-1" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span style={{fontSize: '0.7rem', color: '#6c757d'}}>Fetching...</span>
                            </div>
                        ) : componentImage ? (
                            <img
                                src={`data:image/png;base64,${componentImage}`}
                                alt={`${component} view`}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    ...filterStyle
                                }}
                                className="viewport-image"
                            />
                        ) : localImage ? (
                            <div
                                className="ft-component-content"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    ...filterStyle
                                }}
                            >
                                <div className="ft-component-placeholder">
                                    <i className="bi bi-layers placeholder-icon"></i>
                                    <span className="ft-component-text">{component}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="placeholder-content">
                                <i className="bi bi-layers placeholder-icon"></i>
                                <span className="placeholder-text">FT {component}</span>
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
    }
);