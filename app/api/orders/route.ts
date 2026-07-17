import { getServerSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { getAdminUserId, getUserIdFromRequest } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const supabase = getServerSupabase();
    const adminId = await getAdminUserId(supabase, request);
    if (adminId) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, product:product_id(id,name,price,images))')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Manually fetch user profiles for orders since orders.user_id
      // references auth.users (not user_profiles) and auth.users has no name field
      const orders = data || [];
      const userIds = [...new Set(orders.map((o: any) => o.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, name, email')
          .in('id', userIds);
        const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
        for (const order of orders) {
          order.user = profileMap[order.user_id] || null;
        }
      }

      return NextResponse.json({ orders }, { status: 200 });
    }

    // non-admin: return orders for this user
    const userId = await getUserIdFromRequest(supabase, request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:product_id(id,name,price,images))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ orders: data || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total_amount, user_email } = body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const userId = await getUserIdFromRequest(supabase, request);
    if (!userId) {
      return NextResponse.json({ error: 'User not found in profiles', status: 404 });
    }

    // validate stock
    const productIds = items.map((i: any) => i.id);
    const { data: products } = await supabase.from('products').select('id,stock_quantity').in('id', productIds);
    const insufficient = items.find((it: any) => {
      const p = (products || []).find((x: any) => x.id === it.id);
      return !p || (p.stock_quantity < it.quantity);
    });
    if (insufficient) {
      return NextResponse.json({ error: `Insufficient stock for product ${insufficient.id}` }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: userId, total_amount, status: 'pending' }])
      .select()
      .single();

    if (orderError || !order) {
      throw orderError || new Error('Unable to create order');
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      // rollback order
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // decrement stock safely after order creation
    for (const it of items) {
      const { data: prod, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', it.id)
        .single();

      if (productError || !prod) {
        throw productError || new Error(`Product not found for ID ${it.id}`);
      }

      const newStock = prod.stock_quantity - it.quantity;
      if (newStock < 0) {
        throw new Error(`Insufficient stock for product ${it.id}`);
      }

      const { error: updErr } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', it.id);

      if (updErr) {
        throw updErr;
      }
    }

    return NextResponse.json({ order_id: order.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { order_id, status } = body;
    if (!order_id || !status) return NextResponse.json({ error: 'order_id and status required' }, { status: 400 });

    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase.from('orders').update({ status }).eq('id', order_id).select();
    if (error) throw error;

    return NextResponse.json({ order: data?.[0] || null }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
