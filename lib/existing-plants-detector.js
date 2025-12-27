// ================================================
// ECOPLANTIA EXISTING PLANTS DETECTOR
// Uses OpenAI Vision to detect existing shrubs/plants
// ================================================

/**
 * Detect existing plants in a photo using OpenAI Vision
 * @param {Object} params
 * @param {string} params.photoUrl - URL of the photo
 * @param {Array} params.boundaryPx - Bed boundary polygon in pixels (optional)
 * @param {number} params.pxPerIn - Scale factor (optional)
 * @returns {Promise<Array>} - Array of detected plant suggestions
 */
async function detectExistingPlants(params) {
  const { photoUrl, boundaryPx = null, pxPerIn = null } = params;
  
  const prompt = `Analyze this garden/yard photo and identify any EXISTING plants, shrubs, or trees that are already planted in the area.

For each existing plant you detect, provide:
1. Approximate center position (x, y in pixels from top-left)
2. Approximate radius/size in pixels
3. Confidence level (0-1)
4. Brief description (e.g., "boxwood shrub", "ornamental grass", "small tree")

${boundaryPx ? `Focus on the area within this polygon boundary (in pixels): ${JSON.stringify(boundaryPx)}` : ''}

Respond in JSON format:
{
  "suggestions": [
    {
      "centerPx": {"x": 500, "y": 400},
      "radiusPx": 80,
      "confidence": 0.85,
      "description": "Boxwood shrub"
    }
  ],
  "totalDetected": 3,
  "notes": "Optional notes about the detection"
}

If no existing plants are detected, return an empty suggestions array.
Only detect plants that appear to be intentionally planted (not weeds or grass lawn).
Limit to the 8 most prominent/confident detections.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: photoUrl } }
            ]
          }
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return { suggestions: [], error: 'No response from AI' };
    }
    
    const parsed = JSON.parse(content);
    
    // Convert to inches if scale is provided
    if (pxPerIn && parsed.suggestions) {
      parsed.suggestions = parsed.suggestions.map(s => ({
        ...s,
        centerIn: s.centerPx ? {
          x: s.centerPx.x / pxPerIn,
          y: s.centerPx.y / pxPerIn
        } : null,
        radiusIn: s.radiusPx ? s.radiusPx / pxPerIn : 18 // Default 18" if no radius
      }));
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Existing plant detection error:', error);
    return {
      suggestions: [],
      error: error.message
    };
  }
}

/**
 * Format detected plants for storage in database
 * @param {Array} suggestions - Raw suggestions from AI
 * @param {string} source - 'ai' or 'user'
 * @returns {Array} - Formatted existing plants array
 */
function formatExistingPlants(suggestions, source = 'ai') {
  return suggestions.map((s, index) => ({
    id: `ex_${String(index + 1).padStart(3, '0')}`,
    kind: 'existing_shrub',
    label: s.description || 'Existing plant',
    centerPx: s.centerPx,
    centerIn: s.centerIn || null,
    radiusPx: s.radiusPx,
    radiusIn: s.radiusIn || 18,
    bufferIn: 2, // Default 2" buffer
    confidence: s.confidence || 0.5,
    source: source,
    locked: false // User needs to confirm
  }));
}

/**
 * Merge user edits with AI suggestions
 * @param {Array} aiSuggestions - Original AI suggestions
 * @param {Array} userEdits - User modifications
 * @returns {Array} - Merged and validated plants
 */
function mergeExistingPlants(aiSuggestions, userEdits) {
  const merged = [];
  const editedIds = new Set(userEdits.map(e => e.id));
  
  // Add user edits (these take priority)
  for (const edit of userEdits) {
    merged.push({
      ...edit,
      source: edit.source || 'user',
      locked: true
    });
  }
  
  // Add AI suggestions that weren't edited/deleted
  for (const suggestion of aiSuggestions) {
    if (!editedIds.has(suggestion.id)) {
      merged.push({
        ...suggestion,
        locked: true
      });
    }
  }
  
  return merged;
}

/**
 * Validate existing plants data
 * @param {Array} existingPlants
 * @returns {Object} - { valid: boolean, errors: string[], cleaned: Array }
 */
function validateExistingPlants(existingPlants) {
  const errors = [];
  const cleaned = [];
  
  if (!Array.isArray(existingPlants)) {
    return { valid: false, errors: ['existingPlants must be an array'], cleaned: [] };
  }
  
  for (let i = 0; i < existingPlants.length; i++) {
    const plant = existingPlants[i];
    
    // Must have center
    const center = plant.centerIn || plant.centerPx;
    if (!center || typeof center.x !== 'number' || typeof center.y !== 'number') {
      errors.push(`Plant ${i}: missing or invalid center`);
      continue;
    }
    
    // Must have radius
    const radius = plant.radiusIn || plant.radiusPx;
    if (typeof radius !== 'number' || radius <= 0) {
      errors.push(`Plant ${i}: missing or invalid radius`);
      continue;
    }
    
    // Validate radius range (6" to 120")
    const radiusIn = plant.radiusIn || (plant.radiusPx ? plant.radiusPx / 10 : 18); // rough estimate
    if (radiusIn < 6 || radiusIn > 120) {
      errors.push(`Plant ${i}: radius out of range (6-120 inches)`);
      continue;
    }
    
    cleaned.push({
      id: plant.id || `ex_${String(cleaned.length + 1).padStart(3, '0')}`,
      kind: plant.kind || 'existing_shrub',
      label: plant.label || 'Existing plant',
      centerIn: plant.centerIn || null,
      centerPx: plant.centerPx || null,
      radiusIn: plant.radiusIn || 18,
      radiusPx: plant.radiusPx || null,
      bufferIn: plant.bufferIn || 2,
      confidence: plant.confidence || null,
      source: plant.source || 'user',
      locked: plant.locked !== false
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    cleaned
  };
}

/**
 * Quick preset sizes for UI
 */
const EXISTING_PLANT_PRESETS = {
  small: { radiusIn: 12, label: 'Small (12")' },
  medium: { radiusIn: 18, label: 'Medium (18")' },
  large: { radiusIn: 24, label: 'Large (24")' },
  xlarge: { radiusIn: 36, label: 'X-Large (36")' }
};

// Export for Node.js / Vercel
module.exports = {
  detectExistingPlants,
  formatExistingPlants,
  mergeExistingPlants,
  validateExistingPlants,
  EXISTING_PLANT_PRESETS
};
