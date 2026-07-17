import { getServerSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ products: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: body.name,
          description: body.description,
          price: body.price,
          discount_percent: body.discount_percent || 0,
          stock_quantity: body.stock_quantity || 0,
          category: body.category,
          images: body.images || [],
          created_by: adminUserId,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ product: data[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        discount_percent: body.discount_percent || 0,
        stock_quantity: body.stock_quantity || 0,
        category: body.category,
        images: body.images || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ product: data[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}