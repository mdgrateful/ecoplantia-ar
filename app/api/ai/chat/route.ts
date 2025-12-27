import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DesignContext {
  sqft: number;
  dimensions: string;
  plantCount: number;
  speciesCount: number;
  plantList: string;
  bloomMonths: number[];
  hasKeystone: boolean;
  hasGrass: boolean;
  shape: string;
}

// POST /api/ai/chat - AI garden design assistant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context }: { messages: ChatMessage[]; context: DesignContext } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a native plant garden design assistant for Ecoplantia.
You help users design pollinator-friendly gardens with native plants.
Be concise (2-3 sentences max per point). Use simple HTML for formatting (<b>, <br>).
Use emoji sparingly for visual interest.

Current design context:
- Garden: ${context?.dimensions || 'unknown'} (${context?.sqft || 0} sq ft) ${context?.shape || 'rectangle'}
- Plants: ${context?.plantList || 'none yet'}
- Has keystone species: ${context?.hasKeystone || false}
- Has grasses: ${context?.hasGrass || false}
- Bloom months: ${context?.bloomMonths?.join(', ') || 'none yet'}

Available plants to recommend:
- Coneflower (Echinacea purpurea) - keystone, 18" spacing
- Black-Eyed Susan (Rudbeckia fulgida) - keystone, 18" spacing
- Smooth Aster (Symphyotrichum laeve) - keystone, 24" spacing
- Wrinkleleaf Goldenrod (Solidago rugosa) - keystone, 24" spacing
- Blazing Star (Liatris spicata) - 12" spacing
- Lanceleaf Coreopsis (Coreopsis lanceolata) - 12" spacing
- Mountain Mint (Pycnanthemum muticum) - 24" spacing
- Purple Lovegrass (Eragrostis spectabilis) - grass, 18" spacing
- Butterfly Weed (Asclepias tuberosa) - keystone, 24" spacing

Focus on ecological benefits, pollinator value, and practical design advice.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-8), // Keep last 8 messages for context
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      {
        error: 'AI service error',
        message: 'Sorry, I had trouble processing that. Please try again.',
      },
      { status: 500 }
    );
  }
}
