import React from "react";

const Input = ({
  value,
  onChange,
  type = "number",
  className = "",
  placeholder = "",
}) => {
  return (
    <input
      type={type}
      className={`form-control ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default Input;
