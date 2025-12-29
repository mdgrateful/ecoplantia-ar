'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useDesigner, Point } from '@/lib/designer-context';
import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

const FT = 40; // pixels per foot
const BUFFER_SIZE = 20; // white buffer around garden

interface GardenCanvasProps {
  onPlantSelect?: (plantId: string) => void;
  onPlantDeselect?: () => void;
  selectedPlantId?: string | null;
}

export default function GardenCanvas({ onPlantSelect, onPlantDeselect, selectedPlantId }: GardenCanvasProps) {
  const { state, dispatch } = useDesigner();
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Viewport dragging state
  const [vpDragging, setVpDragging] = useState(false);
  const [vpStart, setVpStart] = useState({ x: 0, y: 0 });

  const canvasWidth = state.widthFt * FT;
  const canvasHeight = state.depthFt * FT;

  // Clamp a value between min and max
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  // Point-in-polygon test
  const ptInPoly = (p: Point, vs: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].x, yi = vs[i].y;
      const xj = vs[j].x, yj = vs[j].y;
      if (((yi > p.y) !== (yj > p.y)) && (p.x < (xj - xi) * (p.y - yi) / (yj - yi + 1e-9) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Check if a point is inside the garden boundary
  const isInsideGarden = useCallback((x: number, y: number, radius: number): boolean => {
    if (state.shape === 'polygon') {
      if (!state.polyDone || state.polyPts.length < 3) return false;
      return ptInPoly({ x, y }, state.polyPts);
    }

    const gx = 0, gy = 0;
    const gw = canvasWidth, gh = canvasHeight;
    const lx = x - gx, ly = y - gy;
    const eff = radius * 0.8;

    if (state.shape === 'circle') {
      const rad = gw / 2;
      return Math.hypot(lx - rad, ly - rad) + eff <= rad;
    }

    return lx - eff >= 0 && ly - eff >= 0 && lx + eff <= gw && ly + eff <= gh;
  }, [state.shape, state.polyDone, state.polyPts, canvasWidth, canvasHeight]);

  // Check if click is in the white buffer (canvas area but outside garden shape)
  const isInWhiteBuffer = useCallback((e: React.PointerEvent | React.MouseEvent): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if inside canvas bounds
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return false;

    // Scale to canvas coordinates
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const cx = x * scaleX;
    const cy = y * scaleY;

    // Check if outside the garden shape (in the buffer)
    if (state.shape === 'circle') {
      const rad = canvasWidth / 2;
      const dist = Math.hypot(cx - rad, cy - rad);
      return dist > rad; // Outside the circle
    } else if (state.shape === 'polygon' && state.polyDone) {
      return !ptInPoly({ x: cx, y: cy }, state.polyPts);
    } else {
      // Rectangle - check if in padding area
      const padding = BUFFER_SIZE;
      return cx < padding || cy < padding || cx > canvasWidth - padding || cy > canvasHeight - padding;
    }
  }, [canvasWidth, canvasHeight, state.shape, state.polyDone, state.polyPts]);

  // Check overlap with other plants
  const checkOverlap = useCallback((x: number, y: number, radius: number, excludeId?: string): boolean => {
    for (const p of state.plants) {
      if (excludeId && p.id === excludeId) continue;
      const plant = PLANTS[p.idx];
      if (!plant) continue;
      const r2 = (plant.size / 12) * FT / 2;
      if (Math.hypot(x - p.cx, y - p.cy) < radius + r2) return true;
    }
    return false;
  }, [state.plants]);

  // Handle viewport pointer down - check for buffer click or garden drag
  const handleViewportPointerDown = (e: React.PointerEvent) => {
    // Check if clicking on white buffer to select garden
    if (isInWhiteBuffer(e)) {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: 'TOGGLE_GARDEN_SELECTED', selected: !state.gardenSelected });
      if (!state.gardenSelected) {
        dispatch({ type: 'SHOW_TOAST', message: 'Garden selected - drag to reposition' });
      }
      return;
    }

    // If garden is selected, start viewport drag
    if (state.gardenSelected) {
      e.preventDefault();
      setVpDragging(true);
      setVpStart({ x: e.clientX - state.vpOffsetX, y: e.clientY - state.vpOffsetY });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }

    // Deselect garden if clicking outside
    if (state.gardenSelected && !(e.target as HTMLElement)?.closest?.(`.${styles.gardenCanvas}`)) {
      dispatch({ type: 'TOGGLE_GARDEN_SELECTED', selected: false });
    }
  };

  // Handle viewport pointer move
  const handleViewportPointerMove = (e: React.PointerEvent) => {
    if (!vpDragging) return;

    const newX = e.clientX - vpStart.x;
    const newY = e.clientY - vpStart.y;
    dispatch({ type: 'SET_VP_OFFSET', x: newX, y: newY });
  };

  // Handle viewport pointer up
  const handleViewportPointerUp = (e: React.PointerEvent) => {
    if (vpDragging) {
      setVpDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  // Handle canvas click for plant placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't place plants if garden is selected (in drag mode)
    if (state.gardenSelected) {
      dispatch({ type: 'TOGGLE_GARDEN_SELECTED', selected: false });
      return;
    }

    // Deselect if clicking on canvas background
    if (selectedPlantId && onPlantDeselect) {
      onPlantDeselect();
    }

    if (state.polyDrawing || state.selectedPlantIdx === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const plant = PLANTS[state.selectedPlantIdx];
    if (!plant) return;

    const pxSize = (plant.size / 12) * FT;
    const radius = pxSize / 2;

    if (!isInsideGarden(x, y, radius)) {
      dispatch({ type: 'SHOW_TOAST', message: 'Place inside garden' });
      return;
    }

    if (!state.allowOverlap && checkOverlap(x, y, radius, undefined)) {
      dispatch({ type: 'SHOW_TOAST', message: 'Too close to another plant' });
      return;
    }

    const newPlant = {
      id: `p${Date.now()}`,
      idx: state.selectedPlantIdx,
      name: plant.name,
      cx: x,
      cy: y,
    };

    dispatch({ type: 'PLACE_PLANT', plant: newPlant });
    dispatch({ type: 'SHOW_TOAST', message: `${plant.name} placed` });
  };

  // Handle polygon canvas click
  const handlePolygonClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.polyDrawing || state.polyDone) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const x = clamp((e.clientX - rect.left) * scaleX, 10, canvasWidth - 10);
    const y = clamp((e.clientY - rect.top) * scaleY, 10, canvasHeight - 10);

    // Check if close to start point to close shape (after at least 3 points)
    if (state.polyPts.length >= 3) {
      const startPt = state.polyPts[0];
      const distToStart = Math.hypot(x - startPt.x, y - startPt.y);
      if (distToStart < 30) {
        dispatch({ type: 'FINISH_POLYGON' });
        dispatch({ type: 'SHOW_TOAST', message: 'Shape complete! Now add plants.' });
        return;
      }
    }

    dispatch({ type: 'ADD_POLY_POINT', point: { x, y } });
  };

  // Handle plant click (selection)
  const handlePlantClick = (e: React.MouseEvent, plantId: string) => {
    e.stopPropagation();
    if (state.gardenSelected) return; // Don't select plants in garden drag mode
    if (onPlantSelect) {
      onPlantSelect(plantId);
    }
  };

  // Plant drag handling
  const handlePlantDragStart = (e: React.PointerEvent, plantId: string) => {
    if (state.gardenSelected) return; // Don't drag plants in garden drag mode
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    target.classList.add(styles.drag);
    target.dataset.dragging = 'true';
    target.dataset.startX = e.clientX.toString();
    target.dataset.startY = e.clientY.toString();

    const plant = state.plants.find(p => p.id === plantId);
    if (plant) {
      target.dataset.origLeft = ((plant.cx - (PLANTS[plant.idx].size / 12) * FT / 2)).toString();
      target.dataset.origTop = ((plant.cy - (PLANTS[plant.idx].size / 12) * FT / 2)).toString();
    }
  };

  const handlePlantDragMove = (e: React.PointerEvent, plantId: string) => {
    const target = e.currentTarget as HTMLElement;
    if (target.dataset.dragging !== 'true') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const startX = parseFloat(target.dataset.startX || '0');
    const startY = parseFloat(target.dataset.startY || '0');
    const origLeft = parseFloat(target.dataset.origLeft || '0');
    const origTop = parseFloat(target.dataset.origTop || '0');

    const dx = (e.clientX - startX) * scaleX;
    const dy = (e.clientY - startY) * scaleY;

    const plant = state.plants.find(p => p.id === plantId);
    if (!plant) return;

    const plantData = PLANTS[plant.idx];
    const pxSize = (plantData.size / 12) * FT;
    const radius = pxSize / 2;

    const newLeft = origLeft + dx;
    const newTop = origTop + dy;
    const cx = newLeft + radius;
    const cy = newTop + radius;

    target.style.left = `${newLeft}px`;
    target.style.top = `${newTop}px`;

    const ok = isInsideGarden(cx, cy, radius) && (state.allowOverlap || !checkOverlap(cx, cy, radius, plantId));
    target.classList.toggle(styles.ok, ok);
    target.classList.toggle(styles.bad, !ok);
  };

  const handlePlantDragEnd = (e: React.PointerEvent, plantId: string) => {
    const target = e.currentTarget as HTMLElement;
    if (target.dataset.dragging !== 'true') return;

    target.dataset.dragging = 'false';
    target.releasePointerCapture(e.pointerId);
    target.classList.remove(styles.drag, styles.ok, styles.bad);

    const plant = state.plants.find(p => p.id === plantId);
    if (!plant) return;

    const plantData = PLANTS[plant.idx];
    const pxSize = (plantData.size / 12) * FT;
    const radius = pxSize / 2;

    const cx = parseFloat(target.style.left) + radius;
    const cy = parseFloat(target.style.top) + radius;

    if (!isInsideGarden(cx, cy, radius) || (!state.allowOverlap && checkOverlap(cx, cy, radius, plantId))) {
      // Revert to original position
      target.style.left = `${plant.cx - radius}px`;
      target.style.top = `${plant.cy - radius}px`;
      dispatch({ type: 'SHOW_TOAST', message: 'Invalid position' });
    } else {
      dispatch({ type: 'MOVE_PLANT', id: plantId, cx, cy });
    }
  };

  // Handle double-click to duplicate or remove
  const handlePlantDoubleClick = (e: React.MouseEvent, plantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'REMOVE_PLANT', id: plantId });
    dispatch({ type: 'SHOW_TOAST', message: 'Plant removed' });
    if (selectedPlantId === plantId && onPlantDeselect) {
      onPlantDeselect();
    }
  };

  // Hide toast after 2 seconds
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.toast, dispatch]);

  // Show buffer hint after garden is created
  useEffect(() => {
    if (state.view === 'design' && !state.polyDrawing && state.plants.length === 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SHOW_BUFFER_HINT' });
        setTimeout(() => dispatch({ type: 'HIDE_BUFFER_HINT' }), 6000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.view, state.polyDrawing, state.plants.length, dispatch]);

  return (
    <div
      ref={viewportRef}
      className={`${styles.viewport} ${state.gardenSelected ? styles.gardenSelectedMode : ''} ${vpDragging ? styles.dragging : ''}`}
      onPointerDown={handleViewportPointerDown}
      onPointerMove={handleViewportPointerMove}
      onPointerUp={handleViewportPointerUp}
      onPointerCancel={handleViewportPointerUp}
    >
      <div
        className={styles.viewportInner}
        style={{
          left: `calc(50% + ${state.vpOffsetX}px)`,
          top: `calc(50% + ${state.vpOffsetY}px)`,
          transition: vpDragging ? 'none' : 'left 0.2s, top 0.2s',
        }}
      >
        <div
          ref={canvasRef}
          className={`${styles.gardenCanvas} ${state.gardenSelected ? styles.gardenSelected : ''} ${state.showBufferHint ? styles.showBufferHint : ''}`}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${state.zoom})`,
            padding: BUFFER_SIZE,
          }}
          onClick={state.polyDrawing && !state.polyDone ? handlePolygonClick : handleCanvasClick}
        >
          {/* Buffer hint label */}
          <div className={styles.bufferHintLabel}>
            Tap white area to select & drag garden
          </div>

          {/* Garden selected drag label */}
          {state.gardenSelected && (
            <div className={styles.gardenDragLabel}>
              Drag to move
            </div>
          )}

          {/* Grid Overlay */}
          <div
            className={`${styles.gridOver} ${state.showGrid ? styles.vis : ''}`}
            style={{
              left: 0,
              top: 0,
              width: canvasWidth,
              height: canvasHeight,
            }}
          />

          {/* Garden Shape (for rectangle/circle) */}
          {state.shape !== 'polygon' && (
            <div
              className={`${styles.gardenShape} ${state.shape === 'circle' ? styles.circle : ''}`}
              style={{
                left: 0,
                top: 0,
                width: canvasWidth,
                height: canvasHeight,
              }}
            />
          )}

          {/* Polygon SVG */}
          {state.shape === 'polygon' && (
            <svg
              ref={svgRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: canvasWidth,
                height: canvasHeight,
                pointerEvents: 'none',
              }}
            >
              <polygon
                id="polyShape"
                points={state.polyPts.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(27, 158, 49, 0.1)"
                stroke="#1B9E31"
                strokeWidth="2"
                strokeDasharray={state.polyDone ? '0' : '5,5'}
              />
            </svg>
          )}

          {/* Polygon Drawing UI */}
          {state.polyDrawing && !state.polyDone && (
            <>
              {state.polyPts.length === 0 && (
                <div className={styles.polyInstructions}>
                  <h3>Draw Your Shape</h3>
                  <p>Tap to place points around your garden boundary. Tap near the first point to close the shape.</p>
                </div>
              )}

              {state.polyPts.map((pt, idx) => (
                <div
                  key={idx}
                  className={`${styles.polyDot} ${idx === 0 ? styles.start : styles.placed}`}
                  style={{ left: pt.x, top: pt.y }}
                >
                  {idx + 1}
                </div>
              ))}

              {state.polyPts.length >= 3 && (
                <button
                  className={`${styles.polyDoneBtn} ${styles.vis}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'FINISH_POLYGON' });
                    dispatch({ type: 'SHOW_TOAST', message: 'Shape complete! Now add plants.' });
                  }}
                >
                  Done
                </button>
              )}
            </>
          )}

          {/* Garden Labels */}
          <div className={`${styles.gLabel} ${styles.back}`}>Back</div>
          <div className={`${styles.gLabel} ${styles.front}`}>Front</div>

          {/* Hint */}
          {state.selectedPlantIdx !== null && !state.polyDrawing && !state.gardenSelected && (
            <div className={styles.hint}>
              Tap garden to place {PLANTS[state.selectedPlantIdx]?.name || 'plant'}
            </div>
          )}

          {/* Placed Plants */}
          {state.plants.map(plant => {
            const plantData = PLANTS[plant.idx];
            if (!plantData) return null;

            const pxSize = (plantData.size / 12) * FT;
            const radius = pxSize / 2;
            const isSelected = selectedPlantId === plant.id;

            return (
              <div
                key={plant.id}
                className={`${styles.plant} ${isSelected ? styles.selected : ''}`}
                style={{
                  width: pxSize,
                  height: pxSize,
                  left: plant.cx - radius,
                  top: plant.cy - radius,
                  borderColor: isSelected ? '#FFD700' : '#1B5E20',
                  boxShadow: isSelected ? '0 0 0 3px rgba(255, 215, 0, 0.5)' : undefined,
                }}
                onClick={(e) => handlePlantClick(e, plant.id)}
                onPointerDown={(e) => handlePlantDragStart(e, plant.id)}
                onPointerMove={(e) => handlePlantDragMove(e, plant.id)}
                onPointerUp={(e) => handlePlantDragEnd(e, plant.id)}
                onPointerCancel={(e) => handlePlantDragEnd(e, plant.id)}
                onDoubleClick={(e) => handlePlantDoubleClick(e, plant.id)}
              >
                <span className={styles.acr} style={{ color: '#1B5E20' }}>{plantData.acr}</span>
                {state.showPlantImages && plantData.productImg && (
                  <img
                    src={plantData.productImg}
                    alt={plantData.name}
                    style={{
                      position: 'absolute',
                      inset: 2,
                      width: 'calc(100% - 4px)',
                      height: 'calc(100% - 4px)',
                      objectFit: 'contain',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
