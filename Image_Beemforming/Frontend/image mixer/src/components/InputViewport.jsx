// components/InputViewport.jsx
import React, { useState, useRef, useEffect } from "react";
import { ftComponents } from "./CustomComponents";

export const InputViewport = React.memo(
    ({ index, title, component, onComponentChange, image, onImageLoad }) => {
        const fileInputRef = useRef(null);
        const [localImage, setLocalImage] = useState(null);
        const [viewMode, setViewMode] = useState("original"); // 'original' | 'processed'

        const handleDoubleClick = () => {
            fileInputRef.current?.click();
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

        console.log("displaySrc: " + displaySrc);

        return (
            <div className="viewport-container">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-file-input"
                />

                <div className="viewport-header">
                    <div className="viewport-header-left">
                        <div className="viewport-index">
                            <span>{index + 1}</span>
                        </div>
                        <div className="d-flex flex-column justify-content-center">
                            <span className="viewport-title" style={{lineHeight: '1.1'}}>{title}</span>
                            {/* Toggle Switch for Original vs Processed */}
                            {localImage?.processedSrc && (
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

                <div className="viewport-content">
                    {/* Original Image - Left Side */}
                    <div
                        className="viewport-image-container image-placeholder"
                        onDoubleClick={handleDoubleClick}
                        title="Double-click to load/replace image"
                    >
                        {localImage ? (
                            <img
                                src={displaySrc}
                                alt={`Input ${index + 1}`}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                                className="viewport-image"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    console.error("Failed to load image:", displaySrc);
                                    e.target.style.display = 'none';
                                    // Optionally show a placeholder or error message
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
                        {localImage ? (
                            <div
                                className="ft-component-content"
                                style={{
                                    width: "100%",
                                    height: "100%",
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
            </div>
        );
    }
);