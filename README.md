# Ecoplantia - Photo-to-Rollout Garden Designer

Transform your outdoor space with native plants. Upload a photo, trace your garden boundary, and get a custom planting layout with printable installation tiles.

## Features

1. **Photo Upload** - Upload a photo of your garden space
2. **Boundary Trace** - Draw the planting area boundary
3. **Plant Detection** - AI identifies existing plants (OpenAI Vision)
4. **Layout Generation** - AI creates optimal plant placement
5. **Beauty Render** - DALL-E visualization of finished garden
6. **Print Tiles** - 24" tiles with CUT OUT circles for planting
7. **Wix Checkout** - Purchase plant kits directly

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Storage)
- **AI**: OpenAI GPT-4o Vision + DALL-E 3
- **Deployment**: Vercel
- **E-commerce**: Wix Stores

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### 3. Setup Supabase Database

Run these SQL files in your Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` - Creates tables and storage
2. `supabase/migrations/002_seed_plants_kits.sql` - Seeds plant and kit data

**Important**: Update the `wix_product_id` values in the seed file with your actual Wix Product IDs.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
vercel
```

Add environment variables in Vercel dashboard.

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload garden photo |
| `/api/detect-plants` | POST | Detect existing plants |
| `/api/generate-layout` | POST | Generate plant layout |
| `/api/render-beauty` | POST | Create DALL-E render |
| `/api/generate-tiles` | POST | Generate print tiles |
| `/api/checkout` | POST | Create Wix checkout |
| `/api/plants` | GET | List all plants |
| `/api/kits` | GET | List all kits |

## Database Schema

- `plants` - 9 native plant species
- `kits` - 16 plant kits with Wix Product IDs
- `garden_uploads` - User photo uploads
- `garden_layouts` - AI-generated layouts
- `garden_renders` - DALL-E beauty renders
- `garden_tile_sets` - Printable tile sets
- `orders` - Checkout tracking

## Storage Buckets

- `garden-uploads` - Original photos
- `garden-renders` - DALL-E renders
- `garden-tiles` - SVG print tiles

## License

Private - Ecoplantia
