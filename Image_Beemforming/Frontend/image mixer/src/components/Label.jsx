import React from "react";

const Label = ({ children, className = "" }) => {
  return <label className={`form-label ${className}`}>{children}</label>;
};

export default Label;
