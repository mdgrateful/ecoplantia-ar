import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { DetectExistingRequest, DetectExistingResponse } from '@/lib/types';

const {
  detectExistingPlants,
  formatExistingPlants,
} = require('@/lib/existing-plants-detector');

// POST /api/design/existing/detect - Detect existing plants with AI
export async function POST(request: NextRequest) {
  try {
    const body: DetectExistingRequest = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Get job data
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('design_jobs')
      .select('photo_url, boundary_px, px_per_in')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.photo_url) {
      return NextResponse.json(
        { success: false, error: 'No photo uploaded' },
        { status: 400 }
      );
    }

    // Detect existing plants using OpenAI Vision
    const detection = await detectExistingPlants({
      photoUrl: job.photo_url,
      boundaryPx: job.boundary_px,
      pxPerIn: job.px_per_in,
    });

    if (detection.error) {
      return NextResponse.json(
        { success: false, error: detection.error },
        { status: 500 }
      );
    }

    // Format suggestions
    const suggestions = formatExistingPlants(detection.suggestions || [], 'ai');

    const response: DetectExistingResponse = {
      success: true,
      suggestions,
      notes: detection.notes,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Detect existing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect existing plants' },
      { status: 500 }
    );
  }
}
