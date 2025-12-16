// utils/imageMixing.js
export const calculateMixedImage = (
  images,
  magPhaseValues,
  realImagValues,
  activeOutput
) => {
  if (!images.some((img) => img)) return null;

  const loadedImages = images.filter((img) => img);
  if (loadedImages.length === 0) return null;

  // Calculate total weight for normalization
  let totalWeight = 0;
  const imageWeights = [];

  // Assign weights based on active output and which inputs have images
  for (let i = 0; i < 4; i++) {
    if (images[i]) {
      if (activeOutput === "A") {
        // Output A uses magPhaseValues
        const weight = magPhaseValues[i * 2] + magPhaseValues[i * 2 + 1];
        imageWeights[i] = weight;
        totalWeight += weight;
      } else {
        // Output B uses realImagValues
        const weight = realImagValues[i * 2] + realImagValues[i * 2 + 1];
        imageWeights[i] = weight;
        totalWeight += weight;
      }
    } else {
      imageWeights[i] = 0;
    }
  }

  // If all weights are zero, use equal distribution
  if (totalWeight === 0) {
    loadedImages.forEach((_, i) => {
      if (images[i]) {
        imageWeights[i] = 100;
        totalWeight += 100;
      }
    });
  }

  // Calculate the mix intensity and details
  const mixedInfo = {
    intensity: Math.round((totalWeight / (loadedImages.length * 100)) * 50),
    loadedImages: loadedImages.length,
    weights: imageWeights.filter((w) => w > 0),
  };

  return mixedInfo;
};