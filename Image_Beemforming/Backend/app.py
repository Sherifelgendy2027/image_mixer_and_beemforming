import os
import cv2
import base64
import numpy as np
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from core.ft_mixer import FTMixer
from core.beamforming import Beamformer


from core.ft_mixer import FTMixer
from core.beamforming import Beamformer

app = Flask(__name__)
CORS(app, origins="*")  # <--- 2. Enable CORS for all routes and origins

app.config['UPLOAD_FOLDER'] = 'static\\uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

mixer = FTMixer()
beamformer = Beamformer()

# --- Part A Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload/<int:slot_id>', methods=['POST'])
def upload_file(slot_id):
    if 'file' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({'error': 'Empty'}), 400
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], f'image_{slot_id}.png')

    file.save(filepath)  # Save original
    img_array = mixer.update_image(slot_id - 1, filepath)  # Process it
    if img_array is not None:
        cv2.imwrite(filepath, img_array)  # Save processed version

    return jsonify({'filepath': filepath})

@app.route('/component/<int:slot_id>/<type>', methods=['GET'])
def get_component(slot_id, type):
    idx = slot_id - 1
    if idx < 0 or idx >= 4: return "Error", 400
    img_processor = mixer.images[idx]
    if type == 'image': result_img = img_processor.get_image_display()
    else: result_img = img_processor.get_component_display(type)
    if result_img is None: result_img = np.zeros((200, 200), dtype=np.uint8)
    _, buffer = cv2.imencode('.png', result_img)
    return jsonify({'image_data': base64.b64encode(buffer).decode('utf-8')})

@app.route('/adjust_bc', methods=['POST'])
def adjust_bc():
    data = request.json
    mixer.adjust_image_bc(int(data['slot_id']) - 1, float(data['brightness']), float(data['contrast']))
    return jsonify({'status': 'ok'})

@app.route('/process_ft', methods=['POST'])
def process_ft():
    data = request.json
    w1 = [float(x) for x in data['weights_1']]
    w2 = [float(x) for x in data['weights_2']]
    global_region = None
    if data.get('region_enabled', False):
        global_region = {
            'x': float(data['region']['x']),
            'y': float(data['region']['y']),
            'w': float(data['region']['width']),
            'h': float(data['region']['height'])
        }
    result_img = mixer.mix(w1, w2, data['region_settings_1'], data['region_settings_2'], global_region, data.get('mode', 'magnitude_phase'))
    if result_img is None: return jsonify({'error': 'No images'}), 400
    _, buffer = cv2.imencode('.png', result_img)
    return jsonify({'image_data': base64.b64encode(buffer).decode('utf-8')})

# --- Part B Routes (Beamforming) ---

@app.route('/beamforming')
def beamforming():
    return render_template('beamforming.html')

@app.route('/simulate_beam', methods=['POST'])
def simulate_beam():
    data = request.json
    # data should contain a list of arrays: [{'elements': 16, ...}, ...]
    # For MVP we might start with one, but the requirement says "Multiple units".
    # Frontend will send: { 'arrays': [ ... ] }
    
    arrays = data.get('arrays', [])
    if not arrays:
        return jsonify({'error': 'No arrays defined'}), 400
        
    result = beamformer.simulate(arrays)
    
    # Encode Heatmap
    _, buffer = cv2.imencode('.png', result['heatmap'])
    heatmap_b64 = base64.b64encode(buffer).decode('utf-8')
    
    return jsonify({
        'heatmap': heatmap_b64,
        'beam_angles': result['beam_angles'],
        'beam_values': result['beam_values'],
        'geometry_x': result['geometry_x'],
        'geometry_y': result['geometry_y']
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)