import React from "react";

const Switch = ({ checked, onCheckedChange }) => {
  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input beamforming-switch"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
    </div>
  );
};

export default Switch;
