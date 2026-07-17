import { getServerSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    // admin check
    const headerId = request.headers.get('x-user-id');
    const headerEmail = request.headers.get('x-user-email')?.toLowerCase();
    if (headerId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', headerId)
        .single();
      if (profile?.role === 'admin') {
        const { data, error } = await supabase
          .from('wishlist')
          .select('id, user:user_id(id,name,email), product:product_id(id,name,price,stock_quantity,slug,images)')
          .order('id', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ items: data || [] }, { status: 200 });
      }
    }

    const userId = await getUserIdFromRequest(supabase, request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ items: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getServerSupabase();
    const userId = await getUserIdFromRequest(supabase, request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { product_id } = body;
    if (!product_id) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const { data, error } = await supabase
      .from('wishlist')
      .upsert([{ user_id: userId, product_id }], { onConflict: 'user_id,product_id' });

    if (error) throw error;
    return NextResponse.json({ item: data?.[0] || null }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const supabase = getServerSupabase();
    const userId = await getUserIdFromRequest(supabase, request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!product_id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', product_id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
