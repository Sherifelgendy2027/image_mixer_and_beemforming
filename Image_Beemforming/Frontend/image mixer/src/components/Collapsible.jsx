import React from "react";

const Collapsible = ({ trigger, children, open = false, onOpenChange }) => {
  return (
    <div className="beamforming-collapsible">
      <button
        className="collapsible-trigger"
        onClick={onOpenChange}
        type="button"
      >
        {trigger}
        <i
          className={`bi bi-chevron-down collapsible-chevron ${
            open ? "open" : ""
          }`}
        ></i>
      </button>
      {open && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default Collapsible;
