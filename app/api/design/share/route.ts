import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Generate short share code
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/design/share - Create shareable link
export async function POST(request: NextRequest) {
  try {
    const { design } = await request.json();

    if (!design) {
      return NextResponse.json(
        { success: false, error: 'Design data required' },
        { status: 400 }
      );
    }

    const shareCode = generateShareCode();

    // Store shared design
    const { data, error } = await supabaseAdmin
      .from('shared_designs')
      .insert({
        share_code: shareCode,
        design_data: design,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select('share_code')
      .single();

    if (error) {
      // If table doesn't exist, create inline storage in design_jobs
      const { data: jobData, error: jobError } = await supabaseAdmin
        .from('design_jobs')
        .insert({
          session_id: shareCode,
          status: 'ready',
          metadata: {
            shared: true,
            designerVersion: 2,
            ...design,
          },
        })
        .select('id')
        .single();

      if (jobError) {
        console.error('Share error:', jobError);
        return NextResponse.json(
          { success: false, error: 'Failed to create share link' },
          { status: 500 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ecoplantia.com';
      return NextResponse.json({
        success: true,
        shareCode,
        shareUrl: `${baseUrl}/designer/shared/${jobData.id}`,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ecoplantia.com';
    return NextResponse.json({
      success: true,
      shareCode: data.share_code,
      shareUrl: `${baseUrl}/designer/shared/${data.share_code}`,
    });
  } catch (error) {
    console.error('Share design error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

// GET /api/design/share?code=XXX - Load shared design
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Share code required' },
        { status: 400 }
      );
    }

    // Try shared_designs table first
    const { data, error } = await supabaseAdmin
      .from('shared_designs')
      .select('design_data, expires_at')
      .eq('share_code', code)
      .single();

    if (!error && data) {
      // Check expiration
      if (new Date(data.expires_at) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Share link expired' },
          { status: 410 }
        );
      }

      return NextResponse.json({
        success: true,
        design: data.design_data,
      });
    }

    // Fallback to design_jobs
    const { data: jobData, error: jobError } = await supabaseAdmin
      .from('design_jobs')
      .select('metadata')
      .or(`session_id.eq.${code},id.eq.${code}`)
      .single();

    if (jobError || !jobData?.metadata) {
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      design: jobData.metadata,
    });
  } catch (error) {
    console.error('Load shared design error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load design' },
      { status: 500 }
    );
  }
}
