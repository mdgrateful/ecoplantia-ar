-- ================================================
-- ECOPLANTIA PRODUCT IMPORT
-- Run this AFTER supabase-schema.sql
-- Contains REAL Wix Product IDs
-- ================================================

-- Clear existing data
DELETE FROM product_map WHERE 1=1;
DELETE FROM rollout_sheets WHERE 1=1;

-- ================================================
-- INDIVIDUAL PLANTS (for custom garden designs)
-- ================================================

INSERT INTO product_map (
  sku, wix_product_id, name, scientific_name, price, active, in_stock,
  spacing_in, height_min_in, height_max_in,
  sun_full, sun_part, sun_shade,
  is_keystone, is_grass, role,
  bloom_months, color_primary, image_url
) VALUES

-- Coneflower - KEYSTONE
('ECH-1QT', '02b669e3-da95-eda1-b5aa-beba3103c0bc', 
 'Coneflower', 'Echinacea purpurea', 5.00, true, true,
 18, 24, 36, true, true, false,
 true, false, 'anchor',
 ARRAY[6,7,8], '#A03C93',
 'https://static.wixstatic.com/media/94bd1f_14557c6680704ccdb1388a3c9bb78bb1~mv2.jpg'),

-- Black-Eyed Susan - KEYSTONE
('RUD-1QT', '2963fc0c-9da4-c9d3-a4b3-7dc4d6111a0b',
 'Black-Eyed Susan', 'Rudbeckia fulgida', 5.00, true, true,
 18, 18, 30, true, true, false,
 true, false, 'mid',
 ARRAY[6,7,8,9], '#E2B100',
 'https://static.wixstatic.com/media/94bd1f_d999bdf79f7f4395bdea532a6e0960d1~mv2.jpg'),

-- Smooth Aster - KEYSTONE
('AST-1QT', 'df3e6430-06fb-f883-b429-2118b92d1159',
 'Smooth Aster', 'Symphyotrichum laeve', 5.00, true, true,
 24, 24, 36, true, true, false,
 true, false, 'mid',
 ARRAY[9,10], '#9E84C6',
 'https://static.wixstatic.com/media/94bd1f_ab0ec431fb7649729106b8d57fbfc17e~mv2.jpg'),

-- Wrinkleleaf Goldenrod - KEYSTONE
('SOL-1QT', '2ec7c662-b950-587b-25cf-6deb3bfea7c0',
 'Wrinkleleaf Goldenrod', 'Solidago rugosa', 5.00, true, true,
 24, 24, 48, true, false, false,
 true, false, 'anchor',
 ARRAY[8,9,10], '#E2C000',
 'https://static.wixstatic.com/media/94bd1f_f0ae2d7f5bdf40be9bae834522028f05~mv2.jpg'),

-- ZigZag Goldenrod - KEYSTONE
('SOL-ZZ-1QT', '995dfee6-c806-4935-99d5-5c8f4ec5691a',
 'ZigZag Goldenrod', 'Solidago flexicaulis', 5.00, true, true,
 24, 12, 36, true, true, true,
 true, false, 'mid',
 ARRAY[8,9,10], '#E2C000',
 'https://static.wixstatic.com/media/94bd1f_f0ae2d7f5bdf40be9bae834522028f05~mv2.jpg'),

-- Blazing Star
('LIA-1QT', 'aa9ece4a-6918-c372-8b6a-49b7f0a59b0b',
 'Blazing Star', 'Liatris spicata', 5.00, true, true,
 12, 24, 48, true, false, false,
 false, false, 'anchor',
 ARRAY[7,8,9], '#7A2BBF',
 'https://static.wixstatic.com/media/94bd1f_866dca16b6444a3a88f005468821c479'),

-- Lanceleaf Coreopsis
('COR-1QT', '0535a6ad-50a4-3e49-d16d-281e71d2757f',
 'Lanceleaf Coreopsis', 'Coreopsis lanceolata', 5.00, true, true,
 12, 12, 24, true, false, false,
 false, false, 'filler',
 ARRAY[5,6,7,8], '#F6C300',
 'https://static.wixstatic.com/media/94bd1f_441b6603b3e74b2c9ec595ca3bc21a7c~mv2.jpg'),

-- Mountain Mint
('MMT-1QT', 'bd361be9-fb33-c8b0-62e1-327f80bf0755',
 'Mountain Mint', 'Pycnanthemum muticum', 5.00, true, true,
 24, 24, 36, true, true, false,
 false, false, 'mid',
 ARRAY[7,8,9], '#EDEDED',
 'https://static.wixstatic.com/media/94bd1f_05477fc754bf4d58b3f73fcc91812c25~mv2.jpg'),

-- Purple Love Grass - GRASS
('ERA-1QT', 'ff99c2d3-8646-4e63-a71c-741a69cab88b',
 'Purple Love Grass', 'Eragrostis spectabilis', 5.00, true, true,
 18, 12, 24, true, false, false,
 false, true, 'grass',
 ARRAY[8,9,10], '#D071A3',
 'https://static.wixstatic.com/media/94bd1f_8f658d4b079d4ac4a0cc986ca9356f06~mv2.jpg');

-- ================================================
-- CUSTOM ROLL-OUT PAPER PRODUCT
-- ================================================

