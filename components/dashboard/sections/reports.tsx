"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  FileText, TrendingUp, PieChart as PieChartIcon, BarChart3, Package, DollarSign
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface TopProductItem {
  name: string;
  quantity: number;
  revenue: number;
  color: string;
}

interface MonthlyTrendItem {
  month: string;
  orders: number;
  revenue: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PALETTE = [
  "oklch(0.7 0.18 220)",  // Cyber Blue
  "oklch(0.7 0.18 145)",  // Neon Green
  "oklch(0.75 0.18 55)",   // Warm Amber
  "oklch(0.65 0.2 25)",    // Electric Coral
  "oklch(0.7 0.15 300)",   // High-tech Purple
];

export function ReportsSection() {
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalQuantity: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  });

  const loadReportData = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`id, total_amount, status, created_at, order_items(quantity, price, product:product_id(name))`);

      if (ordersError) throw ordersError;

      const productMap: Record<string, { quantity: number; revenue: number }> = {};
      let totalQuantity = 0;

      (ordersData || []).forEach((order: any) => {
        const isCancelled = order.status === "cancelled";
        if (isCancelled) return;

        const items = order.order_items || [];
        items.forEach((item: any) => {
          const prodName = item.product?.name || "Deleted Product";
          const qty = Number(item.quantity || 0);
          const price = Number(item.price || 0);
          const subtotal = qty * price;

          totalQuantity += qty;

          if (!productMap[prodName]) {
            productMap[prodName] = { quantity: 0, revenue: 0 };
          }
          productMap[prodName].quantity += qty;
          productMap[prodName].revenue += subtotal;
        });
      });

      const sortedProducts = Object.entries(productMap)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.quantity - a.quantity);

      const displayedProducts: TopProductItem[] = [];
      let otherQty = 0;
      let otherRev = 0;

      sortedProducts.forEach((p, idx) => {
        if (idx < 4) {
          displayedProducts.push({
            name: p.name,
            quantity: p.quantity,
            revenue: p.revenue,
            color: PALETTE[idx % PALETTE.length],
          });
        } else {
          otherQty += p.quantity;
          otherRev += p.revenue;
        }
      });

      if (otherQty > 0) {
        displayedProducts.push({
          name: "Others",
          quantity: otherQty,
          revenue: otherRev,
          color: PALETTE[4],
        });
      }

      setTopProducts(displayedProducts);

      const validOrders = (ordersData || [])
        .map((order: any) => ({
          ...order,
          created_at: order.created_at ? new Date(order.created_at) : null,
        }))
        .filter((order: any) => order.created_at instanceof Date && !Number.isNaN(order.created_at.getTime()));

      const chartYear = validOrders.length
        ? validOrders.reduce((latest: Date, order: any) =>
            order.created_at > latest ? order.created_at : latest,
          validOrders[0].created_at
          ).getFullYear()
        : new Date().getFullYear();

      const trendData: MonthlyTrendItem[] = MONTH_NAMES.map((month) => ({
        month,
        orders: 0,
        revenue: 0,
      }));

      let deliveredRevenue = 0;
      let deliveredCount = 0;

      validOrders.forEach((order: any) => {
        if (order.created_at.getFullYear() !== chartYear) return;

        const monthIndex = order.created_at.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          trendData[monthIndex].orders += 1;
          if (order.status === "delivered") {
            const orderRevenue = Number(order.total_amount || 0);
            trendData[monthIndex].revenue += orderRevenue;
            deliveredRevenue += orderRevenue;
            deliveredCount += 1;
          }
        }
      });

      setMonthlyTrend(trendData);

      const totalOrders = validOrders.length;
      const avgValue = deliveredCount ? deliveredRevenue / deliveredCount : 0;

      setSummaryStats({
        totalQuantity,
        totalRevenue: deliveredRevenue,
        totalOrders,
        avgOrderValue: avgValue,
      });
    } catch (e) {
      console.error("Failed to load reports summary data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();

    // Subscribe to order/item changes to reload report dynamically
    const channel = supabase
      .channel("reports:realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadReportData)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, loadReportData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: `$${summaryStats.totalRevenue.toFixed(2)}`, desc: "Delivered order total", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-400" },
          { title: "Items Ordered", value: String(summaryStats.totalQuantity), desc: "Total quantity of toys purchased", icon: Package, color: "bg-cyan-500/10 text-cyan-400" },
          { title: "Total Orders", value: String(summaryStats.totalOrders), desc: "Lifetime order list count", icon: BarChart3, color: "bg-purple-500/10 text-purple-400" },
          { title: "Avg Order Value", value: `$${summaryStats.avgOrderValue.toFixed(2)}`, desc: "Average spending per order", icon: TrendingUp, color: "bg-pink-500/10 text-pink-400" },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-card border border-border rounded-xl p-5 hover:border-accent/40 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-white mb-1">{loading ? "..." : card.value}</p>
              <p className="text-xs text-slate-500">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Monthly Orders &amp; Sales</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Order volume and revenue monthly breakdown</p>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 260)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} dx={-10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "oklch(0.12 0.005 260)", border: "1px solid oklch(0.22 0.005 260)", borderRadius: "8px", fontSize: "12px" }}
                      labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 600 }}
                      formatter={(value: any, name: string) => [
                        name === "revenue" ? `$${value.toFixed(2)}` : value,
                        name === "revenue" ? "Revenue" : "Orders count",
                      ]}
                    />
                    <Line type="monotone" dataKey="orders" stroke="oklch(0.7 0.15 300)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="revenue" stroke="oklch(0.7 0.18 145)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Ordered Products Pie Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-6">
                <h3 className="text-base font-semibold text-foreground">Top Ordered Toys</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Best-selling toys by total quantity ordered</p>
              </div>
              
              {topProducts.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                  No products ordered yet.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="w-[180px] h-[180px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topProducts}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="quantity"
                        >
                          {topProducts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    {topProducts.map((p, idx) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-sm text-foreground truncate max-w-[150px]">{p.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-300">
                          {p.quantity} units (${p.revenue.toFixed(2)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List of Ordered Toys */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Product Sales List</h3>
              <p className="text-sm text-muted-foreground mt-0.5">List of toys sorted by demand and popularity</p>
            </div>
            
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No inventory logs or orders recorded.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {topProducts.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-accent">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Total quantity ordered: {p.quantity} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">${p.revenue.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Gross Sales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
