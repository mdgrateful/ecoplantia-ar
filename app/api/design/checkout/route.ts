import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { CheckoutRequest, CheckoutResponse } from '@/lib/types';

const WIX_STORE_URL = 'https://www.ecoplantia.com';

// POST /api/design/checkout - Create Wix checkout
export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { jobId, email } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Get job quote
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('design_jobs')
      .select('quote')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not generated' },
        { status: 400 }
      );
    }

    // Build cart items from quote
    const cartItems: Array<{ productId: string; quantity: number }> = [];

    // Add plants
    for (const plant of job.quote.plants) {
      cartItems.push({
        productId: plant.wixProductId,
        quantity: plant.quantity,
      });
    }

    // Add sheet
    if (job.quote.sheet.wixProductId) {
      cartItems.push({
        productId: job.quote.sheet.wixProductId,
        quantity: 1,
      });
    }

    // Generate order ID
    const orderId = crypto.randomUUID();

    // Build checkout URL
    const cartData = encodeURIComponent(JSON.stringify(cartItems));
    const checkoutUrl = `${WIX_STORE_URL}/checkout-handler?cart=${cartData}&orderId=${orderId}&jobId=${jobId}`;

    // Update job status
    await supabaseAdmin
      .from('design_jobs')
      .update({
        status: 'purchased',
      })
      .eq('id', jobId);

    const response: CheckoutResponse = {
      success: true,
      checkoutUrl,
      orderId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
