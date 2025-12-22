import React, { useState, useEffect } from "react";

const RegionOverlay = ({
                           rect, // { x, y, w, h } in normalized coordinates (0-1)
                           onChange,
                           containerRef,
                           isInner = true,
                       }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragAction, setDragAction] = useState(null); // 'MOVE', 'RESIZE_TL', 'RESIZE_TR', 'RESIZE_BL', 'RESIZE_BR'
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startRect, setStartRect] = useState(null);

    // Helper to clamp values between 0 and 1
    const clamp = (val, min = 0, max = 1) => Math.min(Math.max(val, min), max);

    const handleMouseDown = (e, action) => {
        e.preventDefault();
        e.stopPropagation();

        if (!containerRef.current) return;

        setIsDragging(true);
        setDragAction(action);
        setStartPos({ x: e.clientX, y: e.clientY });
        setStartRect({ ...rect });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !startRect || !containerRef.current) return;

            const container = containerRef.current.getBoundingClientRect();
            const deltaX = (e.clientX - startPos.x) / container.width;
            const deltaY = (e.clientY - startPos.y) / container.height;
            const minSize = 0.05; // Minimum 5% width/height

            let newRect = { ...startRect };

            switch (dragAction) {
                case 'MOVE':
                    // Calculate potential new positions
                    let nx = startRect.x + deltaX;
                    let ny = startRect.y + deltaY;

                    // Clamp ensuring the box stays fully within container
                    nx = clamp(nx, 0, 1 - startRect.w);
                    ny = clamp(ny, 0, 1 - startRect.h);

                    newRect.x = nx;
                    newRect.y = ny;
                    break;

                case 'RESIZE_TL':
                {
                    let nx = startRect.x + deltaX;
                    let ny = startRect.y + deltaY;
                    let nw = startRect.w - deltaX;
                    let nh = startRect.h - deltaY;

                    if (nw < minSize) { nw = minSize; nx = (startRect.x + startRect.w) - minSize; }
                    else if (nx < 0) { nx = 0; nw = startRect.x + startRect.w; }

                    if (nh < minSize) { nh = minSize; ny = (startRect.y + startRect.h) - minSize; }
                    else if (ny < 0) { ny = 0; nh = startRect.y + startRect.h; }

                    newRect.x = nx;
                    newRect.y = ny;
                    newRect.w = nw;
                    newRect.h = nh;
                }
                    break;

                case 'RESIZE_TR':
                {
                    let ny = startRect.y + deltaY;
                    let nw = startRect.w + deltaX;
                    let nh = startRect.h - deltaY;

                    if (nw < minSize) nw = minSize;
                    if (startRect.x + nw > 1) nw = 1 - startRect.x;

                    if (nh < minSize) { nh = minSize; ny = (startRect.y + startRect.h) - minSize; }
                    else if (ny < 0) { ny = 0; nh = startRect.y + startRect.h; }

                    newRect.y = ny;
                    newRect.w = nw;
                    newRect.h = nh;
                }
                    break;

                case 'RESIZE_BL':
                {
                    let nx = startRect.x + deltaX;
                    let nw = startRect.w - deltaX;
                    let nh = startRect.h + deltaY;

                    if (nw < minSize) { nw = minSize; nx = (startRect.x + startRect.w) - minSize; }
                    else if (nx < 0) { nx = 0; nw = startRect.x + startRect.w; }

                    if (nh < minSize) nh = minSize;
                    if (startRect.y + nh > 1) nh = 1 - startRect.y;

                    newRect.x = nx;
                    newRect.w = nw;
                    newRect.h = nh;
                }
                    break;

                case 'RESIZE_BR':
                {
                    let nw = startRect.w + deltaX;
                    let nh = startRect.h + deltaY;

                    if (nw < minSize) nw = minSize;
                    if (startRect.x + nw > 1) nw = 1 - startRect.x;

                    if (nh < minSize) nh = minSize;
                    if (startRect.y + nh > 1) nh = 1 - startRect.y;

                    newRect.w = nw;
                    newRect.h = nh;
                }
                    break;
                default:
                    break;
            }

            onChange(newRect);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDragAction(null);
            setStartRect(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragAction, startPos, startRect, containerRef, onChange]);

    return (
        <>
            {/* Outer Region Backdrop (SVG Mask)
          This layer creates the "dimmed" effect with a hole for the selected region.
          It sits strictly inside the container (100% w/h) so it doesn't spill out.
      */}
            {!isInner && (
                <div className="region-backdrop">
                    <svg width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
                        <defs>
                            <mask id="hole-mask">
                                {/* White fills the mask (visible), Black is transparent (hole) */}
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                <rect
                                    x={`${rect.x * 100}%`}
                                    y={`${rect.y * 100}%`}
                                    width={`${rect.w * 100}%`}
                                    height={`${rect.h * 100}%`}
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        {/* The dark overlay using the mask */}
                        <rect
                            x="0" y="0" width="100%" height="100%"
                            fill="rgba(0, 0, 0, 0.4)"
                            mask="url(#hole-mask)"
                        />
                    </svg>
                </div>
            )}

            {/* The Interactive Box
          This handles the border, drag events, and resize handles.
          It is positioned absolutely based on the region.
      */}
            <div
                className={`region-box ${isInner ? 'region-inner' : 'region-outer-box'}`}
                style={{
                    left: `${rect.x * 100}%`,
                    top: `${rect.y * 100}%`,
                    width: `${rect.w * 100}%`,
                    height: `${rect.h * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'MOVE')}
            >
                {/* Resize Handles */}
                <div className="region-handle handle-tl" onMouseDown={(e) => handleMouseDown(e, 'RESIZE_TL')}></div>
                <div className="region-handle handle-tr" onMouseDown={(e) => handleMouseDown(e, 'RESIZE_TR')}></div>
                <div className="region-handle handle-bl" onMouseDown={(e) => handleMouseDown(e, 'RESIZE_BL')}></div>
                <div className="region-handle handle-br" onMouseDown={(e) => handleMouseDown(e, 'RESIZE_BR')}></div>
            </div>
        </>
    );
};

export default RegionOverlay;