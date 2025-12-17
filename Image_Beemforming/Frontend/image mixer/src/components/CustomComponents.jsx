// components/CustomComponents.jsx
export const Slider = ({
  value,
  onValueChange,
  max = 100,
  step = 1,
  className = "",
  disable = false,
}) => {
  return (
    <input
      type="range"
      className={`form-range custom-slider ${className}`}
      value={value}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      min="0"
      max={max}
      step={step}
      disabled={disable}
    />
  );
};

export const Switch = ({ checked, onCheckedChange, disable=false }) => {
  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input custom-switch"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disable}
      />
    </div>
  );
};

export const Label = ({ children, className = "" }) => {
  return <label className={`form-label ${className}`}>{children}</label>;
};

export const ftComponents = [
  { value: "magnitude", label: "Magnitude" },
  { value: "phase", label: "Phase" },
  { value: "real", label: "Real" },
  { value: "imaginary", label: "Imaginary" },
];
