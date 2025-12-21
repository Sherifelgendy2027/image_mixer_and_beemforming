// Default unit configuration
export const defaultUnit = {
  elements: 16,
  spacing: 0.5,
  frequency: 300,
  steering: 0,
  type: "linear",
  curvature: 1.0,
  x_pos: 0,
  y_pos: 0,
};

// Scenarios
export const scenarios = {
  "5g": [
    {
      ...defaultUnit,
      elements: 16,
      frequency: 28000,
      spacing: 0.5,
      type: "linear",
    },
  ],
  ultrasound: [
    {
      ...defaultUnit,
      elements: 64,
      frequency: 5,
      spacing: 0.5,
      type: "curved",
      curvature: 1.5,
    },
  ],
  ablation: [
    { ...defaultUnit, elements: 1, frequency: 915, x_pos: -2, y_pos: 0 },
    { ...defaultUnit, elements: 1, frequency: 915, x_pos: 2, y_pos: 0 },
  ],
};
