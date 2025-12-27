import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { CreateJobResponse } from '@/lib/types';

// POST /api/design/create - Create new design job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    // Create design job
    const { data: job, error } = await supabaseAdmin
      .from('design_jobs')
      .insert({
        session_id: sessionId || crypto.randomUUID(),
        status: 'draft',
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Create signed upload URL for photo
    const filePath = `photos/${job.id}/original.jpg`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('design-photos')
      .createSignedUploadUrl(filePath);

    const response: CreateJobResponse = {
      success: true,
      jobId: job.id,
      uploadUrl: uploadError ? undefined : uploadData?.signedUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create design job' },
      { status: 500 }
    );
  }
}
