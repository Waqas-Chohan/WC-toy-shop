"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RevenueChart } from '@/components/dashboard/charts/revenue-chart';
import { PipelineOverview } from '@/components/dashboard/charts/pipeline-overview';
import { RecentDeals } from '@/components/dashboard/recent-deals';
import { TopPerformers } from '@/components/dashboard/top-performers';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';

interface DashboardSummary {
  totalRevenue: number;
  conversionRate: number;
  activeCarts: number;
  newUsers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  wishlistItems: number;
}

const emptySummary: DashboardSummary = {
  totalRevenue: 0,
  conversionRate: 0,
  activeCarts: 0,
  newUsers: 0,
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  deliveredOrders: 0,
  totalUsers: 0,
  wishlistItems: 0,
};

export function OverviewSection() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const headers: HeadersInit = {};

      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-email'] = user.email;
      }

      const response = await fetch('/api/dashboard/summary', {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (error: any) {
      console.error('Dashboard summary load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();

    const orderChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadSummary();
        }
      )
      .subscribe();

    const cartChannel = supabase
      .channel('public:cart_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items' },
        () => {
          loadSummary();
        }
      )
      .subscribe();

    const wishlistChannel = supabase
      .channel('public:wishlist')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishlist' },
        () => {
          loadSummary();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(cartChannel);
      supabase.removeChannel(wishlistChannel);
    };
  }, [user?.id, user?.email]);

  const revenueLabel = summary.totalRevenue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={isLoading ? 'Loading...' : revenueLabel}
          change={`${summary.conversionRate.toFixed(1)}%`}
          changeType={summary.conversionRate >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          delay={0}
        />
        <MetricCard
          title="Conversion Rate"
          value={isLoading ? 'Loading...' : `${summary.conversionRate.toFixed(1)}%`}
          change={`${summary.totalOrders} orders`}
          changeType="positive"
          icon={TrendingUp}
          delay={1}
        />
        <MetricCard
          title="Active Carts"
          value={isLoading ? 'Loading...' : String(summary.activeCarts)}
          change={`${summary.wishlistItems} wishlist items`}
          changeType="neutral"
          icon={Target}
          delay={2}
        />
        <MetricCard
          title="New Leads"
          value={isLoading ? 'Loading...' : String(summary.newUsers)}
          change={`${summary.totalUsers} users`}
          changeType="positive"
          icon={Users}
          delay={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <PipelineOverview />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDeals />
        <TopPerformers />
      </div>
    </div>
  );
}
