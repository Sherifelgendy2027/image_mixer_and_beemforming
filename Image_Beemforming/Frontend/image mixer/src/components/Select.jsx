import React from "react";

const Select = ({ value, onValueChange, children, triggerClassName = "" }) => {
  return (
    <select
      className={`form-select beamforming-select ${triggerClassName}`}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  );
};

export const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export default Select;
