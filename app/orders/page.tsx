'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, Clock, ArrowRight, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; images: string[] } | null;
}

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'prepared' | 'dispatched' | 'delivered';
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: Clock,
    step: 1,
  },
  prepared: {
    label: 'Prepared',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/30',
    icon: Package,
    step: 2,
  },
  dispatched: {
    label: 'Dispatched',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/30',
    icon: Truck,
    step: 3,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    icon: CheckCircle2,
    step: 4,
  },
};

const STEPS = [
  { step: 1, label: 'Order Placed', icon: ShoppingBag },
  { step: 2, label: 'Prepared', icon: Package },
  { step: 3, label: 'On the Way', icon: Truck },
  { step: 4, label: 'Delivered', icon: CheckCircle2 },
];

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, product:product_id(name, images))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setOrders((data as Order[]) || []);
      setLoading(false);
    };

    fetchOrders();

    // Live updates: re-fetch when admin changes status
    const channel = supabase
      .channel(`orders:user:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your orders</h1>
        <p className="text-slate-400 mb-6">Track the status of your purchases here.</p>
        <Link href="/" className="btn-futuristic px-6 py-3 rounded-xl">
          Go to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">No orders yet</h1>
        <p className="text-slate-400 mb-6">Your order history will appear here.</p>
        <Link href="/products" className="btn-futuristic px-6 py-3 rounded-xl">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold gradient-text-glow mb-2">My Orders</h1>
      <p className="text-slate-400 mb-8">Track the live status of your purchases.</p>

      <div className="space-y-6">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
          const StatusIcon = cfg.icon;
          const currentStep = cfg.step;
          const isExpanded = expandedId === order.id;

          return (
            <div key={order.id} className="glass-card rounded-2xl border border-cyan-500/10 overflow-hidden">
              {/* Header row */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">ORDER ID</p>
                  <p className="font-mono text-sm text-white">{order.id.slice(0, 16)}…</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {cfg.label}
                  </div>
                  <p className="text-lg font-bold text-cyan-400">${Number(order.total_amount).toFixed(2)}</p>
                </div>
              </div>

              {/* Progress tracker */}
              <div className="px-5 pb-4">
                <div className="flex items-center">
                  {STEPS.map((s, idx) => {
                    const done = s.step <= currentStep;
                    const Icon = s.icon;
                    return (
                      <div key={s.step} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? 'bg-cyan-500 border-cyan-500 text-white'
                              : 'bg-slate-800 border-slate-600 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs mt-1 text-center ${done ? 'text-cyan-400' : 'text-slate-600'}`}>
                            {s.label}
                          </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 -mt-4 rounded-full transition-all ${
                            s.step < currentStep ? 'bg-cyan-500' : 'bg-slate-700'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expand / collapse items */}
              <div className="border-t border-cyan-500/10">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <span>{order.order_items?.length || 0} item(s)</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-3">
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{item.product?.name ?? 'Product'}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-cyan-400 font-semibold text-sm">
                          ${Number(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
