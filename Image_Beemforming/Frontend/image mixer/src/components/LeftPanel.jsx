import React from 'react';

// Helper component for standard range slider
const SimpleSlider = ({ label, value, onChange, min, max }) => {
    // Handle both array (from parent state) and single value
    const currentValue = Array.isArray(value) ? value[0] : value;

    const handleChange = (e) => {
        const val = parseInt(e.target.value, 10);
        // Wrap in array to maintain compatibility with FTMixer handlers
        onChange([val]);
    };

    return (
        <div className="slider-group mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="slider-label text-muted" style={{fontSize: '0.75rem', fontWeight: 500}}>{label}</label>
                <span className="slider-value text-primary" style={{fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace'}}>{currentValue}%</span>
            </div>
            <input
                type="range"
                className="form-range"
                min={min}
                max={max}
                value={currentValue}
                onChange={handleChange}
                style={{height: '4px'}}
            />
        </div>
    );
};

export const LeftPanel = ({
                              leftPanelOpen,
                              images,
                              handleImageReplace,
                              // Mix Mode State
                              mixMode,
                              setMixMode,
                              // Mag/Phase Props
                              magPhaseValues,
                              handleMagPhaseSliderChange,
                              handleResetMagPhase,
                              // Real/Imag Props
                              realImagValues,
                              handleRealImagSliderChange,
                              handleResetRealImag,
                              // Region Props
                              useInnerRegion,
                              regionSize,
                              setUseInnerRegion,
                              setRegionSize,
                              regionEnable,
                              setRegionEnable
                          }) => {
    return (
        <div className={`left-panel ${leftPanelOpen ? "open" : "closed"}`}>
            <div className="panel-content">
                {/* Section 1: Inputs */}
                <div className="panel-section">
                    <div className="panel-title">
                        <i className="bi bi-grid-fill me-2"></i> Inputs
                    </div>
                    <div className="image-buttons">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                className={`btn btn-outline-secondary image-btn ${img ? 'active' : ''}`}
                                onClick={() => handleImageReplace(index)}
                            >
                                {img ? `Image ${index + 1}` : `Upload ${index + 1}`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 2: Mixing Controls */}
                <div className="panel-section">
                    <div className="panel-title d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center"><i className="bi bi-sliders me-2"></i> Mixing</div>
                        <div className="btn-group btn-group-sm" role="group">
                            <button
                                type="button"
                                className={`btn ${mixMode === 'magnitude_phase' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setMixMode('magnitude_phase')}
                                style={{fontSize: '0.7rem', padding: '0.2rem 0.5rem'}}
                            >
                                Mag/Phase
                            </button>
                            <button
                                type="button"
                                className={`btn ${mixMode === 'real_imaginary' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setMixMode('real_imaginary')}
                                style={{fontSize: '0.7rem', padding: '0.2rem 0.5rem'}}
                            >
                                Real/Imag
                            </button>
                        </div>
                    </div>

                    <div className="sliders-section">
                        {mixMode === 'magnitude_phase' ? (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="panel-label fw-bold" style={{fontSize: '0.8rem'}}>Magnitude & Phase</span>
                                    <button className="btn btn-link btn-sm p-0 text-decoration-none" style={{fontSize: '0.75rem'}} onClick={handleResetMagPhase}>Reset</button>
                                </div>
                                {/* Sliders for Inputs 1-4 Magnitude */}
                                {[0, 1, 2, 3].map(i => (
                                    <SimpleSlider
                                        key={`mag-${i}`}
                                        label={`Input ${i + 1} Magnitude`}
                                        value={[magPhaseValues[i]]}
                                        onChange={(val) => handleMagPhaseSliderChange(i, val)}
                                        min={0}
                                        max={100}
                                    />
                                ))}
                                <div className="my-3 border-top"></div>
                                {/* Sliders for Inputs 1-4 Phase */}
                                {[4, 5, 6, 7].map(i => (
                                    <SimpleSlider
                                        key={`phase-${i}`}
                                        label={`Input ${i - 3} Phase`}
                                        value={[magPhaseValues[i]]}
                                        onChange={(val) => handleMagPhaseSliderChange(i, val)}
                                        min={0}
                                        max={100}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="panel-label fw-bold" style={{fontSize: '0.8rem'}}>Real & Imaginary</span>
                                    <button className="btn btn-link btn-sm p-0 text-decoration-none" style={{fontSize: '0.75rem'}} onClick={handleResetRealImag}>Reset</button>
                                </div>
                                {/* Sliders for Inputs 1-4 Real */}
                                {[0, 1, 2, 3].map(i => (
                                    <SimpleSlider
                                        key={`real-${i}`}
                                        label={`Input ${i + 1} Real`}
                                        value={[realImagValues[i]]}
                                        onChange={(val) => handleRealImagSliderChange(i, val)}
                                        min={0}
                                        max={100}
                                    />
                                ))}
                                <div className="my-3 border-top"></div>
                                {/* Sliders for Inputs 1-4 Imaginary */}
                                {[4, 5, 6, 7].map(i => (
                                    <SimpleSlider
                                        key={`imag-${i}`}
                                        label={`Input ${i - 3} Imaginary`}
                                        value={[realImagValues[i]]}
                                        onChange={(val) => handleRealImagSliderChange(i, val)}
                                        min={0}
                                        max={100}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Section 3: Region Mixer */}
                <div className="panel-section">
                    <div className="panel-title justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-bounding-box-circles me-2"></i>
                            Region Mixer
                        </div>
                        {/* Standard Bootstrap Switch */}
                        <div className="form-check form-switch m-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="regionMixerSwitch"
                                checked={regionEnable}
                                onChange={(e) => setRegionEnable(e.target.checked)}
                                style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                            />
                        </div>
                    </div>

                    {regionEnable && (
                        <div className="mt-3">
                            <div className="mb-3">
                                <label className="panel-label d-block mb-2" style={{fontSize: '0.8rem'}}>Region Selection:</label>
                                <div className="btn-group w-100" role="group">
                                    <input type="radio" className="btn-check" name="regiontype" id="region-inner" autoComplete="off"
                                           checked={useInnerRegion} onChange={() => setUseInnerRegion(true)} />
                                    <label className="btn btn-outline-primary btn-sm" htmlFor="region-inner">Inner</label>

                                    <input type="radio" className="btn-check" name="regiontype" id="region-outer" autoComplete="off"
                                           checked={!useInnerRegion} onChange={() => setUseInnerRegion(false)} />
                                    <label className="btn btn-outline-primary btn-sm" htmlFor="region-outer">Outer</label>
                                </div>
                            </div>

                            <SimpleSlider
                                label="Region Size (%)"
                                value={regionSize}
                                onChange={setRegionSize}
                                min={1}
                                max={100}
                            />
                            <div className="text-muted mt-2 fst-italic" style={{fontSize: '0.75rem'}}>
                                <i className="bi bi-info-circle me-1"></i>
                                Drag region on component view to move/resize.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};