import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/design/save - Save design to cloud
export async function POST(request: NextRequest) {
  try {
    const { design, jobId } = await request.json();

    if (!design) {
      return NextResponse.json(
        { success: false, error: 'Design data required' },
        { status: 400 }
      );
    }

    // Convert design to DB format
    const dbData = {
      status: 'ready',
      boundary_px: design.polyPts,
      length_in: design.widthFt * 12,
      width_in: design.depthFt * 12,
      bed_area_sqft: design.widthFt * design.depthFt,
      photo_url: design.photoUrl,
      beauty_render_url: design.beautyRenderUrl,
      layout: design.plants.map((p: any) => ({
        x: p.cx,
        y: p.cy,
        sku: p.name,
        r: 6, // Default radius
      })),
      // Store full design as JSON in metadata
      metadata: {
        designerVersion: 2,
        shape: design.shape,
        name: design.name,
        plants: design.plants,
        polyPts: design.polyPts,
      },
      updated_at: new Date().toISOString(),
    };

    let result;

    if (jobId) {
      // Update existing job
      result = await supabaseAdmin
        .from('design_jobs')
        .update(dbData)
        .eq('id', jobId)
        .select('id')
        .single();
    } else {
      // Create new job
      result = await supabaseAdmin
        .from('design_jobs')
        .insert({
          ...dbData,
          session_id: design.id,
        })
        .select('id')
        .single();
    }

    if (result.error) {
      console.error('Save error:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId: result.data.id,
    });
  } catch (error) {
    console.error('Save design error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save design' },
      { status: 500 }
    );
  }
}
