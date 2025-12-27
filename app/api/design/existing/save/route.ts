import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { SaveExistingRequest } from '@/lib/types';

const { validateExistingPlants } = require('@/lib/existing-plants-detector');

// POST /api/design/existing/save - Save confirmed existing plants
export async function POST(request: NextRequest) {
  try {
    const body: SaveExistingRequest = await request.json();
    const { jobId, existingPlants } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Validate existing plants data
    const validation = validateExistingPlants(existingPlants || []);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Save to database
    const { error } = await supabaseAdmin
      .from('design_jobs')
      .update({
        existing_plants: validation.cleaned,
        status: 'existing_confirmed',
      })
      .eq('id', jobId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: validation.cleaned.length,
    });
  } catch (error) {
    console.error('Save existing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save existing plants' },
      { status: 500 }
    );
  }
}
