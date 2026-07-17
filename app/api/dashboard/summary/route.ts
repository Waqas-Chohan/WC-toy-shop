import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  const adminId = await getAdminUserId(supabase, request);

  if (!adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [ordersRes, usersRes, cartsRes, wishlistRes] = await Promise.all([
    supabase.from('orders').select('total_amount, status, created_at'),
    supabase.from('user_profiles').select('created_at'),
    supabase.from('cart_items').select('id'),
    supabase.from('wishlist').select('id'),
  ]);

  const error = ordersRes.error || usersRes.error || cartsRes.error || wishlistRes.error;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = ordersRes.data || [];
  const users = usersRes.data || [];
  const carts = cartsRes.data || [];
  const wishlists = wishlistRes.data || [];

  const deliveredOrders = orders.filter((order) => order.status === 'delivered');
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const inProgressOrders = orders.filter(
    (order) => order.status === 'prepared' || order.status === 'dispatched'
  ).length;
  const totalOrders = orders.length;
  const completedOrders = deliveredOrders.length;
  const totalRevenue = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );
  const conversionRate = totalOrders
    ? Math.round((completedOrders / totalOrders) * 1000) / 10
    : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsers = users.filter((user) => new Date(user.created_at) >= sevenDaysAgo).length;

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    completedOrders,
    pendingOrders,
    deliveredOrders,
    conversionRate,
    totalUsers: users.length,
    newUsers,
    activeCarts: carts.length,
    wishlistItems: wishlists.length,
  });
}
