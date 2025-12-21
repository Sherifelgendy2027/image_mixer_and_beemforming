// Mock simulation function (replace with actual API call)
export const simulateBeamforming = async (payload) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock data based on units
  const beamAngles = Array.from({ length: 181 }, (_, i) => i - 90);
  const beamValues = beamAngles.map((angle) => {
    let gain = -60;
    payload.arrays.forEach((unit) => {
      const steeringEffect = Math.exp(
        -Math.pow(angle - unit.steering, 2) / 100
      );
      const elementEffect = Math.log10(unit.elements) * 3;
      const spacingEffect = Math.sin(
        unit.spacing * Math.PI * Math.sin((angle * Math.PI) / 180)
      );
      const unitGain = Math.max(
        -60,
        10 *
          Math.log10(
            Math.abs(steeringEffect * elementEffect * spacingEffect + 0.01)
          )
      );
      gain = Math.max(gain, unitGain);
    });
    return gain;
  });

  // Generate geometry points
  const geometry_x = [];
  const geometry_y = [];
  payload.arrays.forEach((unit) => {
    if (unit.type === "linear") {
      for (let i = 0; i < unit.elements; i++) {
        const offset = (i - (unit.elements - 1) / 2) * unit.spacing;
        geometry_x.push(unit.x_pos + offset);
        geometry_y.push(unit.y_pos);
      }
    } else if (unit.type === "curved") {
      for (let i = 0; i < unit.elements; i++) {
        const angle =
          ((i - (unit.elements - 1) / 2) * unit.curvature) / unit.elements;
        geometry_x.push(unit.x_pos + Math.cos(angle) * 2);
        geometry_y.push(unit.y_pos + Math.sin(angle) * 2);
      }
    } else {
      // Single element
      geometry_x.push(unit.x_pos);
      geometry_y.push(unit.y_pos);
    }
  });

  return {
    beam_angles: beamAngles,
    beam_values: beamValues,
    geometry_x: geometry_x,
    geometry_y: geometry_y,
    heatmap:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxZTFmMjEiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjODBjMGZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5CZWFtZm9ybWluZyBIZWF0bWFwPC90ZXh0Pjwvc3ZnPg==",
  };
};