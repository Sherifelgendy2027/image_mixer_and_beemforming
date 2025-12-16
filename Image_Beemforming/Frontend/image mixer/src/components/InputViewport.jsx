// components/InputViewport.jsx
import React, { useState, useRef, useEffect } from "react";
import { ftComponents } from "./CustomComponents";

export const InputViewport = React.memo(
  ({ index, title, component, onComponentChange, image, onImageLoad }) => {
    const fileInputRef = useRef(null);
    const [localImage, setLocalImage] = useState(null);

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
            };
            setLocalImage(imageData);
            onImageLoad(index, imageData);
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
      } else {
        setLocalImage(null);
      }
    }, [image]);

    const handleSelectChange = (e) => {
      onComponentChange(e.target.value);
    };

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
            <span className="viewport-title">{title}</span>
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
                src={localImage.src}
                alt={`Input ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
                className="viewport-image"
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
