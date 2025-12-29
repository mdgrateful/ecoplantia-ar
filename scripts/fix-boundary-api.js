const fs = require('fs');

const newContent = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { BoundaryRequest, BoundaryResponse } from '@/lib/types';

const {
  calculateScaleFromDimensions,
  calculateScaleFromTwoPoints,
} = require('@/lib/layout-engine');

// POST /api/design/boundary - Save boundary and calculate scale
export async function POST(request: NextRequest) {
  try {
    const body: BoundaryRequest & { pxPerIn?: number } = await request.json();
    const { jobId, boundaryPx, scaleMode, lengthIn, widthIn, point1, point2, distanceIn, pxPerIn } = body;

    if (!jobId || !boundaryPx || boundaryPx.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId or valid boundary' },
        { status: 400 }
      );
    }

    let scaleResult: { pxPerIn: number; bedAreaSqft: number };

    // Check if pxPerIn was pre-calculated by the client (from BoundaryEditor)
    if (pxPerIn && pxPerIn > 0) {
      // Client already calculated pxPerIn - calculate bed area from boundary polygon
      let areaPx = 0;
      for (let i = 0; i < boundaryPx.length; i++) {
        const j = (i + 1) % boundaryPx.length;
        areaPx += boundaryPx[i].x * boundaryPx[j].y;
        areaPx -= boundaryPx[j].x * boundaryPx[i].y;
      }
      areaPx = Math.abs(areaPx / 2);
      const areaSqIn = areaPx / (pxPerIn * pxPerIn);
      const bedAreaSqft = areaSqIn / 144;

      scaleResult = { pxPerIn, bedAreaSqft };
    } else if (scaleMode === 'two_point' && point1 && point2 && distanceIn) {
      scaleResult = calculateScaleFromTwoPoints(point1, point2, distanceIn, boundaryPx);
    } else if (lengthIn && widthIn) {
      scaleResult = calculateScaleFromDimensions(boundaryPx, lengthIn, widthIn);
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing scale parameters' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('design_jobs')
      .update({
        boundary_px: boundaryPx,
        scale_mode: scaleMode,
        length_in: lengthIn,
        width_in: widthIn,
        px_per_in: scaleResult.pxPerIn,
        bed_area_sqft: scaleResult.bedAreaSqft,
        status: 'boundary_set',
      })
      .eq('id', jobId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const response: BoundaryResponse = {
      success: true,
      pxPerIn: scaleResult.pxPerIn,
      bedAreaSqft: scaleResult.bedAreaSqft,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Boundary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save boundary' },
      { status: 500 }
    );
  }
}
`;

fs.writeFileSync('app/api/design/boundary/route.ts', newContent);
console.log('Boundary API fixed to accept pre-calculated pxPerIn!');
