'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useDesigner } from '@/lib/designer-context';
import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

type MoveMode = 'single' | 'all' | 'bg';

const FT = 40;

interface PlantState {
  id: string;
  idx: number;
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  zBoost: number;
  locked: boolean;
}

interface BgFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export default function MockupPanel() {
  const { state, dispatch } = useDesigner();
  const mockAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<MoveMode>('single');
  const [bgTransform, setBgTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [bgFilters, setBgFilters] = useState<BgFilters>({ brightness: 100, contrast: 100, saturation: 100 });
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [plantStates, setPlantStates] = useState<Record<string, Partial<PlantState>>>({});
  const [mockPlants, setMockPlants] = useState<PlantState[]>([]);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);
  const [showBgEditor, setShowBgEditor] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderPreset, setRenderPreset] = useState('ecoplantia_landscape_beauty');

  // All plants adjustment state
  const [allAdjust, setAllAdjust] = useState({ brightness: 100, contrast: 100, saturation: 100 });

  // Drag state for single pointer
  const [dragState, setDragState] = useState<{
    type: 'plant' | 'bg' | null;
    id?: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    allPlantsInitial?: Record<string, { x: number; y: number }>;
  } | null>(null);

  // Multi-touch gesture state for pinch/rotate
  const [gestureState, setGestureState] = useState<{
    active: boolean;
    initialDistance: number;
    initialAngle: number;
    initialScale: number;
    initialRotation: number;
  } | null>(null);

  // Build mock plants from state
  useEffect(() => {
    if (!mockAreaRef.current) return;

    const h = mockAreaRef.current.offsetHeight;
    const w = mockAreaRef.current.offsetWidth;
    const gD = state.depthFt * FT;
    const gW = state.widthFt * FT;

    const groundLevel = h * 0.75;
    const moundHeight = h * 0.12;

    const sorted = [...state.plants].sort((a, b) => a.cy - b.cy);
    const plants = sorted.map((p) => {
      const rY = Math.max(0, Math.min(1, (p.cy - 20) / gD));
      const yBase = groundLevel - moundHeight + (rY * moundHeight);
      const pState = plantStates[p.id] || {};
      const scale = pState.scale ?? 1;
      const baseSize = 55 + rY * 15;
      const sz = baseSize * scale;
      const yP = yBase - sz;
      const rX = Math.max(0, Math.min(1, (p.cx - 20) / gW));
      const xP = w * 0.1 + rX * w * 0.8 - sz / 2;

      return {
        id: p.id,
        idx: p.idx,
        x: pState.x ?? xP,
        y: pState.y ?? yP,
        scale,
        flipX: pState.flipX ?? false,
        rotation: pState.rotation ?? 0,
        brightness: pState.brightness ?? 100,
        contrast: pState.contrast ?? 100,
        saturation: pState.saturation ?? 100,
        opacity: pState.opacity ?? 100,
        zBoost: pState.zBoost ?? 0,
        locked: pState.locked ?? false,
      };
    });

    setMockPlants(plants);
  }, [state.plants, state.widthFt, state.depthFt, plantStates]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch({ type: 'SET_PHOTO_URL', url: ev.target?.result as string });
      setBgTransform({ x: 0, y: 0, scale: 1 });
      setBgFilters({ brightness: 100, contrast: 100, saturation: 100 });
      dispatch({ type: 'SHOW_TOAST', message: 'Photo uploaded!' });
    };
    reader.readAsDataURL(file);
  };

  const updatePlantState = (id: string, updates: Partial<PlantState>) => {
    setPlantStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  // Calculate distance between two touch points
  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  // Calculate angle between two touch points
  const getAngle = (t1: React.Touch, t2: React.Touch) => {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
  };

  // Handle touch start for gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (mode !== 'all') return;

    if (e.touches.length === 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = getDistance(t1, t2);
      const angle = getAngle(t1, t2);

      // Get current average scale and rotation of all plants
      const avgScale = mockPlants.reduce((sum, p) => sum + p.scale, 0) / mockPlants.length || 1;
      const avgRotation = mockPlants.reduce((sum, p) => sum + p.rotation, 0) / mockPlants.length || 0;

      setGestureState({
        active: true,
        initialDistance: distance,
        initialAngle: angle,
        initialScale: avgScale,
        initialRotation: avgRotation,
      });
    }
  }, [mode, mockPlants]);

  // Handle touch move for gestures
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (mode !== 'all' || !gestureState?.active || e.touches.length !== 2) return;

    e.preventDefault();
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const distance = getDistance(t1, t2);
    const angle = getAngle(t1, t2);

    const scaleChange = distance / gestureState.initialDistance;
    const angleChange = angle - gestureState.initialAngle;

    const newScale = Math.max(0.3, Math.min(2.5, gestureState.initialScale * scaleChange));
    const newRotation = gestureState.initialRotation + angleChange;

    // Apply to all unlocked plants
    setPlantStates(prev => {
      const updated: Record<string, Partial<PlantState>> = {};
      mockPlants.forEach(p => {
        if (!p.locked) {
          updated[p.id] = {
            ...prev[p.id],
            scale: newScale,
            rotation: newRotation,
          };
        }
      });
      return { ...prev, ...updated };
    });
  }, [mode, gestureState, mockPlants]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setGestureState(null);
  }, []);

  // Handle pointer down for dragging
  const handlePointerDown = useCallback((e: React.PointerEvent, type: 'plant' | 'bg', id?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === 'plant' && id) {
      const plant = mockPlants.find(p => p.id === id);
      if (plant?.locked) {
        dispatch({ type: 'SHOW_TOAST', message: 'Plant is locked' });
        return;
      }
    }

    let offsetX = 0, offsetY = 0;
    let allPlantsInitial: Record<string, { x: number; y: number }> | undefined;

    if (type === 'plant' && id) {
      const plant = mockPlants.find(p => p.id === id);
      if (plant) {
        offsetX = plant.x;
        offsetY = plant.y;
      }

      if (mode === 'all') {
        allPlantsInitial = {};
        mockPlants.forEach(p => {
          if (!p.locked) {
            allPlantsInitial![p.id] = { x: p.x, y: p.y };
          }
        });
      }
    } else if (type === 'bg') {
      offsetX = bgTransform.x;
      offsetY = bgTransform.y;
    }

    setDragState({
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX,
      offsetY,
      allPlantsInitial,
    });
  }, [mockPlants, bgTransform, mode, dispatch]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (dragState.type === 'plant' && dragState.id) {
      if (mode === 'all' && dragState.allPlantsInitial) {
        setPlantStates(prev => {
          const updated: Record<string, Partial<PlantState>> = {};
          Object.entries(dragState.allPlantsInitial!).forEach(([plantId, initial]) => {
            updated[plantId] = {
              ...prev[plantId],
              x: initial.x + dx,
              y: initial.y + dy,
            };
          });
          return { ...prev, ...updated };
        });
      } else {
        updatePlantState(dragState.id, {
          x: dragState.offsetX + dx,
          y: dragState.offsetY + dy,
        });
      }
    } else if (dragState.type === 'bg') {
      setBgTransform(prev => ({
        ...prev,
        x: dragState.offsetX + dx,
        y: dragState.offsetY + dy,
      }));
    }
  }, [dragState, mode]);

  const handlePointerUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Plant controls
  const handlePlantResize = (delta: number) => {
    if (!selectedPlantId) return;
    const current = plantStates[selectedPlantId]?.scale ?? 1;
    updatePlantState(selectedPlantId, { scale: Math.max(0.3, Math.min(2.5, current + delta)) });
  };

  const handlePlantFlip = () => {
    if (!selectedPlantId) return;
    const current = plantStates[selectedPlantId]?.flipX ?? false;
    updatePlantState(selectedPlantId, { flipX: !current });
  };

  const handlePlantRotate = (delta: number) => {
    if (!selectedPlantId) return;
    const current = plantStates[selectedPlantId]?.rotation ?? 0;
    updatePlantState(selectedPlantId, { rotation: current + delta });
  };

  const handlePlantAdjust = (filter: 'brightness' | 'contrast' | 'saturation' | 'opacity', value: number) => {
    if (!selectedPlantId) return;
    updatePlantState(selectedPlantId, { [filter]: value });
  };

  // Pro tools
  const handleDuplicate = () => {
    if (!selectedPlantId) return;
    const plant = state.plants.find(p => p.id === selectedPlantId);
    if (!plant) return;

    const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({
      type: 'PLACE_PLANT',
      plant: { ...plant, id: newId, cx: plant.cx + 20, cy: plant.cy + 20 }
    });

    const pState = plantStates[selectedPlantId];
    if (pState) {
      setPlantStates(prev => ({
        ...prev,
        [newId]: { ...pState, x: (pState.x ?? 0) + 30, y: (pState.y ?? 0) + 30 }
      }));
    }
    dispatch({ type: 'SHOW_TOAST', message: 'Duplicated!' });
  };

  const handleBringToFront = () => {
    if (!selectedPlantId) return;
    const maxZ = Math.max(...mockPlants.map(p => p.zBoost), 0);
    updatePlantState(selectedPlantId, { zBoost: maxZ + 10 });
  };

  const handleSendToBack = () => {
    if (!selectedPlantId) return;
    const minZ = Math.min(...mockPlants.map(p => p.zBoost), 0);
    updatePlantState(selectedPlantId, { zBoost: minZ - 10 });
  };

  const handleToggleLock = () => {
    if (!selectedPlantId) return;
    const current = plantStates[selectedPlantId]?.locked ?? false;
    updatePlantState(selectedPlantId, { locked: !current });
    dispatch({ type: 'SHOW_TOAST', message: current ? 'Unlocked' : 'Locked' });
  };

  // All plants controls
  const handleAllResize = (delta: number) => {
    setPlantStates(prev => {
      const updated: Record<string, Partial<PlantState>> = {};
      mockPlants.forEach(p => {
        if (!p.locked) {
          const current = prev[p.id]?.scale ?? 1;
          updated[p.id] = { ...prev[p.id], scale: Math.max(0.3, Math.min(2.5, current + delta)) };
        }
      });
      return { ...prev, ...updated };
    });
  };

  const handleAllRotate = (delta: number) => {
    setPlantStates(prev => {
      const updated: Record<string, Partial<PlantState>> = {};
      mockPlants.forEach(p => {
        if (!p.locked) {
          const current = prev[p.id]?.rotation ?? 0;
          updated[p.id] = { ...prev[p.id], rotation: current + delta };
        }
      });
      return { ...prev, ...updated };
    });
  };

  const handleAllFlip = () => {
    setPlantStates(prev => {
      const updated: Record<string, Partial<PlantState>> = {};
      mockPlants.forEach(p => {
        if (!p.locked) {
          const current = prev[p.id]?.flipX ?? false;
          updated[p.id] = { ...prev[p.id], flipX: !current };
        }
      });
      return { ...prev, ...updated };
    });
  };

  const handleAllAdjustChange = (filter: 'brightness' | 'contrast' | 'saturation', value: number) => {
    setAllAdjust(prev => ({ ...prev, [filter]: value }));
    setPlantStates(prev => {
      const updated: Record<string, Partial<PlantState>> = {};
      mockPlants.forEach(p => {
        updated[p.id] = { ...prev[p.id], [filter]: value };
      });
      return { ...prev, ...updated };
    });
  };

  const handleBgFilter = (filter: keyof BgFilters, value: number) => {
    setBgFilters(prev => ({ ...prev, [filter]: value }));
  };

  const handleSaveMockup = async () => {
    const mockArea = mockAreaRef.current;
    if (!mockArea) return;

    dispatch({ type: 'SHOW_TOAST', message: 'Saving...' });

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(mockArea, { useCORS: true });
      const link = document.createElement('a');
      link.download = 'ecoplantia-mockup.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      dispatch({ type: 'SHOW_TOAST', message: 'Saved!' });
    } catch {
      dispatch({ type: 'SHOW_TOAST', message: 'Save failed' });
    }
  };

  const handleBeautyRender = async () => {
    const mockArea = mockAreaRef.current;
    if (!mockArea) return;

    setIsRendering(true);
    dispatch({ type: 'SHOW_TOAST', message: 'Generating AI render...' });

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(mockArea, { useCORS: true });
      const mockupBase64 = canvas.toDataURL('image/png');

      const response = await fetch('/api/design/beauty-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mockupBase64, preset: renderPreset }),
      });

      const data = await response.json();

      if (data.success && (data.renderUrl || data.b64_png)) {
        const imageUrl = data.renderUrl || `data:image/png;base64,${data.b64_png}`;
        dispatch({ type: 'SET_BEAUTY_RENDER', url: imageUrl });
        dispatch({ type: 'SHOW_TOAST', message: 'Render complete!' });
      } else {
        throw new Error(data.error || 'Render failed');
      }
    } catch {
      dispatch({ type: 'SHOW_TOAST', message: 'Render failed' });
    } finally {
      setIsRendering(false);
    }
  };

  const selectedPlant = mockPlants.find(p => p.id === selectedPlantId);
  const selectedPlantData = selectedPlant ? PLANTS[selectedPlant.idx] : null;

  return (
    <div
      className={styles.mockupPanel}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Mockup Canvas */}
      <div
        className={styles.mockArea}
        ref={mockAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (mode === 'single') setSelectedPlantId(null); }}
      >
        {/* Background */}
        <div
          className={styles.mockBg}
          style={{
            backgroundImage: state.photoUrl ? `url(${state.photoUrl})` : undefined,
            backgroundPosition: `calc(50% + ${bgTransform.x}px) calc(50% + ${bgTransform.y}px)`,
            backgroundSize: `${bgTransform.scale * 100}%`,
            filter: `brightness(${bgFilters.brightness}%) contrast(${bgFilters.contrast}%) saturate(${bgFilters.saturation}%)`,
            cursor: mode === 'bg' ? 'move' : 'default',
          }}
          onPointerDown={(e) => mode === 'bg' && handlePointerDown(e, 'bg')}
        />

        {/* Plants */}
        <div className={styles.mockPlants}>
          {mockPlants.map(plant => {
            const plantData = PLANTS[plant.idx];
            if (!plantData) return null;

            const baseSize = 55 + (plant.y / (mockAreaRef.current?.offsetHeight || 400)) * 15;
            const size = baseSize * plant.scale;
            const baseZ = Math.floor((plant.y / 400) * 100) + 10;
            const isSelected = selectedPlantId === plant.id;
            const isAllMode = mode === 'all';

            return (
              <div
                key={plant.id}
                className={`${styles.mPlant} ${isSelected ? styles.selected : ''} ${isAllMode ? styles.allSelected : ''} ${plant.locked ? styles.locked : ''}`}
                style={{
                  left: plant.x,
                  top: plant.y,
                  width: size,
                  height: size,
                  zIndex: baseZ + plant.zBoost,
                  transform: `scaleX(${plant.flipX ? -1 : 1}) rotate(${plant.rotation}deg)`,
                  filter: `brightness(${plant.brightness}%) contrast(${plant.contrast}%) saturate(${plant.saturation}%)`,
                  opacity: plant.opacity / 100,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (mode === 'single') {
                    setSelectedPlantId(plant.id);
                    if (!plant.locked) handlePointerDown(e, 'plant', plant.id);
                  } else if (mode === 'all') {
                    handlePointerDown(e, 'plant', plant.id);
                  }
                }}
              >
                <img src={plantData.img} alt={plantData.name} draggable={false} />
                {plant.locked && <div className={styles.lockBadge}>🔒</div>}
              </div>
            );
          })}
        </div>

        {/* Hint */}
        <div className={styles.mockHint}>
          {mode === 'single' && !selectedPlantId && 'Tap a plant to edit'}
          {mode === 'single' && selectedPlantId && 'Drag to move'}
          {mode === 'all' && 'Pinch to resize • Two fingers to rotate'}
          {mode === 'bg' && 'Drag to move background'}
        </div>
      </div>

      {/* Mode Bar */}
      <div className={styles.modeBar}>
        <button className={`${styles.modeButton} ${mode === 'single' ? styles.active : ''}`} onClick={() => { setMode('single'); setShowBgEditor(false); }}>
          <span className={styles.modeEmoji}>🌱</span>
          <span className={styles.modeLabel}>Single</span>
        </button>
        <button className={`${styles.modeButton} ${mode === 'all' ? styles.active : ''}`} onClick={() => { setMode('all'); setSelectedPlantId(null); setShowBgEditor(false); }}>
          <span className={styles.modeEmoji}>☑️</span>
          <span className={styles.modeLabel}>All</span>
        </button>
        <button className={`${styles.modeButton} ${mode === 'bg' ? styles.active : ''}`} onClick={() => { setMode('bg'); setSelectedPlantId(null); setShowBgEditor(true); }}>
          <span className={styles.modeEmoji}>🖼️</span>
          <span className={styles.modeLabel}>BG</span>
        </button>
      </div>

      {/* Single Plant Controls - Fixed at bottom, collapsible */}
      {mode === 'single' && selectedPlantId && selectedPlantData && (
        <div className={`${styles.bottomPanel} ${panelMinimized ? styles.minimized : ''}`}>
          <div className={styles.bottomPanelHeader} onClick={() => setPanelMinimized(!panelMinimized)}>
            <span className={styles.panelPlantName}>{selectedPlantData.name}</span>
            <span className={styles.minimizeBtn}>{panelMinimized ? '▲' : '▼'}</span>
          </div>

          {!panelMinimized && (
            <div className={styles.bottomPanelBody}>
              {/* Quick Tools */}
              <div className={styles.quickTools}>
                <button onClick={() => handlePlantResize(-0.15)} title="Shrink">➖</button>
                <button onClick={() => handlePlantResize(0.15)} title="Grow">➕</button>
                <button onClick={() => handlePlantRotate(-15)} title="Rotate left">↶</button>
                <button onClick={() => handlePlantRotate(15)} title="Rotate right">↷</button>
                <button onClick={handlePlantFlip} title="Flip">↔</button>
                <button onClick={handleDuplicate} title="Duplicate">📋</button>
                <button onClick={handleBringToFront} title="Front">⬆️</button>
                <button onClick={handleSendToBack} title="Back">⬇️</button>
                <button onClick={handleToggleLock} className={selectedPlant?.locked ? styles.activeTool : ''} title="Lock">{selectedPlant?.locked ? '🔒' : '🔓'}</button>
                <button onClick={() => setShowAdjustPanel(!showAdjustPanel)} className={showAdjustPanel ? styles.activeTool : ''} title="Adjust">🎨</button>
                <button onClick={() => { dispatch({ type: 'REMOVE_PLANT', id: selectedPlantId }); setSelectedPlantId(null); }} className={styles.dangerTool} title="Delete">🗑️</button>
              </div>

              {/* Adjust Panel */}
              {showAdjustPanel && (
                <div className={styles.inlineAdjust}>
                  <div className={styles.adjustRow}>
                    <span>☀️ Brightness</span>
                    <input type="range" min="50" max="150" value={selectedPlant?.brightness ?? 100} onChange={(e) => handlePlantAdjust('brightness', parseInt(e.target.value))} />
                    <span>{selectedPlant?.brightness ?? 100}%</span>
                  </div>
                  <div className={styles.adjustRow}>
                    <span>◐ Contrast</span>
                    <input type="range" min="50" max="150" value={selectedPlant?.contrast ?? 100} onChange={(e) => handlePlantAdjust('contrast', parseInt(e.target.value))} />
                    <span>{selectedPlant?.contrast ?? 100}%</span>
                  </div>
                  <div className={styles.adjustRow}>
                    <span>💧 Saturation</span>
                    <input type="range" min="0" max="200" value={selectedPlant?.saturation ?? 100} onChange={(e) => handlePlantAdjust('saturation', parseInt(e.target.value))} />
                    <span>{selectedPlant?.saturation ?? 100}%</span>
                  </div>
                  <div className={styles.adjustRow}>
                    <span>👁️ Opacity</span>
                    <input type="range" min="20" max="100" value={selectedPlant?.opacity ?? 100} onChange={(e) => handlePlantAdjust('opacity', parseInt(e.target.value))} />
                    <span>{selectedPlant?.opacity ?? 100}%</span>
                  </div>
                  <button className={styles.resetAdjust} onClick={() => updatePlantState(selectedPlantId, { brightness: 100, contrast: 100, saturation: 100, opacity: 100 })}>Reset</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Plants Controls */}
      {mode === 'all' && (
        <div className={styles.allControlBar}>
          <button onClick={() => handleAllResize(-0.1)}>➖</button>
          <button onClick={() => handleAllResize(0.1)}>➕</button>
          <button onClick={() => handleAllRotate(-15)}>↶</button>
          <button onClick={() => handleAllRotate(15)}>↷</button>
          <button onClick={handleAllFlip}>↔</button>
          <button onClick={() => setShowAdjustPanel(!showAdjustPanel)} className={showAdjustPanel ? styles.activeTool : ''}>🎨</button>
          <button onClick={() => setPlantStates({})}>⟲</button>
        </div>
      )}

      {/* All Plants Adjust - Slide up from bottom */}
      {mode === 'all' && showAdjustPanel && (
        <div className={styles.slideUpPanel}>
          <div className={styles.slideUpHeader}>
            <span>🎨 Adjust All Plants</span>
            <button onClick={() => setShowAdjustPanel(false)}>✕</button>
          </div>
          <div className={styles.slideUpBody}>
            <div className={styles.adjustRow}>
              <span>☀️ Brightness</span>
              <input type="range" min="50" max="150" value={allAdjust.brightness} onChange={(e) => handleAllAdjustChange('brightness', parseInt(e.target.value))} />
              <span>{allAdjust.brightness}%</span>
            </div>
            <div className={styles.adjustRow}>
              <span>◐ Contrast</span>
              <input type="range" min="50" max="150" value={allAdjust.contrast} onChange={(e) => handleAllAdjustChange('contrast', parseInt(e.target.value))} />
              <span>{allAdjust.contrast}%</span>
            </div>
            <div className={styles.adjustRow}>
              <span>💧 Saturation</span>
              <input type="range" min="0" max="200" value={allAdjust.saturation} onChange={(e) => handleAllAdjustChange('saturation', parseInt(e.target.value))} />
              <span>{allAdjust.saturation}%</span>
            </div>
            <button className={styles.resetAdjust} onClick={() => {
              setAllAdjust({ brightness: 100, contrast: 100, saturation: 100 });
              setPlantStates(prev => {
                const updated: Record<string, Partial<PlantState>> = {};
                mockPlants.forEach(p => { updated[p.id] = { ...prev[p.id], brightness: 100, contrast: 100, saturation: 100 }; });
                return { ...prev, ...updated };
              });
            }}>Reset All</button>
          </div>
        </div>
      )}

      {/* Background Controls */}
      {mode === 'bg' && showBgEditor && (
        <div className={styles.slideUpPanel}>
          <div className={styles.slideUpHeader}>
            <span>🖼️ Background</span>
            <button onClick={() => setShowBgEditor(false)}>✕</button>
          </div>
          <div className={styles.slideUpBody}>
            <div className={styles.bgQuickBtns}>
              <button onClick={() => setBgTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))}>Zoom -</button>
              <button onClick={() => setBgTransform(prev => ({ ...prev, scale: Math.min(2, prev.scale + 0.1) }))}>Zoom +</button>
              <button onClick={() => setBgTransform({ x: 0, y: 0, scale: 1 })}>Reset</button>
            </div>
            <div className={styles.adjustRow}>
              <span>☀️ Brightness</span>
              <input type="range" min="50" max="150" value={bgFilters.brightness} onChange={(e) => handleBgFilter('brightness', parseInt(e.target.value))} />
              <span>{bgFilters.brightness}%</span>
            </div>
            <div className={styles.adjustRow}>
              <span>◐ Contrast</span>
              <input type="range" min="50" max="150" value={bgFilters.contrast} onChange={(e) => handleBgFilter('contrast', parseInt(e.target.value))} />
              <span>{bgFilters.contrast}%</span>
            </div>
            {state.photoUrl && (
              <button className={styles.dangerBtn} onClick={() => dispatch({ type: 'SET_PHOTO_URL', url: '' })}>Remove Background</button>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <button className={styles.actionBtn} onClick={() => fileInputRef.current?.click()}>
          <span>📷</span><span>Photo</span>
        </button>
        <button className={styles.actionBtn} onClick={() => {
          setPlantStates({});
          setBgFilters({ brightness: 100, contrast: 100, saturation: 100 });
          dispatch({ type: 'SHOW_TOAST', message: 'Reset!' });
        }}>
          <span>🔄</span><span>Reset</span>
        </button>
        <button className={`${styles.actionBtn} ${styles.primaryAction}`} onClick={handleSaveMockup}>
          <span>💾</span><span>Save</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
      </div>

      {/* Beauty Render */}
      <div className={styles.beautySection}>
        <div className={styles.beautySectionHeader}>
          <span>✨ AI Render</span>
          <select value={renderPreset} onChange={(e) => setRenderPreset(e.target.value)} className={styles.presetDropdown}>
            <option value="ecoplantia_landscape_beauty">Landscape</option>
            <option value="crisp_render">Crisp</option>
            <option value="lush_soft">Lush</option>
          </select>
        </div>
        <button className={styles.beautyBtn} onClick={handleBeautyRender} disabled={isRendering || !state.photoUrl}>
          {isRendering ? '⏳ Rendering...' : '🪄 Generate'}
        </button>
        {!state.photoUrl && <p className={styles.beautyHint}>Upload photo first</p>}
        {state.beautyRenderUrl && (
          <div className={styles.beautyResult}>
            <img src={state.beautyRenderUrl} alt="Render" />
            <button className={styles.downloadBtn} onClick={() => {
              const link = document.createElement('a');
              link.download = 'ecoplantia-render.png';
              link.href = state.beautyRenderUrl!;
              link.click();
            }}>📥 Download</button>
          </div>
        )}
      </div>
    </div>
  );
}
