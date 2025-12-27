import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';
import type { BeautyRenderRequest, BeautyRenderResponse } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/design/beauty-render - Generate beauty render with DALL-E
export async function POST(request: NextRequest) {
  try {
    const body: BeautyRenderRequest = await request.json();
    const { jobId, season = 'summer', timeOfDay = 'midday' } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Get job data
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('design_jobs')
      .select('palette, existing_plants, bed_area_sqft')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.palette) {
      return NextResponse.json(
        { success: false, error: 'Design not generated yet' },
        { status: 400 }
      );
    }

    // Build plant list for prompt
    const plantNames = job.palette.map((p: any) => p.name).join(', ');
    const existingCount = (job.existing_plants || []).length;

    // Build DALL-E prompt
    const prompt = `Photorealistic magazine-quality photograph of a beautiful native plant garden in ${season}, ${timeOfDay} light.

The garden features these native plants: ${plantNames}.

Design style: Natural prairie meadow with layered heights - tall plants in back, medium in middle, low in front.
${existingCount > 0 ? `The garden is designed around ${existingCount} existing mature shrubs that are preserved.` : ''}

Requirements:
- Lush, healthy plants in full bloom
- Professional landscape photography style
- Natural groupings of plants (odd numbers: 3, 5, 7)
- Soft natural shadows and depth
- Garden bed approximately ${Math.round(job.bed_area_sqft)} square feet
- No artificial elements, pure nature
- Warm, inviting atmosphere

Do NOT include: text, labels, people, furniture, buildings in frame.`;

    // Generate with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
    });

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No image generated' },
        { status: 500 }
      );
    }

    const renderUrl = response.data[0].url || '';

    // Save render URL to job
    await supabaseAdmin
      .from('design_jobs')
      .update({
        beauty_render_url: renderUrl,
      })
      .eq('id', jobId);

    const result: BeautyRenderResponse = {
      success: true,
      renderUrl,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Beauty render error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate beauty render' },
      { status: 500 }
    );
  }
}
