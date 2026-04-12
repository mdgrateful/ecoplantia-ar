import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin-update — one-time update, remove after use
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('product_map')
    .update({ spacing_in: 13 })
    .ilike('scientific_name', '%Carex pensylvanica%')
    .select('sku, name, scientific_name, spacing_in');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Updated ${data.length} row(s)`,
    updated: data,
  });
}