INSERT INTO product_map (sku, wix_product_id, name, price, active, in_stock, role)
VALUES ('CUSTOM-PAPER', 'f59f5685-9bcf-199e-af1e-7c539332f064', 
        'Custom Roll-Out Garden Paper', 1.00, true, true, 'sheet');

-- ================================================
-- ROLLOUT SHEET PRICING TIERS
-- ================================================

INSERT INTO rollout_sheets (id, name, min_sqft, max_sqft, price, wix_product_id, active) VALUES
  ('sheet-16', 'Roll-Out Sheet (up to 16 sq ft)', 0, 16, 25.00, 'f59f5685-9bcf-199e-af1e-7c539332f064', true),
  ('sheet-25', 'Roll-Out Sheet (17-25 sq ft)', 16.01, 25, 35.00, 'f59f5685-9bcf-199e-af1e-7c539332f064', true),
  ('sheet-40', 'Roll-Out Sheet (26-40 sq ft)', 25.01, 40, 45.00, 'f59f5685-9bcf-199e-af1e-7c539332f064', true),
  ('sheet-60', 'Roll-Out Sheet (41-60 sq ft)', 40.01, 60, 55.00, 'f59f5685-9bcf-199e-af1e-7c539332f064', true),
  ('sheet-100', 'Roll-Out Sheet (61-100 sq ft)', 60.01, 100, 75.00, 'f59f5685-9bcf-199e-af1e-7c539332f064', true),
  ('sheet-150', 'Roll-Out Sheet (101-150 sq ft)', 100.01, 150, 95.00, 'f59f5685-9bcf-199e-af1e-7c539332f064', true),
  ('sheet-225', 'Roll-Out Sheet (151-225 sq ft)', 150.01, 225, 125.00, 'f59f5685-9bcf-199e-af1e-7c539332f064', true);

-- ================================================
-- PRE-MADE ROLL-OUT GARDEN KITS
-- ================================================

INSERT INTO product_map (sku, wix_product_id, name, price, active, in_stock, role) VALUES
('KIT-BIRD-8FT', '44100366-82e7-6cba-9108-6ff7cb72d449', 'Bird & Butterfly Garden 8ft. Circle', 160.00, true, true, 'kit'),
('KIT-DAPPLED', '62082bf2-92b0-5c1b-5583-9877261a8e61', 'Dappled Light', 145.00, true, true, 'kit'),
('KIT-HNP-APPAL', '9371c097-77f0-e46e-2d01-d37971e690a7', 'HNP Appalachian Forests', 165.00, true, true, 'kit'),
('KIT-HNP-ATLHI', '03dfb868-6889-b27a-2282-4b407dca4590', 'HNP Atlantic Highlands', 165.00, true, true, 'kit'),
('KIT-HNP-BEGIN', '6f05c1e3-718d-8099-b5e0-1907c2f88f9a', 'HNP Beginner''s Garden', 90.00, true, true, 'kit'),
('KIT-HNP-CENTR', '6a619937-9272-d219-1877-c6a949ee40d2', 'HNP Central USA Plains', 165.00, true, true, 'kit'),
('KIT-HNP-ETKSG', 'fa9b97d4-dd12-4b25-8ccc-91bc650023ac', 'HNP Eastern Temperate Keystone Garden', 165.00, true, true, 'kit'),
('KIT-HNP-MIXED', '2f761f45-7595-c077-a3c3-cdd1d654f79c', 'HNP Mixed Wood Plains', 165.00, true, true, 'kit'),
('KIT-HNP-SCSAP', '7d1171f3-bf1b-f100-4e65-6ca02b2cd189', 'HNP South Central Semiarid Prairies', 165.00, true, true, 'kit'),
('KIT-HNP-SEUSA', '474c19fd-60cb-168f-5f03-d447d979d550', 'HNP Southeastern USA Plains', 165.00, true, true, 'kit'),
('KIT-HNP-TEMPR', '143d3d7a-4808-3ee5-a981-e3d187d6b76c', 'HNP Temperate Prairies', 165.00, true, true, 'kit'),
('KIT-KYLLAWN', 'c044ec5e-6a2e-4466-b6b9-5916a8912236', 'Kill Your Lawn Straight Species', 500.00, true, true, 'kit'),
('KIT-LOWGROW', '0d8ab04b-6fc7-75b5-42fe-7bc8ca566f5a', 'Low Grow Beauty', 575.00, true, true, 'kit'),
('KIT-MONARCH', 'fe1543be-5675-acfe-0bdd-63bcd221cf4b', 'Monarch Garden', 185.00, true, true, 'kit'),
('KIT-SOLAR', '86e97d83-504c-41fc-b05e-848d36257f03', 'Solar Sidewalk', 168.00, true, true, 'kit'),
('KIT-SUNNYCF', '02dddd50-4a66-471a-8cb4-c0bf279764ca', 'Sunny City Front Yard', 185.00, true, true, 'kit');

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check individual plants
-- SELECT sku, name, wix_product_id, is_keystone, is_grass, role FROM product_map WHERE role NOT IN ('kit', 'sheet') ORDER BY name;

-- Check all products
-- SELECT sku, name, price, role FROM product_map ORDER BY role, name;

-- Check sheet pricing
-- SELECT * FROM rollout_sheets ORDER BY min_sqft;
