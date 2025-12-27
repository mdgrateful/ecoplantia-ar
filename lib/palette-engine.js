// ================================================
// ECOPLANTIA PALETTE SELECTION ENGINE
// Smart plant selection based on preferences
// ================================================

/**
 * Score a plant against user preferences
 * @param {Object} plant - Plant from product_map
 * @param {Object} preferences - User preferences
 * @returns {number} - Score (higher is better)
 */
function scorePlant(plant, preferences) {
  let score = 0;
  
  const { sun, style, heightPref, mustInclude = [] } = preferences;
  
  // Sun compatibility (+3)
  if (sun === 'full_sun' && plant.sun_full) score += 3;
  else if (sun === 'part_sun' && plant.sun_part) score += 3;
  else if (sun === 'shade' && plant.sun_shade) score += 3;
  else if (plant.sun_part) score += 1; // Part sun is versatile
  
  // Style match (+2)
  if (style === 'pollinator' && plant.is_keystone) score += 3;
  if (style === 'pollinator' && plant.bloom_months?.length > 2) score += 1;
  if (style === 'tidy' && !plant.warnings?.includes('spreads')) score += 2;
  if (style === 'tidy' && plant.is_grass) score += 1;
  if (style === 'color' && plant.color_primary && plant.color_primary !== '#EDEDED') score += 2;
  if (style === 'low_maint' && plant.sun_full) score += 1;
  
  // Height preference (+2)
  const avgHeight = ((plant.height_min_in || 18) + (plant.height_max_in || 30)) / 2;
  if (heightPref === 'low' && avgHeight <= 24) score += 2;
  else if (heightPref === 'mixed') score += 1;
  else if (heightPref === 'tall' && avgHeight >= 30) score += 2;
  
  // Keystone bonus (+2)
  if (plant.is_keystone) score += 2;
  
  // Must-include match (+5)
  if (mustInclude.includes('milkweed') && plant.scientific_name?.includes('Asclepias')) score += 5;
  if (mustInclude.includes('grasses') && (plant.is_grass || plant.is_sedge)) score += 5;
  if (mustInclude.includes('asters') && plant.scientific_name?.includes('Symphyotrichum')) score += 5;
  if (mustInclude.includes('goldenrod') && plant.scientific_name?.includes('Solidago')) score += 5;
  
  // Active/in-stock bonus (+3) / penalty (-10)
  if (plant.active && plant.in_stock) score += 3;
  else if (!plant.active) score -= 10;
  else if (!plant.in_stock) score -= 5;
  
  // Regional match (+1)
  // TODO: Check ecoregion match
  
  return score;
}

/**
 * Select optimal plant palette
 * @param {Array<Object>} availablePlants - All plants from product_map
 * @param {Object} preferences - User preferences
 * @param {Object} options - Selection options
 * @returns {Array<{sku: string, name: string, role: string, spacingIn: number}>}
 */
function selectPalette(availablePlants, preferences, options = {}) {
  const {
    targetCount = 8,       // Target 8-10 species
    maxCount = 10,
    minKeystones = 1,
    minGrasses = 1,
    maxPerGenus = 2,
    minBloomSeasons = 2
  } = options;
  
  // Filter to active plants only
  const activePlants = availablePlants.filter(p => p.active !== false);
  
  // Score all plants
  const scoredPlants = activePlants.map(plant => ({
    ...plant,
    score: scorePlant(plant, preferences)
  }));
  
  // Sort by score descending
  scoredPlants.sort((a, b) => b.score - a.score);
  
  // Selection with constraints
  const selected = [];
  const genusCounts = {};
  let keystoneCount = 0;
  let grassCount = 0;
  const bloomSeasons = new Set();
  
  // Helper to get genus from scientific name
  const getGenus = (name) => name?.split(' ')[0] || 'Unknown';
  
  // Helper to get bloom seasons
  const getSeasons = (months) => {
    const seasons = new Set();
    if (!months) return seasons;
    months.forEach(m => {
      if (m >= 3 && m <= 5) seasons.add('spring');
      else if (m >= 6 && m <= 8) seasons.add('summer');
      else if (m >= 9 && m <= 11) seasons.add('fall');
    });
    return seasons;
  };
  
  // First pass: Ensure we meet minimums
  // Add keystones first
  for (const plant of scoredPlants) {
    if (selected.length >= maxCount) break;
    if (!plant.is_keystone) continue;
    if (keystoneCount >= 2) continue; // Cap at 2 keystones
    
    const genus = getGenus(plant.scientific_name);
    if ((genusCounts[genus] || 0) >= maxPerGenus) continue;
    
    selected.push(plant);
    genusCounts[genus] = (genusCounts[genus] || 0) + 1;
    keystoneCount++;
    getSeasons(plant.bloom_months).forEach(s => bloomSeasons.add(s));
  }
  
  // Add grasses
  for (const plant of scoredPlants) {
    if (selected.length >= maxCount) break;
    if (!(plant.is_grass || plant.is_sedge)) continue;
    if (grassCount >= 2) continue;
    if (selected.find(p => p.sku === plant.sku)) continue;
    
    selected.push(plant);
    grassCount++;
    getSeasons(plant.bloom_months).forEach(s => bloomSeasons.add(s));
  }
  
  // Fill remaining slots with highest-scored plants
  for (const plant of scoredPlants) {
    if (selected.length >= targetCount) break;
    if (selected.find(p => p.sku === plant.sku)) continue;
    
    const genus = getGenus(plant.scientific_name);
    if ((genusCounts[genus] || 0) >= maxPerGenus) continue;
    
    selected.push(plant);
    genusCounts[genus] = (genusCounts[genus] || 0) + 1;
    getSeasons(plant.bloom_months).forEach(s => bloomSeasons.add(s));
  }
  
  // Check bloom season diversity - add more if needed
  if (bloomSeasons.size < minBloomSeasons && selected.length < maxCount) {
    const neededSeasons = ['spring', 'summer', 'fall'].filter(s => !bloomSeasons.has(s));
    
    for (const season of neededSeasons) {
      if (selected.length >= maxCount) break;
      
      const seasonPlant = scoredPlants.find(p => {
        if (selected.find(s => s.sku === p.sku)) return false;
        const seasons = getSeasons(p.bloom_months);
        return seasons.has(season);
      });
      
      if (seasonPlant) {
        selected.push(seasonPlant);
        bloomSeasons.add(season);
      }
    }
  }
  
  // Format output
  return selected.map(plant => ({
    sku: plant.sku,
    name: plant.name,
    scientificName: plant.scientific_name,
    role: plant.role || determineRole(plant),
    spacingIn: plant.spacing_in || 18,
    heightMin: plant.height_min_in,
    heightMax: plant.height_max_in,
    bloomMonths: plant.bloom_months,
    color: plant.color_primary,
    isKeystone: plant.is_keystone,
    isGrass: plant.is_grass || plant.is_sedge,
    score: plant.score
  }));
}

