'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock3, Truck, CheckCircle2, Package } from 'lucide-react';

const statusOptions = ['pending', 'prepared', 'dispatched', 'delivered'] as const;

const statusLabel = {
  pending: 'Pending',
  prepared: 'Prepared',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
};

const statusBadge = {
  pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  prepared: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  dispatched: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

export function OrdersSection() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user?.id || !user.email) return;

    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          'x-user-id': user.id,
          'x-user-email': user.email,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error('Orders fetch failed', data);
      }
    } catch (error) {
      console.error('Error loading orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (!user?.id) return;

    const channel = supabase
      .channel('public:orders-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.email]);

  const handleStatusChange = async (orderId: string, status: string) => {
    if (!user?.id || !user.email) return;
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-email': user.email,
        },
        body: JSON.stringify({ order_id: orderId, status }),
      });
      const data = await response.json();
      if (response.ok) {
        setOrders((current) =>
          current.map((order) => (order.id === orderId ? data.order : order))
        );
      } else {
        console.error('Failed to update order status', data);
      }
    } catch (error) {
      console.error('Order status update error', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr,0.9fr] gap-6">
        <div className="glass-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Order Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and update order status for all customers in real time.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              {orders.length} orders
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No orders have been placed yet.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="glass-card border border-border p-5 rounded-3xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span>Order ID:</span>
                        <span className="font-medium text-foreground">{order.id}</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        ${Number(order.total_amount).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <Badge className={statusBadge[order.status] || statusBadge.pending}>
                        {statusLabel[order.status as keyof typeof statusLabel] || order.status}
                      </Badge>
                      <select
                        value={order.status}
                        onChange={(event) => handleStatusChange(order.id, event.target.value)}
                        className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                        disabled={updatingOrderId === order.id}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-slate-950/70 p-4">
                      <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-2">Customer</p>
                      <p className="font-medium text-white">{order.user?.name || order.user?.email || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">
                      <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-2">Items</p>
                      <p className="text-sm text-foreground font-medium">{order.order_items?.length || 0} products</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">
                      <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-2">Delivery</p>
                      <p className="text-sm text-foreground">{statusLabel[order.status as keyof typeof statusLabel]}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <div className="text-sm text-muted-foreground mb-3">Order items</div>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm text-cyan-400">${Number(item.price).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card border border-border p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold">Status guide</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><span className="font-semibold text-foreground">Pending</span> – order received and waiting for preparation.</p>
            <p><span className="font-semibold text-foreground">Prepared</span> – order packed and ready to ship.</p>
            <p><span className="font-semibold text-foreground">Dispatched</span> – order is on the way.</p>
            <p><span className="font-semibold text-foreground">Delivered</span> – customer has received the order.</p>
          </div>
          <div className="mt-6 rounded-3xl bg-slate-950/80 border border-border p-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Truck className="w-4 h-4" />
              Orders update live for admins and customers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
