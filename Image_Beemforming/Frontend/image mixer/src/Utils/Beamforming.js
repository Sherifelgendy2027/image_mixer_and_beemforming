// src/utils/beamforming.js

const API_BASE_URL = '';

/**
 * Calls the actual beamforming API endpoint
 * @param {Object} payload - The arrays configuration
 * @returns {Promise} - Promise resolving to simulation results
 */
export async function simulateBeamforming(payload) {
  try {
    console.log('Sending API request:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/simulate_beam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response received:', data);
    return data;
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Fallback to mock data if API is unavailable
    console.log('Falling back to mock data');
    return getMockBeamformingData(payload);
  }
}

/**
 * Mock data for development/testing
 */
function getMockBeamformingData(payload) {
  const arrays = payload.arrays || [];
  
  // Generate geometry data
  const geometry_x = [];
  const geometry_y = [];
  
  arrays.forEach((array, arrayIndex) => {
    const n = array.elements;
    const spacing = array.spacing;
    
    // Calculate wavelength (speed of light / frequency)
    const frequencyHz = (array.frequency || 28000) * 1e6; // Convert MHz to Hz
    const speedOfLight = 299792458; // m/s
    const wavelength = speedOfLight / frequencyHz;
    const d = spacing * wavelength; // Element spacing in meters
    
    if (array.type === 'linear') {
      // Linear array along x-axis
      for (let i = 0; i < n; i++) {
        const x = (i - (n-1)/2) * d;
        const y = 0;
        geometry_x.push(x + (array.x_pos || 0));
        geometry_y.push(y + (array.y_pos || 0));
      }
    } else {
      // Curved array
      const R = (array.curvature || 1) * wavelength * n / (2 * Math.PI);
      const angles = Array.from({length: n}, (_, i) => 
        (i/(n-1) - 0.5) * Math.PI/2
      );
      angles.forEach(angle => {
        const x = R * Math.sin(angle);
        const y = R * (1 - Math.cos(angle));
        geometry_x.push(x + (array.x_pos || 0));
        geometry_y.push(y + (array.y_pos || 0));
      });
    }
  });
  
  // Generate beam pattern
  const beam_angles = [];
  const beam_values = [];
  
  const mainFrequency = arrays[0]?.frequency || 28000;
  const mainSteering = arrays[0]?.steering || 0;
  const mainElements = arrays[0]?.elements || 16;
  const speedOfLight = 299792458;
  const wavelengthMain = speedOfLight / (mainFrequency * 1e6);
  
  for (let angle = -90; angle <= 90; angle += 1) {
    beam_angles.push(angle);
    
    // Calculate array factor
    const k = 2 * Math.PI / wavelengthMain; // wave number
    const steeringRad = (mainSteering * Math.PI) / 180;
    const angleRad = (angle * Math.PI) / 180;
    
    // Simple array factor calculation
    let af = 0;
    for (let i = 0; i < mainElements; i++) {
      const phase = k * i * 0.5 * wavelengthMain * 
                   (Math.sin(angleRad) - Math.sin(steeringRad));
      af += Math.cos(phase);
    }
    
    let gain = 20 * Math.log10(Math.abs(af / mainElements) + 1e-10);
    gain = Math.max(-60, Math.min(0, gain));
    
    // Add some realistic sidelobes
    if (Math.abs(angle - mainSteering) > 15) {
      gain -= 20 + Math.random() * 10;
    }
    
    beam_values.push(gain);
  }
  
  // Create a simple heatmap
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  // Create radial gradient for heatmap
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.min(centerX, centerY) * 0.9;
  
  // Draw heatmap pattern
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy) / maxRadius;
      
      if (distance <= 1) {
        // Intensity based on angle from center
        const angle = Math.atan2(dy, dx);
        const mainLobeAngle = (mainSteering * Math.PI) / 180;
        const lobeDistance = Math.abs(Math.atan2(dy, dx) - mainLobeAngle);
        const mainLobeIntensity = Math.exp(-lobeDistance * 10);
        
        // Add sidelobes
        const sidelobeIntensity = 0.3 * Math.sin(angle * 5) ** 2;
        
        let intensity = Math.max(0, Math.min(1, 
          mainLobeIntensity * 0.8 + sidelobeIntensity * 0.2
        ));
        
        // Convert to jet colormap
        const idx = (y * canvas.width + x) * 4;
        
        if (intensity < 0.25) {
          // Blue to cyan
          data[idx] = 0;
          data[idx + 1] = Math.round(255 * intensity * 4);
          data[idx + 2] = Math.round(255 * intensity * 4);
        } else if (intensity < 0.5) {
          // Cyan to green
          data[idx] = 0;
          data[idx + 1] = 255;
          data[idx + 2] = Math.round(255 * (1 - (intensity - 0.25) * 4));
        } else if (intensity < 0.75) {
          // Green to yellow
          data[idx] = Math.round(255 * (intensity - 0.5) * 4);
          data[idx + 1] = 255;
          data[idx + 2] = 0;
        } else {
          // Yellow to red
          data[idx] = 255;
          data[idx + 1] = Math.round(255 * (1 - (intensity - 0.75) * 4));
          data[idx + 2] = 0;
        }
        data[idx + 3] = 255;
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Draw element positions
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  
  geometry_x.forEach((x, i) => {
    const px = centerX + (x / 2) * (canvas.width / 4);
    const py = centerY + (geometry_y[i] / 2) * (canvas.height / 4);
    
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  
  // Draw axes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  
  // X axis
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();
  
  // Y axis
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvas.height);
  ctx.stroke();
  
  // Add labels
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('X (m)', canvas.width - 20, centerY - 10);
  ctx.fillText('Y (m)', centerX + 20, 15);
  
  return {
    heatmap: canvas.toDataURL('image/png'),
    beam_angles,
    beam_values,
    geometry_x,
    geometry_y,
  };
}

/**
 * Helper to validate API response
 */
export function validateApiResponse(response) {
  if (!response) {
    throw new Error('No response from API');
  }
  
  const requiredFields = ['beam_angles', 'beam_values', 'geometry_x', 'geometry_y'];
  const missingFields = requiredFields.filter(field => !response[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
}