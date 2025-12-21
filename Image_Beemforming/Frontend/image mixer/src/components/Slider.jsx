const Slider = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}) => {
  return (
    <input
      type="range"
      className={`form-range beamforming-slider ${className}`}
      value={value}
      onChange={(e) => onValueChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
    />
  );
};

export default Slider;
