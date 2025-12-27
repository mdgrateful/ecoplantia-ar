import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { PhotoCompleteRequest } from '@/lib/types';

// POST /api/design/photo-complete - Mark photo as uploaded
export async function POST(request: NextRequest) {
  try {
    const body: PhotoCompleteRequest = await request.json();
    const { jobId, photoUrl, width, height } = body;

    if (!jobId || !photoUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId or photoUrl' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('design_jobs')
      .update({
        photo_url: photoUrl,
        photo_width: width,
        photo_height: height,
        status: 'photo_uploaded',
      })
      .eq('id', jobId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo complete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update photo status' },
      { status: 500 }
    );
  }
}
