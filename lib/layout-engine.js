// ================================================
// ECOPLANTIA LAYOUT ENGINE (v2)
// Polygon fill with hex grid plant placement
// Includes: Keep-out zones for existing plants
// ================================================

/**
 * Check if a point is inside a polygon using ray casting
 */
function pointInPolygon(x, y, polygon) {
  let inside = false;
  const n = polygon.length;
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Calculate distance between two points
 */
function distance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Calculate distance from point to nearest polygon edge
 */
function distanceToPolygonEdge(x, y, polygon) {
  let minDist = Infinity;
  const n = polygon.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dist = distanceToLineSegment(x, y, polygon[i].x, polygon[i].y, polygon[j].x, polygon[j].y);
    minDist = Math.min(minDist, dist);
  }
  
  return minDist;
}

/**
 * Distance from point to line segment
 */
function distanceToLineSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  
  if (lengthSq === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }
  
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  
  const nearX = x1 + t * dx;
  const nearY = y1 + t * dy;
  
  return Math.sqrt((px - nearX) ** 2 + (py - nearY) ** 2);
}

/**
 * Calculate polygon bounding box
 */
function getPolygonBounds(polygon) {
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
 * Calculate polygon area using shoelace formula
 */
function calculatePolygonArea(polygon) {
  let area = 0;
  const n = polygon.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  
  return Math.abs(area) / 2;
}

/**
 * Convert pixel boundary to inches using scale factor
 */
function convertBoundaryToInches(boundaryPx, pxPerIn) {
  return boundaryPx.map(p => ({
    x: p.x / pxPerIn,
    y: p.y / pxPerIn
  }));
}

/**
 * Check if a point is inside any keep-out zone (existing plant)
 * @param {number} x - Point X in inches
 * @param {number} y - Point Y in inches
 * @param {Array} existingPlants - Array of existing plant objects
 * @param {number} newPlantRadius - Radius of the new plant being placed
 * @returns {boolean} - True if point is blocked by an existing plant
 */
function isInKeepOutZone(x, y, existingPlants, newPlantRadius = 0) {
  if (!existingPlants || existingPlants.length === 0) return false;
  
  for (const ex of existingPlants) {
    const center = ex.centerIn || ex.center;
    if (!center) continue;
    
    const dist = distance({ x, y }, center);
    const keepOutRadius = (ex.radiusIn || 18) + (ex.bufferIn || 2) + newPlantRadius;
    
    if (dist < keepOutRadius) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate hex grid points within polygon, respecting keep-out zones
 */
function generateHexGrid(polygon, spacing, edgeMargin = 1, jitter = 0, existingPlants = []) {
  const points = [];
  const bounds = getPolygonBounds(polygon);
  
  // Hex grid parameters
  const rowHeight = spacing * Math.sqrt(3) / 2;
  
  let row = 0;
  for (let y = bounds.minY; y <= bounds.maxY; y += rowHeight) {
    const xOffset = (row % 2) * (spacing / 2);
    
    for (let x = bounds.minX + xOffset; x <= bounds.maxX; x += spacing) {
      // Apply jitter
      let px = x;
      let py = y;
      
      if (jitter > 0) {
        px += (Math.random() - 0.5) * spacing * jitter;
        py += (Math.random() - 0.5) * spacing * jitter;
      }
      
      // Check if point is inside polygon with edge margin
      if (pointInPolygon(px, py, polygon)) {
        const edgeDist = distanceToPolygonEdge(px, py, polygon);
        if (edgeDist >= edgeMargin) {
          // Check if point is NOT in a keep-out zone
          if (!isInKeepOutZone(px, py, existingPlants, spacing / 2)) {
            points.push({ x: px, y: py });
          }
        }
      }
    }
    row++;
  }
  
  return points;
}

/**
 * Generate plant slots at multiple spacing levels, respecting keep-out zones
 */
function generatePlantSlots(polygon, spacingConfig = {}, existingPlants = []) {
  const defaultConfig = {
    anchor: { spacing: 24, percentage: 0.15, edgeMargin: 2 },
    mid: { spacing: 18, percentage: 0.50, edgeMargin: 1.5 },
    filler: { spacing: 14, percentage: 0.25, edgeMargin: 1 },
    grass: { spacing: 18, percentage: 0.10, edgeMargin: 1.5 }
  };
  
  const config = { ...defaultConfig, ...spacingConfig };
  const allSlots = [];
  const usedPoints = [];
  
  // Process from largest spacing to smallest
  const roles = ['anchor', 'mid', 'grass', 'filler'];
  
  for (const role of roles) {
    const roleConfig = config[role];
    if (!roleConfig) continue;
    
    const gridPoints = generateHexGrid(
      polygon,
      roleConfig.spacing,
      roleConfig.edgeMargin,
      0.15, // Slight jitter for natural look
      existingPlants // Pass existing plants to respect keep-out zones
    );
    
    // Filter points that are too close to already used points
    const minDist = roleConfig.spacing * 0.75;
    
    for (const point of gridPoints) {
      const tooClose = usedPoints.some(used => {
        const dist = Math.sqrt((point.x - used.x) ** 2 + (point.y - used.y) ** 2);
        return dist < minDist;
      });
      
      if (!tooClose) {
        allSlots.push({
          x: point.x,
          y: point.y,
          role,
          spacing: roleConfig.spacing
        });
        usedPoints.push(point);
      }
    }
  }
  
  return allSlots;
}

/**
 * Assign plants to slots based on palette and constraints
 */
function assignPlantsToSlots(slots, palette, options = {}) {
  const {
    minSameSpeciesDistance = 1.5,
    groupSize = 3,
    style = 'wild'
  } = options;
  
  const placements = [];
  const paletteByRole = {};
  
  // Group palette by role
  for (const plant of palette) {
    const role = plant.role || 'mid';
    if (!paletteByRole[role]) paletteByRole[role] = [];
    paletteByRole[role].push(plant);
  }
  
  const allPlants = [...palette];
  
  // Sort slots for orderly style (back to front by Y)
  let sortedSlots = [...slots];
  if (style === 'orderly') {
    sortedSlots.sort((a, b) => a.y - b.y);
  } else {
    sortedSlots = shuffleArray(sortedSlots);
  }
  
  // Assign plants to slots
  for (const slot of sortedSlots) {
    let candidates = paletteByRole[slot.role] || allPlants;
    if (candidates.length === 0) candidates = allPlants;
    
    // Filter candidates that aren't too close to same species
    const validCandidates = candidates.filter(plant => {
      const minDist = (plant.spacingIn || slot.spacing) * minSameSpeciesDistance;
      
      const tooClose = placements.some(p => {
        if (p.sku !== plant.sku) return false;
        const dist = Math.sqrt((slot.x - p.x) ** 2 + (slot.y - p.y) ** 2);
        return dist < minDist;
      });
      
      return !tooClose;
    });
    
    const pickFrom = validCandidates.length > 0 ? validCandidates : candidates;
    const plant = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    
    placements.push({
      x: Math.round(slot.x * 10) / 10,
      y: Math.round(slot.y * 10) / 10,
      sku: plant.sku,
      r: (plant.spacingIn || slot.spacing) / 2
    });
  }
  
  return placements;
}

/**
 * Count plants by SKU
 */
function countPlantsBySku(placements) {
  const counts = {};
  for (const p of placements) {
    counts[p.sku] = (counts[p.sku] || 0) + 1;
  }
  return counts;
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Main layout generation function
 * @param {Object} params
 * @param {Array<{x: number, y: number}>} params.boundaryPx - Boundary in pixels
 * @param {number} params.pxPerIn - Scale factor
 * @param {Array} params.palette - Plant palette
 * @param {string} params.style - 'wild' or 'orderly'
 * @param {Array} params.existingPlants - Existing plant keep-out zones
 * @returns {Object}
 */
function generateLayout(params) {
  const {
    boundaryPx,
    pxPerIn,
    palette,
    style = 'wild',
    existingPlants = []
  } = params;
  
  // Convert boundary to inches
  const boundaryIn = convertBoundaryToInches(boundaryPx, pxPerIn);
  
  // Calculate area
  const areaInSq = calculatePolygonArea(boundaryIn);
  const areaSqft = areaInSq / 144;
  
  // Calculate area occupied by existing plants
  let existingAreaSqIn = 0;
  for (const ex of existingPlants) {
    const r = ex.radiusIn || 18;
    existingAreaSqIn += Math.PI * r * r;
  }
  const existingAreaSqft = existingAreaSqIn / 144;
  const plantableAreaSqft = areaSqft - existingAreaSqft;
  
  // Generate slots (respecting keep-out zones)
  const slots = generatePlantSlots(boundaryIn, {}, existingPlants);
  
  // Assign plants
  const placements = assignPlantsToSlots(slots, palette, { style });
  
  // Count
  const counts = countPlantsBySku(placements);
  
  return {
    units: 'in',
    bedPolygonIn: boundaryIn,
    placements,
    counts,
    bedAreaSqft: Math.round(areaSqft * 10) / 10,
    existingAreaSqft: Math.round(existingAreaSqft * 10) / 10,
    plantableAreaSqft: Math.round(plantableAreaSqft * 10) / 10,
    totalPlants: placements.length,
    existingPlantsCount: existingPlants.length
  };
}

/**
 * Calculate scale from length/width input
 */
function calculateScaleFromDimensions(boundaryPx, lengthIn, widthIn) {
  const bounds = getPolygonBounds(boundaryPx);
  const pxWidth = bounds.maxX - bounds.minX;
  const pxHeight = bounds.maxY - bounds.minY;
  
  const pxPerInFromLength = pxHeight / lengthIn;
  const pxPerInFromWidth = pxWidth / widthIn;
  
  const pxPerIn = (pxPerInFromLength + pxPerInFromWidth) / 2;
  
  const boundaryIn = convertBoundaryToInches(boundaryPx, pxPerIn);
  const areaInSq = calculatePolygonArea(boundaryIn);
  const bedAreaSqft = areaInSq / 144;
  
  return {
    pxPerIn: Math.round(pxPerIn * 100) / 100,
    bedAreaSqft: Math.round(bedAreaSqft * 10) / 10
  };
}

/**
 * Calculate scale from two-point measurement
 */
function calculateScaleFromTwoPoints(point1, point2, distanceIn, boundaryPx) {
  const pxDistance = Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
  const pxPerIn = pxDistance / distanceIn;
  
  const boundaryIn = convertBoundaryToInches(boundaryPx, pxPerIn);
  const areaInSq = calculatePolygonArea(boundaryIn);
  const bedAreaSqft = areaInSq / 144;
  
  return {
    pxPerIn: Math.round(pxPerIn * 100) / 100,
    bedAreaSqft: Math.round(bedAreaSqft * 10) / 10
  };
}

/**
 * Convert existing plants from pixel coords to inches
 */
function convertExistingPlantsToInches(existingPlantsPx, pxPerIn) {
  return existingPlantsPx.map(ex => ({
    ...ex,
    centerIn: ex.centerPx ? {
      x: ex.centerPx.x / pxPerIn,
      y: ex.centerPx.y / pxPerIn
    } : ex.centerIn,
    radiusIn: ex.radiusPx ? ex.radiusPx / pxPerIn : (ex.radiusIn || 18)
  }));
}

// Export for Node.js / Vercel
module.exports = {
  pointInPolygon,
  distance,
  distanceToPolygonEdge,
  getPolygonBounds,
  calculatePolygonArea,
  convertBoundaryToInches,
  isInKeepOutZone,
  generateHexGrid,
  generatePlantSlots,
  assignPlantsToSlots,
  countPlantsBySku,
  generateLayout,
  calculateScaleFromDimensions,
  calculateScaleFromTwoPoints,
  convertExistingPlantsToInches
};
