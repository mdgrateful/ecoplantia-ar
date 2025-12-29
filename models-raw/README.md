# Raw 3D Models

Drop your high-poly GLB/GLTF/FBX files here and push to GitHub.

## How it works

1. **Add your model** - Drop `AST_3d.glb` (or any 3D file) into this folder
2. **Git push** - Commit and push to GitHub
3. **Auto-optimize** - GitHub Action runs Blender to:
   - Reduce to ~20,000 polygons
   - Apply Draco compression
   - Output to `public/models/`
4. **Auto-deploy** - Vercel deploys the optimized models

## Naming convention

Use the plant acronym + `_3d`:
- `RUD_3d.glb` - Black-Eyed Susan
- `LIA_3d.glb` - Blazingstar
- `ECH_3d.glb` - Purple Coneflower
- `COR_3d.glb` - Coreopsis
- `AST_3d.glb` - Smooth Aster
- `ASC_3d.glb` - Butterfly Weed
- `ERA_3d.glb` - Purple Lovegrass
- `SOL_3d.glb` - Rough Goldenrod
- `MMT_3d.glb` - Blunt Mountain-Mint

## Manual trigger

You can also run the optimization manually from GitHub Actions:
1. Go to Actions tab
2. Select "Optimize 3D Models"
3. Click "Run workflow"
4. Optionally set target polygon count (default: 20,000)
