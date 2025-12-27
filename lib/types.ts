// ================================================
// ECOPLANTIA TYPE DEFINITIONS
// Matches Supabase schema v2
// ================================================

// Design Job - Main workflow entity
export interface DesignJob {
  id: string;
  created_at: string;
  updated_at: string;

  // User tracking
  user_id?: string;
  session_id?: string;

  // Status workflow
  status: DesignStatus;

  // Location & Region
  zip?: string;
  ecoregion_id?: string;

  // Preferences
  sun?: SunPreference;
  style?: StylePreference;
  height_pref?: HeightPreference;
  budget_tier?: BudgetTier;
  must_include?: string[];

  // Photo data
  photo_url?: string;
  photo_width?: number;
  photo_height?: number;

  // Boundary & Scale
  boundary_px?: Point[];
  scale_mode?: 'length_width' | 'two_point';
  length_in?: number;
  width_in?: number;
  px_per_in?: number;
  bed_area_sqft?: number;

  // Perspective anchors
  near_edge_px?: Point;
  far_edge_px?: Point;

  // Existing Plants (keep-out zones)
  existing_plants?: ExistingPlant[];

  // Generated Design
  palette?: PalettePlant[];
  layout?: PlantPlacement[];
  counts?: Record<string, number>;
  quote?: Quote;

  // Generated Assets
  overlay_url?: string;
  beauty_render_url?: string;
  beauty_render_variants?: string[];
  print_svg_url?: string;
  print_pdf_url?: string;
  tile_urls?: TileInfo[];

  // Error handling
  error_message?: string;

  // Metadata
  generation_version?: number;
  regenerate_count?: number;
}

export type DesignStatus =
  | 'draft'
  | 'photo_uploaded'
  | 'boundary_set'
  | 'existing_confirmed'
  | 'preferences_set'
  | 'generating'
  | 'ready'
  | 'error'
  | 'purchased';

export type SunPreference = 'full_sun' | 'part_sun' | 'shade';
export type StylePreference = 'pollinator' | 'tidy' | 'color' | 'low_maint';
export type HeightPreference = 'low' | 'mixed' | 'tall';
export type BudgetTier = 'low' | 'mid' | 'high';

export interface Point {
  x: number;
  y: number;
}

// Existing Plant (keep-out zone)
export interface ExistingPlant {
  id: string;
  kind: 'existing_shrub' | 'existing_tree' | 'existing_perennial';
  label: string;
  centerPx?: Point;
  centerIn?: Point;
  radiusPx?: number;
  radiusIn: number;
  bufferIn: number;
  confidence?: number;
  source: 'ai' | 'user';
  locked: boolean;
}

// Product Map - Plant data with Wix integration
export interface Product {
  sku: string;
  wix_product_id: string;
  variant_id?: string;

  name: string;
  scientific_name?: string;
  price: number;

  active: boolean;
  in_stock: boolean;
  inventory_count?: number;

  // Plant characteristics
  spacing_in: number;
  height_min_in?: number;
  height_max_in?: number;

  // Light requirements
  sun_full: boolean;
  sun_part: boolean;
  sun_shade: boolean;

  // Ecological data
  is_keystone: boolean;
  is_grass: boolean;
  is_sedge?: boolean;
  is_evergreen?: boolean;

  // Bloom info
  bloom_months?: number[];
  color_primary?: string;

  // Design role
  role: PlantRole;

  // Regional
  ecoregions?: string[];

  // Display
  image_url?: string;

  updated_at?: string;
}

export type PlantRole = 'anchor' | 'mid' | 'filler' | 'grass' | 'kit' | 'sheet';

// Palette Plant (selected for design)
export interface PalettePlant {
  sku: string;
  name: string;
  scientificName?: string;
  role: PlantRole;
  spacingIn: number;
  heightMin?: number;
  heightMax?: number;
  bloomMonths?: number[];
  color?: string;
  isKeystone: boolean;
  isGrass: boolean;
  score?: number;
}

// Plant Placement in layout
export interface PlantPlacement {
  x: number;  // inches
  y: number;  // inches
  sku: string;
  r: number;  // radius in inches
}

// Rollout Sheet pricing
export interface RolloutSheet {
  id: string;
  name: string;
  min_sqft: number;
  max_sqft: number;
  price: number;
  wix_product_id?: string;
  active: boolean;
}

// Quote breakdown
export interface Quote {
  plants: QuoteLine[];
  sheet: QuoteLine;
  subtotal: number;
  taxEstimate?: number;
  total: number;
}

export interface QuoteLine {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  wixProductId: string;
}

// Tile info for print output
export interface TileInfo {
  tile: string;  // 'A', 'B', 'C'...
  url: string;
  rotated: boolean;
  startX?: number;
  endX?: number;
}

// API Request/Response Types

export interface CreateJobResponse {
  success: boolean;
  jobId: string;
  uploadUrl?: string;
}

export interface PhotoCompleteRequest {
  jobId: string;
  photoUrl: string;
  width: number;
  height: number;
}

export interface BoundaryRequest {
  jobId: string;
  boundaryPx: Point[];
  scaleMode: 'length_width' | 'two_point';
  lengthIn?: number;
  widthIn?: number;
  point1?: Point;
  point2?: Point;
  distanceIn?: number;
}

export interface BoundaryResponse {
  success: boolean;
  pxPerIn: number;
  bedAreaSqft: number;
}

export interface DetectExistingRequest {
  jobId: string;
}

export interface DetectExistingResponse {
  success: boolean;
  suggestions: ExistingPlant[];
  notes?: string;
}

export interface SaveExistingRequest {
  jobId: string;
  existingPlants: ExistingPlant[];
}

export interface PreferencesRequest {
  jobId: string;
  sun: SunPreference;
  style: StylePreference;
  heightPref: HeightPreference;
  budgetTier?: BudgetTier;
  mustInclude?: string[];
  zip?: string;
}

export interface GenerateRequest {
  jobId: string;
}

export interface GenerateResponse {
  success: boolean;
  palette: PalettePlant[];
  layout: PlantPlacement[];
  counts: Record<string, number>;
  quote: Quote;
  bedAreaSqft: number;
  existingAreaSqft: number;
  plantableAreaSqft: number;
  totalPlants: number;
}

export interface BeautyRenderRequest {
  jobId: string;
  season?: 'spring' | 'summer' | 'fall';
  timeOfDay?: 'morning' | 'midday' | 'golden';
}

export interface BeautyRenderResponse {
  success: boolean;
  renderUrl: string;
  variants?: string[];
}

export interface PrintRequest {
  jobId: string;
  format?: 'svg' | 'pdf';
  dpi?: number;
}

export interface PrintResponse {
  success: boolean;
  masterUrl: string;
  tiles: TileInfo[];
  rotated: boolean;
}

export interface CheckoutRequest {
  jobId: string;
  email?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl: string;
  orderId?: string;
}

// Ecoregion
export interface Ecoregion {
  id: string;
  name: string;
  description?: string;
  states: string[];
  zip_prefixes: string[];
}
