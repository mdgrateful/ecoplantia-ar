const fs = require('fs');

const newContent = `import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompt presets for different styles
const PRESETS: Record<string, string> = {
  ecoplantia_landscape_beauty: [
    "Polish this landscape mockup to look realistic and naturally integrated.",
    "Keep the same camera angle and composition.",
    "Do not change the house, sky, driveway, windows, siding, roof, or surrounding landscape outside the new bed.",
    "Do not move plant positions or change the bed boundary.",
    "Improve blending, lighting consistency, shadows/grounding, and mulch/bed realism.",
    "Keep a clean, premium landscape-render look (not overly saturated, not cartoon)."
  ].join(" "),

  crisp_render: [
    "Polish this landscape mockup maintaining crisp edges.",
    "Slightly enhance clarity while keeping realism.",
    "Avoid painterly effects.",
    "Keep the same camera angle, house, and plant positions unchanged.",
    "Improve lighting and shadow consistency."
  ].join(" "),

  lush_soft: [
    "Polish this landscape mockup with a slightly lusher planting feel.",
    "Apply soft natural lighting.",
    "Keep everything else fixed - same camera angle, house, plant positions.",
    "Do not change the composition or move any elements."
  ].join(" "),
};

// POST /api/design/beauty-render - Polish mockup with OpenAI Images Edit
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle multipart/form-data (mockup image upload)
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('image');
      const preset = (form.get('preset') as string) || 'ecoplantia_landscape_beauty';
      const jobId = form.get('jobId') as string;

      if (!(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: 'Missing image file' },
          { status: 400 }
        );
      }

      // Get the prompt based on preset
      const prompt = PRESETS[preset] || PRESETS.ecoplantia_landscape_beauty;

      // Call OpenAI Images Edit API with gpt-image-1
      const result = await openai.images.edit({
        model: 'gpt-image-1',
        image: await toFile(file, 'mockup.png'),
        prompt,
        n: 1,
        size: '1024x1024',
      });

      const b64 = result.data?.[0]?.b64_json;
      const url = result.data?.[0]?.url;

      if (!b64 && !url) {
        return NextResponse.json(
          { success: false, error: 'No image returned from OpenAI' },
          { status: 500 }
        );
      }

      // If jobId provided, save to database
      if (jobId) {
        const renderUrl = url || \`data:image/png;base64,\${b64}\`;
        await supabaseAdmin
          .from('design_jobs')
          .update({ beauty_render_url: renderUrl })
          .eq('id', jobId);
      }

      return NextResponse.json({
        success: true,
        b64_png: b64,
        renderUrl: url,
        mime: 'image/png',
      });
    }

    // Handle JSON request (mockup base64 or legacy job-based)
    const body = await request.json();
    const { jobId, mockupBase64, preset = 'ecoplantia_landscape_beauty' } = body;

    if (!jobId && !mockupBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId or mockupBase64' },
        { status: 400 }
      );
    }

    // If mockupBase64 is provided, use it directly
    if (mockupBase64) {
      // Convert base64 to buffer
      const base64Data = mockupBase64.replace(/^data:image\\/\\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const prompt = PRESETS[preset] || PRESETS.ecoplantia_landscape_beauty;

      // Create a File-like object from buffer
      const file = new File([buffer], 'mockup.png', { type: 'image/png' });

      const result = await openai.images.edit({
        model: 'gpt-image-1',
        image: await toFile(file, 'mockup.png'),
        prompt,
        n: 1,
        size: '1024x1024',
      });

      const b64 = result.data?.[0]?.b64_json;
      const url = result.data?.[0]?.url;

      if (!b64 && !url) {
        return NextResponse.json(
          { success: false, error: 'No image returned from OpenAI' },
          { status: 500 }
        );
      }

      // Save to job if jobId provided
      if (jobId) {
        const renderUrl = url || \`data:image/png;base64,\${b64}\`;
        await supabaseAdmin
          .from('design_jobs')
          .update({ beauty_render_url: renderUrl })
          .eq('id', jobId);
      }

      return NextResponse.json({
        success: true,
        b64_png: b64,
        renderUrl: url,
        mime: 'image/png',
      });
    }

    // Legacy: Get photo from job and use that as base (for backwards compatibility)
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('design_jobs')
      .select('photo_url, palette, existing_plants, bed_area_sqft')
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
        { success: false, error: 'No photo available for this job' },
        { status: 400 }
      );
    }

    // Fetch the original photo
    const photoResponse = await fetch(job.photo_url);
    if (!photoResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch original photo' },
        { status: 500 }
      );
    }

    const photoBuffer = Buffer.from(await photoResponse.arrayBuffer());
    const photoFile = new File([photoBuffer], 'photo.png', { type: 'image/png' });

    const prompt = PRESETS[preset] || PRESETS.ecoplantia_landscape_beauty;

    const result = await openai.images.edit({
      model: 'gpt-image-1',
      image: await toFile(photoFile, 'photo.png'),
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const b64 = result.data?.[0]?.b64_json;
    const url = result.data?.[0]?.url;

    if (!b64 && !url) {
      return NextResponse.json(
        { success: false, error: 'No image returned' },
        { status: 500 }
      );
    }

    const renderUrl = url || \`data:image/png;base64,\${b64}\`;

    // Save render URL to job
    await supabaseAdmin
      .from('design_jobs')
      .update({ beauty_render_url: renderUrl })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      b64_png: b64,
      renderUrl: url,
      mime: 'image/png',
    });
  } catch (error) {
    console.error('Beauty render error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate beauty render' },
      { status: 500 }
    );
  }
}
`;

fs.writeFileSync('app/api/design/beauty-render/route.ts', newContent);
console.log('Beauty render route updated successfully!');
