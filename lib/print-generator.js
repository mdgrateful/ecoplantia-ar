// ================================================
// ECOPLANTIA PRINT GENERATOR (v2)
// SVG generation for Roll-Out Garden sheets
// Includes: "EXISTING – CUT" circles for existing plants
// ================================================

/**
 * Generate print-ready SVG for roll-out sheet
 * @param {Object} params
 * @param {Array} params.bedPolygonIn - Bed boundary in inches
 * @param {Array} params.placements - Plant placements
 * @param {Array} params.existingPlants - Existing plant keep-out zones
 * @param {Object} params.skuToLabel - Map of SKU to display label
 * @param {Object} options - Generation options
 * @returns {string} - SVG string
 */
function generatePrintSVG(params, options = {}) {
  const {
    bedPolygonIn,
    placements,
    existingPlants = [],
    skuToLabel = {}
  } = params;
  
  const {
    paperWidthIn = 24,
    tile = true,
    dpi = 300,
    showBoundary = true,
    showLabels = true,
    showCrosshairs = true,
    showLegend = true,
    showTileGuides = true,
    showExistingPlants = true,
    marginIn = 0.5
  } = options;
  
  // Calculate bounds
  const bounds = getBounds(bedPolygonIn);
  const bedWidth = bounds.maxX - bounds.minX;
  const bedHeight = bounds.maxY - bounds.minY;
  
  // Determine if tiling is needed
  const needsTiling = tile && bedWidth > (paperWidthIn - marginIn * 2);
  const tileCount = needsTiling ? Math.ceil(bedWidth / (paperWidthIn - marginIn * 2 - 1)) : 1;
  
  // SVG dimensions
  const pxPerIn = dpi;
  const svgWidth = (needsTiling ? paperWidthIn : bedWidth + marginIn * 2) * pxPerIn;
  const legendHeight = showLegend ? 3 : 0;
  const svgHeight = (bedHeight + marginIn * 2 + legendHeight) * pxPerIn;
  
  // Offset to center the bed
  const offsetX = -bounds.minX;
  const offsetY = -bounds.minY;
  
  // Start SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${svgWidth}" height="${svgHeight}"
     viewBox="0 0 ${svgWidth} ${svgHeight}">
  
  <defs>
    <style>
      .bed-boundary { fill: none; stroke: #2E7D32; stroke-width: 2; stroke-dasharray: 10,5; }
      .plant-circle { fill: rgba(76, 175, 80, 0.2); stroke: #4CAF50; stroke-width: 1.5; }
      .plant-center { fill: #1B5E20; }
      .crosshair { stroke: #666; stroke-width: 0.5; }
      .plant-label { font-family: Arial, sans-serif; font-size: ${12 * pxPerIn / 72}px; fill: #333; text-anchor: middle; }
      .legend-text { font-family: Arial, sans-serif; font-size: ${10 * pxPerIn / 72}px; fill: #333; }
      .legend-title { font-family: Arial, sans-serif; font-size: ${12 * pxPerIn / 72}px; fill: #1B5E20; font-weight: bold; }
      .tile-guide { stroke: #FF5722; stroke-width: 2; stroke-dasharray: 15,10; }
      .tile-label { font-family: Arial, sans-serif; font-size: ${14 * pxPerIn / 72}px; fill: #FF5722; font-weight: bold; }
      
      /* Existing plant styles */
      .existing-circle { 
        fill: rgba(255, 152, 0, 0.1); 
        stroke: #E65100; 
        stroke-width: 3; 
        stroke-dasharray: 12,6; 
      }
      .existing-label { 
        font-family: Arial, sans-serif; 
        font-size: ${11 * pxPerIn / 72}px; 
        fill: #E65100; 
        text-anchor: middle; 
        font-weight: bold;
      }
      .scissors-icon { fill: #E65100; }
    </style>
    
    <!-- Scissors icon -->
    <symbol id="scissors" viewBox="0 0 24 24">
      <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-2z"/>
    </symbol>
  </defs>
  
  <g id="print-content" transform="translate(${marginIn * pxPerIn}, ${marginIn * pxPerIn})">
`;

  // Draw bed boundary
  if (showBoundary) {
    const pathPoints = bedPolygonIn.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${(p.x + offsetX) * pxPerIn} ${(p.y + offsetY) * pxPerIn}`
    ).join(' ') + ' Z';
    
    svg += `    <path class="bed-boundary" d="${pathPoints}" />\n`;
  }
  
  // Draw existing plants (CUT OUT circles)
  if (showExistingPlants && existingPlants.length > 0) {
    svg += `\n    <!-- EXISTING PLANTS - CUT OUT -->\n`;
    
    for (const ex of existingPlants) {
      const center = ex.centerIn || ex.center;
      if (!center) continue;
      
      const cx = (center.x + offsetX) * pxPerIn;
      const cy = (center.y + offsetY) * pxPerIn;
      const r = (ex.radiusIn || 18) * pxPerIn;
      
      // Dashed circle
      svg += `    <circle class="existing-circle" cx="${cx}" cy="${cy}" r="${r}" />\n`;
      
      // Label
      svg += `    <text class="existing-label" x="${cx}" y="${cy - 5 * pxPerIn / 72}">EXISTING</text>\n`;
      svg += `    <text class="existing-label" x="${cx}" y="${cy + 12 * pxPerIn / 72}">✂ CUT</text>\n`;
      
      // Small scissors icon
      const iconSize = 18 * pxPerIn / 72;
      svg += `    <use href="#scissors" x="${cx - iconSize/2}" y="${cy + 18 * pxPerIn / 72}" width="${iconSize}" height="${iconSize}" class="scissors-icon" />\n`;
    }
  }
  
  // Draw new plants
  svg += `\n    <!-- NEW PLANTS -->\n`;
  for (const plant of placements) {
    const cx = (plant.x + offsetX) * pxPerIn;
    const cy = (plant.y + offsetY) * pxPerIn;
    const r = plant.r * pxPerIn;
    const label = skuToLabel[plant.sku] || plant.sku.substring(0, 3).toUpperCase();
    
    // Plant circle
    svg += `    <circle class="plant-circle" cx="${cx}" cy="${cy}" r="${r}" />\n`;
    
    // Center dot
    svg += `    <circle class="plant-center" cx="${cx}" cy="${cy}" r="${3 * pxPerIn / 72}" />\n`;
    
    // Crosshairs
    if (showCrosshairs) {
      const crossSize = 6 * pxPerIn / 72;
      svg += `    <line class="crosshair" x1="${cx - crossSize}" y1="${cy}" x2="${cx + crossSize}" y2="${cy}" />\n`;
      svg += `    <line class="crosshair" x1="${cx}" y1="${cy - crossSize}" x2="${cx}" y2="${cy + crossSize}" />\n`;
    }
    
    // Label
    if (showLabels) {
      svg += `    <text class="plant-label" x="${cx}" y="${cy + r + 12 * pxPerIn / 72}">${label}</text>\n`;
    }
  }
  
  // Draw tile guides
  if (needsTiling && showTileGuides) {
    const tileWidth = (bedWidth + 1) / tileCount;
    for (let t = 1; t < tileCount; t++) {
      const tileX = (tileWidth * t - 0.5) * pxPerIn;
      svg += `    <line class="tile-guide" x1="${tileX}" y1="0" x2="${tileX}" y2="${bedHeight * pxPerIn}" />\n`;
      svg += `    <text class="tile-label" x="${tileX}" y="${-10 * pxPerIn / 72}">← Tile ${String.fromCharCode(65 + t - 1)} | Tile ${String.fromCharCode(65 + t)} →</text>\n`;
    }
  }
  
  svg += `  </g>\n`;
  
  // Legend
  if (showLegend) {
    const legendY = (bedHeight + marginIn + 0.5) * pxPerIn;
    const uniqueSkus = [...new Set(placements.map(p => p.sku))];
    
    svg += `  <g id="legend" transform="translate(${marginIn * pxPerIn}, ${legendY})">\n`;
    svg += `    <text class="legend-title" x="0" y="0">Plant Key:</text>\n`;
    
    uniqueSkus.forEach((sku, i) => {
      const label = skuToLabel[sku] || sku.substring(0, 3).toUpperCase();
      const count = placements.filter(p => p.sku === sku).length;
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = col * 150 * pxPerIn / 72;
      const y = (row + 1) * 18 * pxPerIn / 72;
      
      svg += `    <circle cx="${x + 6 * pxPerIn / 72}" cy="${y - 4 * pxPerIn / 72}" r="${6 * pxPerIn / 72}" fill="rgba(76, 175, 80, 0.3)" stroke="#4CAF50" />\n`;
      svg += `    <text class="legend-text" x="${x + 16 * pxPerIn / 72}" y="${y}">${label} = ${sku} (×${count})</text>\n`;
    });
    
    // Add existing plants to legend if present
    if (existingPlants.length > 0) {
      const existingRow = Math.floor(uniqueSkus.length / 4) + 1;
      const existingY = (existingRow + 1) * 18 * pxPerIn / 72;
      
      svg += `    <circle cx="${6 * pxPerIn / 72}" cy="${existingY - 4 * pxPerIn / 72}" r="${6 * pxPerIn / 72}" fill="rgba(255, 152, 0, 0.2)" stroke="#E65100" stroke-dasharray="3,2" />\n`;
      svg += `    <text class="legend-text" x="${16 * pxPerIn / 72}" y="${existingY}" fill="#E65100">EXISTING = Cut around these (×${existingPlants.length})</text>\n`;
    }
    
    svg += `  </g>\n`;
  }
  
  svg += `</svg>`;
  
  return svg;
}

/**
 * Generate tiled SVGs for large beds (24" tiles, vertical orientation)
 */
function generateTiledSVGs(params, options = {}) {
  const { bedPolygonIn, placements, existingPlants = [], skuToLabel = {} } = params;
  const { paperWidthIn = 24, marginIn = 0.5, overlapIn = 1 } = options;
  
  const bounds = getBounds(bedPolygonIn);
  let bedWidth = bounds.maxX - bounds.minX;
  let bedHeight = bounds.maxY - bounds.minY;
  
  // RULE: Rotate to vertical (portrait) if width > height
  const needsRotation = bedWidth > bedHeight;
  
  let workingPolygon = bedPolygonIn;
  let workingPlacements = placements;
  let workingExisting = existingPlants;
  
  if (needsRotation) {
    // Rotate 90° clockwise
    workingPolygon = bedPolygonIn.map(p => ({ x: p.y, y: -p.x }));
    workingPlacements = placements.map(p => ({ ...p, x: p.y, y: -p.x }));
    workingExisting = existingPlants.map(ex => ({
      ...ex,
      centerIn: ex.centerIn ? { x: ex.centerIn.y, y: -ex.centerIn.x } : null
    }));
    
    // Recalculate bounds after rotation
    const newBounds = getBounds(workingPolygon);
    bedWidth = newBounds.maxX - newBounds.minX;
    bedHeight = newBounds.maxY - newBounds.minY;
    
    // Shift to positive coordinates
    const shiftX = -newBounds.minX;
    const shiftY = -newBounds.minY;
    workingPolygon = workingPolygon.map(p => ({ x: p.x + shiftX, y: p.y + shiftY }));
    workingPlacements = workingPlacements.map(p => ({ ...p, x: p.x + shiftX, y: p.y + shiftY }));
    workingExisting = workingExisting.map(ex => ({
      ...ex,
      centerIn: ex.centerIn ? { x: ex.centerIn.x + shiftX, y: ex.centerIn.y + shiftY } : null
    }));
  }
  
  const usableWidth = paperWidthIn - marginIn * 2;
  
  if (bedWidth <= usableWidth) {
    // No tiling needed
    return [{
      tile: 'A',
      rotated: needsRotation,
      svg: generatePrintSVG(
        { bedPolygonIn: workingPolygon, placements: workingPlacements, existingPlants: workingExisting, skuToLabel },
        { ...options, tile: false }
      )
    }];
  }
  
  // Calculate tiles
  const tileWidth = usableWidth - overlapIn;
  const tileCount = Math.ceil(bedWidth / tileWidth);
  const tiles = [];
  
  for (let t = 0; t < tileCount; t++) {
    const tileStartX = t * tileWidth;
    const tileEndX = tileStartX + usableWidth;
    
    // Filter placements for this tile
    const tilePlacements = workingPlacements.filter(p => 
      p.x >= tileStartX - p.r && p.x <= tileEndX + p.r
    ).map(p => ({
      ...p,
      x: p.x - tileStartX
    }));
    
    // Filter existing plants for this tile
    const tileExisting = workingExisting.filter(ex => {
      if (!ex.centerIn) return false;
      const r = ex.radiusIn || 18;
      return ex.centerIn.x >= tileStartX - r && ex.centerIn.x <= tileEndX + r;
    }).map(ex => ({
      ...ex,
      centerIn: { x: ex.centerIn.x - tileStartX, y: ex.centerIn.y }
    }));
    
    // Clip polygon to tile
    const tilePolygon = clipPolygonToTile(workingPolygon, tileStartX, tileEndX);
    const offsetPolygon = tilePolygon.map(p => ({ x: p.x - tileStartX, y: p.y }));
    
    const tileSVG = generatePrintSVG(
      { bedPolygonIn: offsetPolygon, placements: tilePlacements, existingPlants: tileExisting, skuToLabel },
      { ...options, tile: false, showTileGuides: false, paperWidthIn }
    );
    
    tiles.push({
      tile: String.fromCharCode(65 + t),
      rotated: needsRotation,
      startX: tileStartX,
      endX: Math.min(tileEndX, bedWidth),
      svg: tileSVG
    });
  }
  
  return tiles;
}

/**
 * Clip polygon to tile boundaries
 */
function clipPolygonToTile(polygon, minX, maxX) {
  const clipped = [];
  
  for (let i = 0; i < polygon.length; i++) {
    const curr = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    
    const currIn = curr.x >= minX && curr.x <= maxX;
    const nextIn = next.x >= minX && next.x <= maxX;
    
    if (currIn) {
      clipped.push({ x: Math.max(minX, Math.min(maxX, curr.x)), y: curr.y });
    }
    
    if (currIn !== nextIn) {
      const boundaryX = currIn ? (next.x < minX ? minX : maxX) : (curr.x < minX ? minX : maxX);
      const t = (boundaryX - curr.x) / (next.x - curr.x);
      const intersectY = curr.y + t * (next.y - curr.y);
      clipped.push({ x: boundaryX, y: intersectY });
    }
  }
  
  return clipped;
}

/**
 * Get bounds of polygon
 */
function getBounds(polygon) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (const p of polygon) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  
  return { minX, maxX, minY, maxY };
}

/**
 * Generate overlay data for canvas/beauty render
 */
function generateOverlayData(params) {
  const { 
    bedPolygonPx, 
    placements, 
    existingPlants = [],
    pxPerIn,
    skuToColor = {}
  } = params;
  
  // Convert placements to pixel coordinates
  const placementsPx = placements.map(p => ({
    x: p.x * pxPerIn,
    y: p.y * pxPerIn,
    r: p.r * pxPerIn,
    sku: p.sku,
    color: skuToColor[p.sku] || '#4CAF50'
  }));
  
  // Convert existing plants to pixel coordinates
  const existingPx = existingPlants.map(ex => ({
    ...ex,
    centerPx: ex.centerIn ? {
      x: ex.centerIn.x * pxPerIn,
      y: ex.centerIn.y * pxPerIn
    } : null,
    radiusPx: (ex.radiusIn || 18) * pxPerIn
  }));
  
  return {
    boundary: bedPolygonPx,
    plants: placementsPx,
    existingPlants: existingPx,
    style: {
      boundaryColor: 'rgba(46, 125, 50, 0.6)',
      boundaryWidth: 3,
      plantFill: 'rgba(76, 175, 80, 0.4)',
      plantStroke: '#4CAF50',
      plantStrokeWidth: 2,
      existingFill: 'rgba(255, 152, 0, 0.2)',
      existingStroke: '#E65100',
      existingStrokeWidth: 3,
      existingDash: [10, 5]
    }
  };
}

// Export for Node.js / Vercel
module.exports = {
  generatePrintSVG,
  generateTiledSVGs,
  generateOverlayData,
  getBounds
};
