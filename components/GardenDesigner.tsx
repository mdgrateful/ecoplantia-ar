'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface Plant {
  sku: string;
  name: string;
  acr: string;
  size: number; // spread in inches
  img?: string;
  productImg?: string;
  isKeystone?: boolean;
  isGrass?: boolean;
}

interface PlacedPlant {
  id: string;
  sku: string;
  acr: string;
  name: string;
  x: number; // percentage of container width
  y: number; // percentage of container height
  size: number;
}

interface Props {
  photoUrl: string;
  boundaryPx: { x: number; y: number }[];
  pxPerIn: number;
  palette: Plant[];
  initialLayout?: PlacedPlant[];
  onLayoutChange?: (plants: PlacedPlant[]) => void;
  onCaptureMockup?: (dataUrl: string) => void;
}

// Plant color palette for visual distinction
const PLANT_COLORS = [
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800',
  '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
];

export default function GardenDesigner({
  photoUrl,
  boundaryPx,
  pxPerIn,
  palette,
  initialLayout = [],
  onLayoutChange,
  onCaptureMockup,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [placed, setPlaced] = useState<PlacedPlant[]>(initialLayout);
  const [selectedPlantIdx, setSelectedPlantIdx] = useState<number>(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showImages, setShowImages] = useState(false);
  const [stats, setStats] = useState({ count: 0, coverage: 0, species: 0 });

  // Load image and get dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = photoUrl;
  }, [photoUrl]);

  // Calculate stats whenever placed plants change
  useEffect(() => {
    const speciesSet = new Set(placed.map(p => p.sku));
    let totalArea = 0;
    placed.forEach(p => {
      const radius = p.size / 2;
      totalArea += Math.PI * radius * radius;
    });

    // Calculate garden area from boundary
    let gardenArea = 0;
    if (boundaryPx.length >= 3 && pxPerIn > 0) {
      // Shoelace formula for polygon area
      for (let i = 0; i < boundaryPx.length; i++) {
        const j = (i + 1) % boundaryPx.length;
        gardenArea += boundaryPx[i].x * boundaryPx[j].y;
        gardenArea -= boundaryPx[j].x * boundaryPx[i].y;
      }
      gardenArea = Math.abs(gardenArea / 2);
      // Convert from px² to in²
      gardenArea = gardenArea / (pxPerIn * pxPerIn);
    }

    const coverage = gardenArea > 0 ? Math.round((totalArea / gardenArea) * 100) : 0;

    setStats({
      count: placed.length,
      coverage: Math.min(coverage, 100),
      species: speciesSet.size,
    });

    onLayoutChange?.(placed);
  }, [placed, boundaryPx, pxPerIn, onLayoutChange]);

  // Draw boundary polygon on canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale boundary points to container size
    const scaleX = container.offsetWidth / imageDimensions.width;
    const scaleY = container.offsetHeight / imageDimensions.height;

    // Draw boundary polygon
    if (boundaryPx.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(boundaryPx[0].x * scaleX, boundaryPx[0].y * scaleY);
      for (let i = 1; i < boundaryPx.length; i++) {
        ctx.lineTo(boundaryPx[i].x * scaleX, boundaryPx[i].y * scaleY);
      }
      ctx.closePath();
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill with semi-transparent overlay
      ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
      ctx.fill();
    }
  }, [boundaryPx, imageLoaded, imageDimensions]);

  // Check if point is inside boundary polygon
  const isInsideBoundary = useCallback((x: number, y: number) => {
    if (boundaryPx.length < 3) return true;

    const container = containerRef.current;
    if (!container) return true;

    const scaleX = container.offsetWidth / imageDimensions.width;
    const scaleY = container.offsetHeight / imageDimensions.height;

    // Convert percentage to pixels
    const px = x * container.offsetWidth / 100;
    const py = y * container.offsetHeight / 100;

    // Point in polygon test
    let inside = false;
    for (let i = 0, j = boundaryPx.length - 1; i < boundaryPx.length; j = i++) {
      const xi = boundaryPx[i].x * scaleX;
      const yi = boundaryPx[i].y * scaleY;
      const xj = boundaryPx[j].x * scaleX;
      const yj = boundaryPx[j].y * scaleY;

      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }, [boundaryPx, imageDimensions]);

  // Handle click to place plant
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) return;
    if (selectedPlantIdx < 0 || selectedPlantIdx >= palette.length) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / container.offsetWidth) * 100;
    const y = ((e.clientY - rect.top) / container.offsetHeight) * 100;

    if (!isInsideBoundary(x, y)) {
      return; // Don't place outside boundary
    }

    const plant = palette[selectedPlantIdx];
    const newPlant: PlacedPlant = {
      id: `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku: plant.sku,
      acr: plant.acr,
      name: plant.name,
      x,
      y,
      size: plant.size,
    };

    setPlaced(prev => [...prev, newPlant]);
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, plantId: string) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const plant = placed.find(p => p.id === plantId);
    if (!plant) return;

    const plantX = (plant.x / 100) * container.offsetWidth;
    const plantY = (plant.y / 100) * container.offsetHeight;

    setDragOffset({
      x: clientX - rect.left - plantX,
      y: clientY - rect.top - plantY,
    });
    setDragging(plantId);
  };

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left - dragOffset.x) / container.offsetWidth) * 100;
    const y = ((clientY - rect.top - dragOffset.y) / container.offsetHeight) * 100;

    // Clamp to container bounds
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setPlaced(prev => prev.map(p =>
      p.id === dragging ? { ...p, x: clampedX, y: clampedY } : p
    ));
  }, [dragging, dragOffset]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragging(null);
  }, []);

  // Set up global drag listeners
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [dragging, handleDragMove, handleDragEnd]);

  // Delete plant on double-click
  const handleDeletePlant = (plantId: string) => {
    setPlaced(prev => prev.filter(p => p.id !== plantId));
  };

  // Get color for plant based on its index in palette
  const getPlantColor = (sku: string) => {
    const idx = palette.findIndex(p => p.sku === sku);
    return PLANT_COLORS[idx % PLANT_COLORS.length];
  };

  // Capture mockup
  const handleCaptureMockup = async () => {
    const container = containerRef.current;
    if (!container) return;

    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    });

    const dataUrl = canvas.toDataURL('image/png');
    onCaptureMockup?.(dataUrl);
  };

  // Calculate plant size in pixels based on pxPerIn
  const getPlantSizePx = (sizeIn: number) => {
    if (!containerRef.current || !imageDimensions.width) return 30;
    const scaleX = containerRef.current.offsetWidth / imageDimensions.width;
    return Math.max(20, sizeIn * pxPerIn * scaleX);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        padding: '10px',
        background: 'var(--background)',
        borderRadius: '8px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.count}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Plants</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: stats.coverage < 30 ? 'orange' : 'var(--primary)' }}>{stats.coverage}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coverage</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.species}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Species</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Plant Palette */}
        <div style={{
          width: '120px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Plant Palette</div>
          {palette.map((plant, idx) => (
            <div
              key={plant.sku}
              onClick={() => setSelectedPlantIdx(idx)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: selectedPlantIdx === idx ? `2px solid ${getPlantColor(plant.sku)}` : '2px solid var(--border)',
                background: selectedPlantIdx === idx ? 'var(--background)' : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '11px',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: getPlantColor(plant.sku),
                margin: '0 auto 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '10px',
              }}>
                {plant.acr}
              </div>
              <div style={{ fontWeight: '500' }}>{plant.name.split(' ')[0]}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                {plant.size}" spread
              </div>
            </div>
          ))}

          {/* Toggle for showing images */}
          <div
            onClick={() => setShowImages(!showImages)}
            style={{
              marginTop: '10px',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '11px',
              background: showImages ? 'var(--primary)' : 'white',
              color: showImages ? 'white' : 'var(--text)',
            }}
          >
            {showImages ? '🖼️ Images On' : '🔤 Labels'}
          </div>
        </div>

        {/* Garden Canvas */}
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          style={{
            flex: 1,
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'crosshair',
            minHeight: '400px',
            background: '#f0f0f0',
          }}
        >
          {/* Photo Background */}
          {imageLoaded && (
            <img
              src={photoUrl}
              alt="Garden"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
              draggable={false}
            />
          )}

          {/* Boundary Canvas Overlay */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />

          {/* Placed Plants */}
          {placed.map(plant => {
            const sizePx = getPlantSizePx(plant.size);
            const color = getPlantColor(plant.sku);
            return (
              <div
                key={plant.id}
                onMouseDown={(e) => handleDragStart(e, plant.id)}
                onTouchStart={(e) => handleDragStart(e, plant.id)}
                onDoubleClick={() => handleDeletePlant(plant.id)}
                style={{
                  position: 'absolute',
                  left: `${plant.x}%`,
                  top: `${plant.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  borderRadius: '50%',
                  background: showImages ? 'transparent' : color,
                  border: `2px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: dragging === plant.id ? 'grabbing' : 'grab',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  boxShadow: dragging === plant.id ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: dragging === plant.id ? 100 : 10,
                  transition: dragging === plant.id ? 'none' : 'box-shadow 0.2s',
                  overflow: 'hidden',
                }}
              >
                {showImages && palette.find(p => p.sku === plant.sku)?.productImg ? (
                  <img
                    src={palette.find(p => p.sku === plant.sku)?.productImg}
                    alt={plant.name}
                    style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                    draggable={false}
                  />
                ) : (
                  <span>{plant.acr}</span>
                )}
              </div>
            );
          })}

          {/* Instructions overlay */}
          {placed.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '20px 30px',
              borderRadius: '12px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>Click inside the boundary to place plants</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Double-click a plant to remove it</div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={() => setPlaced([])}
          className="btn-outline"
          style={{ padding: '8px 16px' }}
        >
          🗑️ Clear All
        </button>
        <button
          onClick={handleCaptureMockup}
          className="btn-secondary"
          style={{ padding: '8px 16px' }}
        >
          📸 Capture Mockup
        </button>
      </div>

      {/* Tips */}
      <div style={{
        padding: '12px',
        background: stats.coverage < 30 ? '#FFF3E0' : stats.coverage > 60 ? '#E8F5E9' : '#E3F2FD',
        borderRadius: '8px',
        fontSize: '13px',
      }}>
        {stats.count === 0 && '🌱 Start by selecting a plant from the palette and clicking in your garden area.'}
        {stats.count > 0 && stats.coverage < 30 && `⚠️ Coverage is low at ${stats.coverage}%. Add more plants for a fuller garden!`}
        {stats.count > 0 && stats.coverage >= 30 && stats.coverage < 60 && `👍 Good progress! ${stats.coverage}% coverage achieved.`}
        {stats.count > 0 && stats.coverage >= 60 && `🎉 Great coverage at ${stats.coverage}%! Your garden will look lush.`}
      </div>
    </div>
  );
}
