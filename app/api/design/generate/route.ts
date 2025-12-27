import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { GenerateRequest, GenerateResponse, Quote, QuoteLine } from '@/lib/types';

const { selectPalette } = require('@/lib/palette-engine');
const { generateLayout, convertExistingPlantsToInches } = require('@/lib/layout-engine');

// POST /api/design/generate - Generate palette, layout, and quote
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Update status to generating
    await supabaseAdmin
      .from('design_jobs')
      .update({ status: 'generating' })
      .eq('id', jobId);

    // Get job data
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('design_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.boundary_px || !job.px_per_in) {
      return NextResponse.json(
        { success: false, error: 'Boundary not set' },
        { status: 400 }
      );
    }

    // Fetch available plants
    const { data: products, error: productsError } = await supabaseAdmin
      .from('product_map')
      .select('*')
      .eq('active', true)
      .not('role', 'in', '("kit","sheet")');

    if (productsError || !products) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Select palette based on preferences
    const palette = selectPalette(products, {
      sun: job.sun || 'full_sun',
      style: job.style || 'pollinator',
      heightPref: job.height_pref || 'mixed',
      mustInclude: job.must_include || [],
    });

    // Convert existing plants to inches
    const existingPlantsIn = job.existing_plants
      ? convertExistingPlantsToInches(job.existing_plants, job.px_per_in)
      : [];

    // Generate layout
    const layoutResult = generateLayout({
      boundaryPx: job.boundary_px,
      pxPerIn: job.px_per_in,
      palette,
      style: job.style === 'tidy' ? 'orderly' : 'wild',
      existingPlants: existingPlantsIn,
    });

    // Build quote
    const quote = await buildQuote(layoutResult.counts, products, job.bed_area_sqft);

    // Update job with results
    const { error: updateError } = await supabaseAdmin
      .from('design_jobs')
      .update({
        palette,
        layout: layoutResult.placements,
        counts: layoutResult.counts,
        quote,
        status: 'ready',
      })
      .eq('id', jobId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    const response: GenerateResponse = {
      success: true,
      palette,
      layout: layoutResult.placements,
      counts: layoutResult.counts,
      quote,
      bedAreaSqft: layoutResult.bedAreaSqft,
      existingAreaSqft: layoutResult.existingAreaSqft,
      plantableAreaSqft: layoutResult.plantableAreaSqft,
      totalPlants: layoutResult.totalPlants,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Generate error:', error);

    // Update status to error
    const body = await request.json().catch(() => ({}));
    if (body.jobId) {
      await supabaseAdmin
        .from('design_jobs')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', body.jobId);
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate design' },
      { status: 500 }
    );
  }
}

async function buildQuote(
  counts: Record<string, number>,
  products: any[],
  bedAreaSqft: number
): Promise<Quote> {
  const plantLines: QuoteLine[] = [];
  let plantsSubtotal = 0;

  // Build plant lines
  for (const [sku, quantity] of Object.entries(counts)) {
    const product = products.find((p) => p.sku === sku);
    if (!product) continue;

    const lineTotal = product.price * quantity;
    plantsSubtotal += lineTotal;

    plantLines.push({
      sku,
      name: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal,
      wixProductId: product.wix_product_id,
    });
  }

  // Get sheet pricing
  const { data: sheets } = await supabaseAdmin
    .from('rollout_sheets')
    .select('*')
    .eq('active', true)
    .lte('min_sqft', bedAreaSqft)
    .gte('max_sqft', bedAreaSqft)
    .single();

  const sheetLine: QuoteLine = sheets
    ? {
        sku: sheets.id,
        name: sheets.name,
        quantity: 1,
        unitPrice: sheets.price,
        lineTotal: sheets.price,
        wixProductId: sheets.wix_product_id || '',
      }
    : {
        sku: 'sheet-custom',
        name: 'Custom Roll-Out Sheet',
        quantity: 1,
        unitPrice: Math.ceil(bedAreaSqft * 0.5) + 25,
        lineTotal: Math.ceil(bedAreaSqft * 0.5) + 25,
        wixProductId: 'f59f5685-9bcf-199e-af1e-7c539332f064',
      };

  const subtotal = plantsSubtotal + sheetLine.lineTotal;

  return {
    plants: plantLines,
    sheet: sheetLine,
    subtotal,
    total: subtotal,
  };
}
