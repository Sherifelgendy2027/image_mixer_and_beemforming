let units = [];
let beamChart = null;
let polarChart = null;
let geoChart = null;

const defaultUnit = {
    elements: 16,
    spacing: 0.5, 
    frequency: 300,
    steering: 0,
    type: 'linear',
    curvature: 1.0, 
    x_pos: 0,
    y_pos: 0
};

const scenarios = {
    '5g': [
        { ...defaultUnit, elements: 16, frequency: 28000, spacing: 0.5, type: 'linear' }
    ],
    'ultrasound': [
        { ...defaultUnit, elements: 64, frequency: 5, spacing: 0.5, type: 'curved', curvature: 1.5 }
    ],
    'ablation': [
        { ...defaultUnit, elements: 1, frequency: 915, x_pos: -2, y_pos: 0 },
        { ...defaultUnit, elements: 1, frequency: 915, x_pos: 2, y_pos: 0 }
    ]
};

window.onload = function() {
    initCharts();
    loadScenario('5g');
};

function initCharts() {
    // 1. Rectangular
    const ctxBeam = document.getElementById('beamChart').getContext('2d');
    beamChart = new Chart(ctxBeam, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Gain (dB)', data: [], borderColor: '#4fa08b', borderWidth: 2, pointRadius: 0 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Angle (deg)', color:'#aaa' }, ticks:{color:'#aaa'} },
                y: { title: { display: true, text: 'Magnitude (dB)', color:'#aaa' }, min: -60, max: 0, ticks:{color:'#aaa'} }
            },
            plugins: { legend: { display: false } }
        }
    });

    // 2. Polar (Radar) - Adjusted for orientation
    const ctxPolar = document.getElementById('polarChart').getContext('2d');
    polarChart = new Chart(ctxPolar, {
        type: 'radar',
        data: { 
            labels: [], 
            datasets: [{ 
                label: 'Gain (dB)', 
                data: [], 
                borderColor: '#4fa08b', 
                borderWidth: 2, 
                pointRadius: 0, 
                fill: true, 
                backgroundColor: 'rgba(79, 160, 139, 0.2)' 
            }] 
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: '#333' },
                    grid: { color: '#333' },
                    pointLabels: { display: false }, // Hide text labels around circle for cleaner look
                    suggestedMin: -60,
                    suggestedMax: 0,
                    ticks: { display: false }
                }
            },
            plugins: { legend: { display: false } },
            // Key Fix: Rotate chart so 0 degrees is Up.
            // Chart.js starts labels at 12 o'clock. 
            // We pad data to full 360.
            // We want -90 (Left), 0 (Top), 90 (Right).
            // This is default behavior IF we supply data in that order covering the circle.
        }
    });

    // 3. Geometry
    const ctxGeo = document.getElementById('geoChart').getContext('2d');
    geoChart = new Chart(ctxGeo, {
        type: 'scatter',
        data: { datasets: [{ label: 'Elements', data: [], backgroundColor: '#4fa08b' }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', position: 'bottom', title:{display:true, text:'X (m)', color:'#aaa'}, ticks:{color:'#aaa'} },
                y: { title:{display:true, text:'Y (m)', color:'#aaa'}, ticks:{color:'#aaa'} }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function loadScenario(name) {
    units = JSON.parse(JSON.stringify(scenarios[name])); 
    renderUnits();
    requestSimulation();
}

function addUnit() {
    units.push({ ...defaultUnit });
    renderUnits();
    requestSimulation();
}

function removeUnit(index) {
    units.splice(index, 1);
    renderUnits();
    requestSimulation();
}

function updateUnitVal(index, key, value) {
    if(key === 'type') {
        units[index][key] = value;
        renderUnits();
    } else {
        units[index][key] = parseFloat(value);
        const label = document.getElementById(`lbl_${key}_${index}`);
        if(label) label.innerText = value;
    }
    requestSimulation();
}

function renderUnits() {
    const container = document.getElementById('unitsContainer');
    container.innerHTML = '';
    
    units.forEach((u, i) => {
        const div = document.createElement('div');
        div.className = 'unit-card';
        div.innerHTML = `
            <div class="unit-header">
                <strong>Unit ${i+1}</strong>
                <button class="btn-sm btn-danger" onclick="removeUnit(${i})">×</button>
            </div>
            
            <div class="control-row">
                <label>Freq (MHz): <span id="lbl_frequency_${i}">${u.frequency}</span></label>
                <input type="range" min="1" max="30000" value="${u.frequency}" oninput="updateUnitVal(${i}, 'frequency', this.value)">
            </div>
            
            <div class="control-row">
                <label>Elements: <span id="lbl_elements_${i}">${u.elements}</span></label>
                <input type="range" min="1" max="128" value="${u.elements}" oninput="updateUnitVal(${i}, 'elements', this.value)">
            </div>

            <div class="control-row">
                <label>Spacing (λ): <span id="lbl_spacing_${i}">${u.spacing}</span></label>
                <input type="range" min="0.1" max="5.0" step="0.1" value="${u.spacing}" oninput="updateUnitVal(${i}, 'spacing', this.value)">
            </div>

            <div class="control-row">
                <label>Steering (°): <span id="lbl_steering_${i}">${u.steering}</span></label>
                <input type="range" min="-90" max="90" value="${u.steering}" oninput="updateUnitVal(${i}, 'steering', this.value)">
            </div>

            <div class="control-row">
                <label>Type:</label>
                <select onchange="updateUnitVal(${i}, 'type', this.value)">
                    <option value="linear" ${u.type === 'linear' ? 'selected' : ''}>Linear</option>
                    <option value="curved" ${u.type === 'curved' ? 'selected' : ''}>Curved</option>
                </select>
            </div>
            
            <div class="control-row" ${u.type === 'linear' ? 'style="display:none"' : ''}>
                <label>Curvature (rad): <span id="lbl_curvature_${i}">${u.curvature}</span></label>
                <input type="range" min="0.1" max="6.2" step="0.1" value="${u.curvature}" oninput="updateUnitVal(${i}, 'curvature', this.value)">
            </div>

            <div class="control-row">
                <label>Pos X: <span id="lbl_x_pos_${i}">${u.x_pos}</span></label>
                <input type="range" min="-10" max="10" step="0.1" value="${u.x_pos}" oninput="updateUnitVal(${i}, 'x_pos', this.value)">
            </div>
             <div class="control-row">
                <label>Pos Y: <span id="lbl_y_pos_${i}">${u.y_pos}</span></label>
                <input type="range" min="-10" max="10" step="0.1" value="${u.y_pos}" oninput="updateUnitVal(${i}, 'y_pos', this.value)">
            </div>
        `;
        container.appendChild(div);
    });
}

async function requestSimulation() {
    const payload = { arrays: units };
    
    try {
        const response = await fetch('/simulate_beam', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        document.getElementById('heatmapImg').src = `data:image/png;base64,${data.heatmap}`;
        
        // Rectangular
        beamChart.data.labels = data.beam_angles.map(a => Math.round(a));
        beamChart.data.datasets[0].data = data.beam_values;
        beamChart.update('none'); 
        
        // Polar Logic:
        // Data comes in -90 to 90.
        // We need 0 to 360 for a full radar chart.
        // We map: 
        // Input -90 -> Radar 270 (Left)
        // Input 0 -> Radar 0 (Top)
        // Input 90 -> Radar 90 (Right)
        // Input 91..269 -> Empty/Floor (-60)
        
        // Create full 360 arrays
        const polarData = new Array(360).fill(-60); // Fill floor
        const polarLabels = new Array(360).fill('');
        
        data.beam_angles.forEach((angle, i) => {
            // angle is -90 to 90
            // Map to 0-360 index
            // 0 deg -> index 0
            // 90 deg -> index 90
            // -90 deg -> index 270
            let idx = Math.round(angle);
            if (idx < 0) idx += 360;
            
            if (idx >= 0 && idx < 360) {
                polarData[idx] = data.beam_values[i];
            }
        });
        
        polarChart.data.labels = polarLabels; // Labels often ignored in Radar or auto-generated
        polarChart.data.datasets[0].data = polarData;
        polarChart.update('none');

        // Geometry
        const points = data.geometry_x.map((x, i) => ({ x: x, y: data.geometry_y[i] }));
        geoChart.data.datasets[0].data = points;
        geoChart.update();
        
    } catch (e) {
        console.error(e);
    }
}