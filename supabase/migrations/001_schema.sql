-- ================================================
-- ECOPLANTIA DATABASE SCHEMA (v2)
-- Includes: Existing Plants Support
-- Run this FIRST in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: design_jobs
-- Core table for photo-to-rollout designs
-- ================================================
CREATE TABLE IF NOT EXISTS design_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- User tracking
  user_id TEXT,
  session_id TEXT,
  
  -- Status workflow
  -- draft | photo_uploaded | boundary_set | existing_confirmed | preferences_set | generating | ready | error | purchased
  status TEXT NOT NULL DEFAULT 'draft',

  -- Location & Region
  zip TEXT,
  ecoregion_id TEXT,
  
  -- Preferences
  sun TEXT,                    -- full_sun | part_sun | shade
  style TEXT,                  -- pollinator | tidy | color | low_maint
  height_pref TEXT,            -- low | mixed | tall
  budget_tier TEXT,            -- low | mid | high
  must_include TEXT[],         -- ['milkweed', 'grasses', ...]

  -- Photo data
  photo_url TEXT,
  photo_width INT,
  photo_height INT,

  -- Boundary & Scale
  boundary_px JSONB,           -- [{x, y}, ...]
  scale_mode TEXT,             -- 'length_width' | 'two_point'
  length_in NUMERIC,
  width_in NUMERIC,
  px_per_in NUMERIC,
  bed_area_sqft NUMERIC,
  
  -- Perspective anchors (for Beauty Render)
  near_edge_px JSONB,          -- {x, y}
  far_edge_px JSONB,           -- {x, y}

  -- ================================================
  -- EXISTING PLANTS (NEW)
  -- Keep-out zones for existing shrubs/plants
  -- ================================================
  existing_plants JSONB DEFAULT '[]',
  /*
  Format:
  [
    {
      "id": "ex_001",
      "kind": "existing_shrub",
      "label": "Existing plant",
      "centerIn": { "x": 24.5, "y": 18.0 },
      "radiusIn": 18,
      "bufferIn": 2,
      "confidence": 0.86,
      "source": "ai" | "user",
      "locked": true
    }
  ]
  */

  -- Generated Design
  palette JSONB,               -- selected species with roles
  layout JSONB,                -- placements: [{x, y, sku, r}, ...]
  counts JSONB,                -- {sku: count, ...}
  quote JSONB,                 -- pricing breakdown

  -- Generated Assets
  overlay_url TEXT,
  beauty_render_url TEXT,
  beauty_render_variants JSONB,
  print_svg_url TEXT,
  print_pdf_url TEXT,
  tile_urls JSONB,

  -- Error handling
  error_message TEXT,
  
  -- Metadata
  generation_version INT DEFAULT 1,
  regenerate_count INT DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_design_jobs_session ON design_jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_design_jobs_status ON design_jobs(status);
CREATE INDEX IF NOT EXISTS idx_design_jobs_created ON design_jobs(created_at DESC);

-- ================================================
-- TABLE: product_map
-- Maps SKUs to Wix Product IDs with plant data
-- ================================================
CREATE TABLE IF NOT EXISTS product_map (
  sku TEXT PRIMARY KEY,
  wix_product_id TEXT NOT NULL,
  variant_id TEXT,
  
  -- Basic info
  name TEXT NOT NULL,
  scientific_name TEXT,
  price NUMERIC DEFAULT 0,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  in_stock BOOLEAN DEFAULT TRUE,
  inventory_count INT,
  
  -- Plant characteristics
  spacing_in INT DEFAULT 18,
  height_min_in INT,
  height_max_in INT,
  
  -- Light requirements
  sun_full BOOLEAN DEFAULT TRUE,
  sun_part BOOLEAN DEFAULT TRUE,
  sun_shade BOOLEAN DEFAULT FALSE,
  
  -- Ecological data
  is_keystone BOOLEAN DEFAULT FALSE,
  is_grass BOOLEAN DEFAULT FALSE,
  is_sedge BOOLEAN DEFAULT FALSE,
  is_evergreen BOOLEAN DEFAULT FALSE,
  
  -- Bloom info
  bloom_months INT[],          -- [5,6,7,8] for May-Aug
  color_primary TEXT,
  
  -- Design role
  role TEXT,                   -- anchor | mid | filler | grass | kit | sheet
  
  -- Regional
  ecoregions TEXT[],
  
  -- Display
  image_url TEXT,
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: rollout_sheets
-- Pricing for roll-out sheet products by size
-- ================================================
CREATE TABLE IF NOT EXISTS rollout_sheets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_sqft NUMERIC NOT NULL,
  max_sqft NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  wix_product_id TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- ================================================
-- TABLE: ecoregions
-- Zip code to ecoregion mapping
-- ================================================
CREATE TABLE IF NOT EXISTS ecoregions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  states TEXT[],
  zip_prefixes TEXT[]
);

-- Insert ecoregions
INSERT INTO ecoregions (id, name, states, zip_prefixes) VALUES
  ('eastern_temperate', 'Eastern Temperate Forests', 
   ARRAY['ME','NH','VT','MA','RI','CT','NY','NJ','PA','DE','MD','VA','WV','NC','SC','GA','FL','AL','MS','TN','KY','OH','IN','IL','MI','WI'],
   ARRAY['010','011','012','013','014','015','016','017','018','019','020','021','022','023','024','025','026','027','028','029','030','031','032','033','034','035','036','037','038','039','040','041','042','043','044','045','046','047','048','049','050','051','052','053','054','055','056','057','058','059','060','061','062','063','064','065','066','067','068','069','100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','150','151','152','153','154','155','156','157','158','159','160','161','162','163','164','165','166','167','168','169','170','171','172','173','174','175','176','177','178','179','180','181','182','183','184','185','186','187','188','189','190','191','192','193','194','195','196','197','198','199','200','201','202','203','204','205','206','207','208','209','210','211','212','213','214','215','216','217','218','219','220','221','222','223','224','225','226','227','228','229','230','231','232','233','234','235','236','237','238','239','240','241','242','243','244','245','246'])
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- FUNCTION: Auto-update timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS design_jobs_updated_at ON design_jobs;
CREATE TRIGGER design_jobs_updated_at
  BEFORE UPDATE ON design_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS product_map_updated_at ON product_map;
CREATE TRIGGER product_map_updated_at
  BEFORE UPDATE ON product_map
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE design_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE rollout_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoregions ENABLE ROW LEVEL SECURITY;

-- Public read on product data
CREATE POLICY "Public read product_map" ON product_map FOR SELECT USING (true);
CREATE POLICY "Public read rollout_sheets" ON rollout_sheets FOR SELECT USING (true);
CREATE POLICY "Public read ecoregions" ON ecoregions FOR SELECT USING (true);

-- Public CRUD on design_jobs (for anonymous users)
CREATE POLICY "Public insert design_jobs" ON design_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select design_jobs" ON design_jobs FOR SELECT USING (true);
CREATE POLICY "Public update design_jobs" ON design_jobs FOR UPDATE USING (true);

-- ================================================
-- DONE! Now run product-import.sql
-- ================================================
