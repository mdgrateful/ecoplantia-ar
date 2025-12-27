import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { PrintRequest, PrintResponse, TileInfo } from '@/lib/types';

const { generateTiledSVGs } = require('@/lib/print-generator');
const { convertBoundaryToInches, convertExistingPlantsToInches } = require('@/lib/layout-engine');

// POST /api/design/print - Generate print-ready SVG tiles
export async function POST(request: NextRequest) {
  try {
    const body: PrintRequest = await request.json();
    const { jobId, dpi = 300 } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Get job data
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('design_jobs')
      .select('boundary_px, px_per_in, layout, existing_plants, palette')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.layout || !job.boundary_px || !job.px_per_in) {
      return NextResponse.json(
        { success: false, error: 'Design not generated yet' },
        { status: 400 }
      );
    }

    // Convert boundary to inches
    const boundaryIn = convertBoundaryToInches(job.boundary_px, job.px_per_in);

    // Convert existing plants to inches
    const existingPlantsIn = job.existing_plants
      ? convertExistingPlantsToInches(job.existing_plants, job.px_per_in)
      : [];

    // Build SKU to label map
    const skuToLabel: Record<string, string> = {};
    if (job.palette) {
      for (const plant of job.palette) {
        skuToLabel[plant.sku] = plant.sku.split('-')[0];
      }
    }

    // Generate tiled SVGs
    const tiles = generateTiledSVGs(
      {
        bedPolygonIn: boundaryIn,
        placements: job.layout,
        existingPlants: existingPlantsIn,
        skuToLabel,
      },
      {
        paperWidthIn: 24,
        marginIn: 0.5,
        overlapIn: 1,
        dpi,
        showBoundary: true,
        showLabels: true,
        showCrosshairs: true,
        showLegend: true,
        showExistingPlants: true,
      }
    );

    // Upload tiles to storage
    const tileInfos: TileInfo[] = [];
    for (const tile of tiles) {
      const tilePath = `prints/${jobId}/tile-${tile.tile}.svg`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('design-photos')
        .upload(tilePath, tile.svg, {
          contentType: 'image/svg+xml',
          upsert: true,
        });

      if (uploadError) {
        console.error(`Failed to upload tile ${tile.tile}:`, uploadError);
        continue;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from('design-photos')
        .getPublicUrl(tilePath);

      tileInfos.push({
        tile: tile.tile,
        url: urlData.publicUrl,
        rotated: tile.rotated,
        startX: tile.startX,
        endX: tile.endX,
      });
    }

    // Save tile URLs to job
    await supabaseAdmin
      .from('design_jobs')
      .update({
        tile_urls: tileInfos,
      })
      .eq('id', jobId);

    const response: PrintResponse = {
      success: true,
      masterUrl: tileInfos[0]?.url || '',
      tiles: tileInfos,
      rotated: tiles[0]?.rotated || false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Print generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate print files' },
      { status: 500 }
    );
  }
}
