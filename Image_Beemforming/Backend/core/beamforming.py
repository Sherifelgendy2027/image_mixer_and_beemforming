import numpy as np
import cv2

class Beamformer:
    def __init__(self):
        self.speed_of_light = 3e8
        
    def generate_array_positions(self, params):
        N = int(params['elements'])
        d_lambda = params['spacing'] 
        wavelength = self.speed_of_light / (params['frequency'] * 1e6)
        d = d_lambda * wavelength
        
        x = np.zeros(N)
        y = np.zeros(N)

        if params['type'] == 'linear':
            x = (np.arange(N) - (N-1)/2) * d
            y = np.zeros(N)
        
        elif params['type'] == 'curved':
            curvature = params.get('curvature', 1.0)
            if curvature < 0.01: curvature = 0.01
            
            L = (N-1) * d
            span_angle = curvature
            
            if N > 1:
                angles = np.linspace(-span_angle/2, span_angle/2, N)
            else:
                angles = np.array([0.0])
                
            if span_angle > 0:
                R = L / span_angle
                x = R * np.sin(angles)
                y = R * (np.cos(angles) - 1)
            else:
                x = (np.arange(N) - (N-1)/2) * d
                y = np.zeros(N)
            
        return x + params['x_pos'], y + params['y_pos']

    def simulate(self, arrays, map_size=300):
        # 1. Setup Grid (Rectangular / Cartesian as requested)
        limit = 0.3 
        if arrays:
            ref_freq = arrays[0]['frequency'] * 1e6
            wavelength = self.speed_of_light / ref_freq
            limit = 10 * wavelength
        
        # Standard Cartesian Grid (No Sector logic)
        x = np.linspace(-limit, limit, map_size)
        y = np.linspace(-limit, limit, map_size)
        grid_x, grid_y = np.meshgrid(x, y)
        
        total_field = np.zeros((map_size, map_size), dtype=np.complex128)
        
        # 2. Beam Pattern Data
        theta = np.linspace(-np.pi/2, np.pi/2, 361) 
        beam_pattern_sum = np.zeros_like(theta, dtype=np.complex128)

        for arr in arrays:
            freq = arr['frequency'] * 1e6
            k = 2 * np.pi * freq / self.speed_of_light
            
            elem_x, elem_y = self.generate_array_positions(arr)
            steering_rad = np.deg2rad(arr['steering'])
            
            # Weights
            element_phases = -k * (elem_x * np.sin(steering_rad) + elem_y * np.cos(steering_rad))
            weights = np.exp(1j * element_phases)
            
            # --- Field Calculation ---
            gx_flat = grid_x.ravel()
            gy_flat = grid_y.ravel()
            field_flat = np.zeros_like(gx_flat, dtype=np.complex128)
            
            for i in range(len(elem_x)):
                dx = gx_flat - elem_x[i]
                dy = gy_flat - elem_y[i]
                dist = np.sqrt(dx**2 + dy**2)
                dist = np.maximum(dist, wavelength/20)
                field_flat += (np.exp(-1j * k * dist) / dist) * weights[i]
                
            total_field += field_flat.reshape(map_size, map_size)

            # --- Beam Pattern ---
            for i in range(len(elem_x)):
                path_diff = elem_x[i] * np.sin(theta) + elem_y[i] * np.cos(theta)
                beam_pattern_sum += weights[i] * np.exp(1j * k * path_diff)

        # 3. Process Heatmap (Standard Rectangular)
        mag_map = np.abs(total_field)
        mag_map = 20 * np.log10(mag_map + 1e-9)
        
        vmax = np.max(mag_map)
        vmin = vmax - 40
        mag_map = np.clip(mag_map, vmin, vmax)
        
        # Flip Y for standard image coords (Top-Down vs Bottom-Up)
        # Physics: Y is usually Up. Image: Y is Down.
        # We should flip vertically to match intuitive "Up is Up"
        mag_map = np.flipud(mag_map)
        
        heatmap_norm = cv2.normalize(mag_map, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        heatmap_color = cv2.applyColorMap(heatmap_norm, cv2.COLORMAP_JET)
        
        # Beam Pattern
        beam_mag = np.abs(beam_pattern_sum)
        beam_mag = 20 * np.log10(beam_mag + 1e-9)
        beam_mag -= np.max(beam_mag)
        beam_mag = np.clip(beam_mag, -60, 0)
        
        all_x = []
        all_y = []
        for arr in arrays:
            ex, ey = self.generate_array_positions(arr)
            all_x.extend(ex)
            all_y.extend(ey)

        return {
            'heatmap': heatmap_color,
            'beam_angles': np.rad2deg(theta).tolist(),
            'beam_values': beam_mag.tolist(),
            'geometry_x': [float(x) for x in all_x],
            'geometry_y': [float(y) for y in all_y]
        }