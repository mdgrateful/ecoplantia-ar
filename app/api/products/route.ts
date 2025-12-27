import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/products - Get all products (plants and kits)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabaseAdmin.from('product_map').select('*');

    if (activeOnly) {
      query = query.eq('active', true);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data: products, error } = await query.order('name');

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Separate plants from kits/sheets
    const plants = products?.filter((p) => !['kit', 'sheet'].includes(p.role)) || [];
    const kits = products?.filter((p) => p.role === 'kit') || [];

    return NextResponse.json({
      success: true,
      plants,
      kits,
      total: products?.length || 0,
    });
  } catch (error) {
    console.error('Products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
