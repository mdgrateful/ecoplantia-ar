import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { PreferencesRequest } from '@/lib/types';

// POST /api/design/preferences - Save user preferences
export async function POST(request: NextRequest) {
  try {
    const body: PreferencesRequest = await request.json();
    const { jobId, sun, style, heightPref, budgetTier, mustInclude, zip } = body;

    if (!jobId || !sun || !style || !heightPref) {
      return NextResponse.json(
        { success: false, error: 'Missing required preferences' },
        { status: 400 }
      );
    }

    // Look up ecoregion from zip if provided
    let ecoregionId: string | null = null;
    if (zip) {
      const zipPrefix = zip.substring(0, 3);
      const { data: ecoregion } = await supabaseAdmin
        .from('ecoregions')
        .select('id')
        .contains('zip_prefixes', [zipPrefix])
        .single();

      if (ecoregion) {
        ecoregionId = ecoregion.id;
      }
    }

    const { error } = await supabaseAdmin
      .from('design_jobs')
      .update({
        sun,
        style,
        height_pref: heightPref,
        budget_tier: budgetTier,
        must_include: mustInclude,
        zip,
        ecoregion_id: ecoregionId,
        status: 'preferences_set',
      })
      .eq('id', jobId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ecoregionId });
  } catch (error) {
    console.error('Preferences error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
