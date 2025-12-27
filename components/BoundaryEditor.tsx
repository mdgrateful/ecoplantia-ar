'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface BoundaryEditorProps {
  photoUrl: string;
  onComplete: (data: {
    boundaryPx: Point[];
    pxPerIn: number;
    bedAreaSqft: number;
  }) => void;
  onCancel: () => void;
}

type Mode = 'boundary' | 'scale' | 'done';

export default function BoundaryEditor({ photoUrl, onComplete, onCancel }: BoundaryEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [mode, setMode] = useState<Mode>('boundary');
  const [boundaryPoints, setBoundaryPoints] = useState<Point[]>([]);
  const [scalePoints, setScalePoints] = useState<Point[]>([]);
  const [scaleDistance, setScaleDistance] = useState<string>('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Load image and set up canvas
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ width: img.width, height: img.height });

      // Calculate scale to fit container
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        const scaleX = containerWidth / img.width;
        const scaleY = maxHeight / img.height;
        const newScale = Math.min(scaleX, scaleY, 1);

        setScale(newScale);
        setCanvasSize({
          width: img.width * newScale,
          height: img.height * newScale,
        });
      }
    };
    img.src = photoUrl;
  }, [photoUrl]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);

    // Draw boundary polygon
    if (boundaryPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(boundaryPoints[0].x, boundaryPoints[0].y);
      for (let i = 1; i < boundaryPoints.length; i++) {
        ctx.lineTo(boundaryPoints[i].x, boundaryPoints[i].y);
      }
      if (boundaryPoints.length > 2) {
        ctx.closePath();
      }
      ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw points
      boundaryPoints.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = mode === 'boundary' ? '#4CAF50' : '#888';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Point number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), point.x, point.y);
      });
    }

    // Draw scale line
    if (mode === 'scale' && scalePoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(scalePoints[0].x, scalePoints[0].y);
      if (scalePoints.length > 1) {
        ctx.lineTo(scalePoints[1].x, scalePoints[1].y);
      }
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw scale points
      scalePoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FF9800';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [boundaryPoints, scalePoints, canvasSize, mode]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Find if clicking near a point
  const findNearPoint = (pos: Point, points: Point[]): number => {
    const threshold = 15;
    for (let i = 0; i < points.length; i++) {
      const dx = points[i].x - pos.x;
      const dy = points[i].y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        return i;
      }
    }
    return -1;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (mode === 'boundary') {
      const nearIdx = findNearPoint(pos, boundaryPoints);
      if (nearIdx >= 0) {
        setDragIndex(nearIdx);
      } else {
        setBoundaryPoints([...boundaryPoints, pos]);
      }
    } else if (mode === 'scale') {
      if (scalePoints.length < 2) {
        setScalePoints([...scalePoints, pos]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragIndex !== null && mode === 'boundary') {
      const pos = getMousePos(e);
      const newPoints = [...boundaryPoints];
      newPoints[dragIndex] = pos;
      setBoundaryPoints(newPoints);
    }
  };

  const handleMouseUp = () => {
    setDragIndex(null);
  };

  // Remove last point
  const handleUndo = () => {
    if (mode === 'boundary' && boundaryPoints.length > 0) {
      setBoundaryPoints(boundaryPoints.slice(0, -1));
    } else if (mode === 'scale') {
      setScalePoints([]);
    }
  };

  // Calculate area of polygon in pixels
  const calculateAreaPx = (points: Point[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
  };

  // Calculate distance between two points
  const calculateDistancePx = (p1: Point, p2: Point): number => {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  };

  // Proceed to scale mode
  const handleProceedToScale = () => {
    if (boundaryPoints.length >= 3) {
      setMode('scale');
    }
  };

  // Complete the process
  const handleComplete = () => {
    if (scalePoints.length !== 2 || !scaleDistance) return;

    const distanceIn = parseFloat(scaleDistance);
    if (isNaN(distanceIn) || distanceIn <= 0) return;

    // Calculate pixels per inch
    const distancePx = calculateDistancePx(scalePoints[0], scalePoints[1]);
    const pxPerIn = distancePx / distanceIn / scale; // Account for canvas scaling

    // Convert boundary points back to original image coordinates
    const originalBoundaryPx = boundaryPoints.map(p => ({
      x: p.x / scale,
      y: p.y / scale,
    }));

    // Calculate area in square inches, then square feet
    const areaPx = calculateAreaPx(originalBoundaryPx);
    const areaSqIn = areaPx / (pxPerIn * pxPerIn);
    const bedAreaSqft = areaSqIn / 144;

    onComplete({
      boundaryPx: originalBoundaryPx,
      pxPerIn,
      bedAreaSqft,
    });
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Instructions */}
      <div style={{
        background: mode === 'boundary' ? '#E8F5E9' : '#FFF3E0',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
      }}>
        {mode === 'boundary' && (
          <>
            <strong>Step 1: Trace Your Garden Bed</strong>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>
              Click on the photo to add points around your garden bed. Drag points to adjust.
              Add at least 3 points to form a shape.
            </p>
          </>
        )}
        {mode === 'scale' && (
          <>
            <strong>Step 2: Set Scale</strong>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>
              Click two points on something with a known length (e.g., a fence post, stepping stone, or measuring tape).
              Then enter the distance between them.
            </p>
          </>
        )}
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: dragIndex !== null ? 'grabbing' : 'crosshair',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
      </div>

      {/* Scale Input */}
      {mode === 'scale' && scalePoints.length === 2 && (
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <label>Distance between orange points:</label>
          <input
            type="number"
            value={scaleDistance}
            onChange={(e) => setScaleDistance(e.target.value)}
            placeholder="inches"
            min="1"
            style={{ width: '80px' }}
          />
          <span>inches</span>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        marginBottom: '16px',
        fontSize: '14px',
        color: '#666',
      }}>
        <span>Points: {boundaryPoints.length}</span>
        {boundaryPoints.length >= 3 && (
          <span>
            Estimated Area: ~{(calculateAreaPx(boundaryPoints) / (scale * scale) / 10000).toFixed(1)} sq ft
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>(adjust with scale)</span>
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onCancel} className="btn-outline">
          Cancel
        </button>
        <button onClick={handleUndo} className="btn-outline" disabled={
          (mode === 'boundary' && boundaryPoints.length === 0) ||
          (mode === 'scale' && scalePoints.length === 0)
        }>
          Undo
        </button>

        {mode === 'boundary' && (
          <button
            onClick={handleProceedToScale}
            disabled={boundaryPoints.length < 3}
          >
            Next: Set Scale ({boundaryPoints.length}/3+ points)
          </button>
        )}

        {mode === 'scale' && (
          <>
            <button onClick={() => setMode('boundary')} className="btn-outline">
              Back to Boundary
            </button>
            <button
              onClick={handleComplete}
              disabled={scalePoints.length !== 2 || !scaleDistance}
            >
              Complete Setup
            </button>
          </>
        )}
      </div>
    </div>
  );
}