/**
 * Determine plant role based on characteristics
 * @param {Object} plant
 * @returns {string} - 'anchor' | 'mid' | 'filler' | 'grass'
 */
function determineRole(plant) {
  if (plant.is_grass || plant.is_sedge) return 'grass';
  
  const avgHeight = ((plant.height_min_in || 18) + (plant.height_max_in || 30)) / 2;
  
  if (plant.is_keystone || avgHeight >= 36) return 'anchor';
  if (avgHeight <= 18) return 'filler';
  return 'mid';
}

/**
 * Adjust palette for style variants
 * @param {Array} basePalette - Current palette
 * @param {Array} allPlants - All available plants
 * @param {string} adjustment - 'tidier' | 'more_color' | 'more_native' | 'more_evergreen'
 * @returns {Array} - Adjusted palette
 */
function adjustPalette(basePalette, allPlants, adjustment) {
  const currentSkus = new Set(basePalette.map(p => p.sku));
  let adjustedPalette = [...basePalette];
  
  switch (adjustment) {
    case 'tidier':
      // Prefer plants that don't spread aggressively
      // Replace 1-2 spreaders with compact plants
      const spreaders = adjustedPalette.filter(p => 
        allPlants.find(ap => ap.sku === p.sku)?.warnings?.includes('spread')
      );
      if (spreaders.length > 0) {
        const compact = allPlants.filter(p => 
          !currentSkus.has(p.sku) && 
          !p.warnings?.includes('spread') &&
          p.active
        ).slice(0, spreaders.length);
        
        spreaders.forEach((s, i) => {
          if (compact[i]) {
            const idx = adjustedPalette.findIndex(p => p.sku === s.sku);
            adjustedPalette[idx] = formatPlantForPalette(compact[i]);
          }
        });
      }
      break;
      
    case 'more_color':
      // Add/replace with more colorful bloomers
      const colorful = allPlants.filter(p =>
        !currentSkus.has(p.sku) &&
        p.active &&
        p.color_primary &&
        !['#EDEDED', '#FFFFFF', '#808080'].includes(p.color_primary)
      ).slice(0, 2);
      
      if (colorful.length > 0) {
        // Replace least colorful
        const lessColorful = adjustedPalette.filter(p => 
          !p.color || ['#EDEDED', '#FFFFFF'].includes(p.color)
        );
        lessColorful.slice(0, colorful.length).forEach((lc, i) => {
          if (colorful[i]) {
            const idx = adjustedPalette.findIndex(p => p.sku === lc.sku);
            adjustedPalette[idx] = formatPlantForPalette(colorful[i]);
          }
        });
      }
      break;
      
    case 'more_native':
      // Boost keystone species
      const keystones = allPlants.filter(p =>
        !currentSkus.has(p.sku) &&
        p.is_keystone &&
        p.active
      ).slice(0, 2);
      
      const nonKeystones = adjustedPalette.filter(p => !p.isKeystone);
      nonKeystones.slice(0, keystones.length).forEach((nk, i) => {
        if (keystones[i]) {
          const idx = adjustedPalette.findIndex(p => p.sku === nk.sku);
          adjustedPalette[idx] = formatPlantForPalette(keystones[i]);
        }
      });
      break;
      
    case 'more_evergreen':
      // Add evergreen structure
      const evergreens = allPlants.filter(p =>
        !currentSkus.has(p.sku) &&
        p.is_evergreen &&
        p.active
      ).slice(0, 2);
      
      evergreens.forEach(eg => {
        if (adjustedPalette.length < 12) {
          adjustedPalette.push(formatPlantForPalette(eg));
        }
      });
      break;
  }
  
  return adjustedPalette;
}

/**
 * Format plant object for palette output
 */
function formatPlantForPalette(plant) {
  return {
    sku: plant.sku,
    name: plant.name,
    scientificName: plant.scientific_name,
    role: plant.role || determineRole(plant),
    spacingIn: plant.spacing_in || 18,
    heightMin: plant.height_min_in,
    heightMax: plant.height_max_in,
    bloomMonths: plant.bloom_months,
    color: plant.color_primary,
    isKeystone: plant.is_keystone,
    isGrass: plant.is_grass || plant.is_sedge
  };
}

// Export for Node.js / Vercel
module.exports = {
  scorePlant,
  selectPalette,
  determineRole,
  adjustPalette,
  formatPlantForPalette
};
