import React from "react";

function VisualizationPanel({ title, children }) {
  return (
    <div className="beamforming-viz-panel">
      <div className="viz-panel-header">
        <span className="viz-panel-title">{title}</span>
      </div>
      <div className="viz-panel-content">{children}</div>
    </div>
  );
}

export default VisualizationPanel;
