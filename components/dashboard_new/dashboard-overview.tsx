"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard_new/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { supabase } from "@/lib/supabase"
import { ShoppingCart, Users, Zap, TrendingUp } from "lucide-react"

type RevenueEntry = { name: string; revenue: number }
type StatusEntry = { name: string; value: number }

type DashboardStats = {
  orders: number
  users: number
  revenue: number
  conversionRate: number
}

type ChartData = {
  revenue: RevenueEntry[]
  status: StatusEntry[]
}

const COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6']

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({ orders: 0, users: 0, revenue: 0, conversionRate: 0 })
  const [chartData, setChartData] = useState<ChartData>({ revenue: [], status: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let channel: any = null

    async function load() {
      try {
        setLoading(true)
        const summaryRes = await fetch('/api/dashboard/summary').then(r => r.json())

        if (mounted && summaryRes) {
          setStats({
            orders: summaryRes.totalOrders || 0,
            users: summaryRes.totalUsers || 0,
            revenue: summaryRes.totalRevenue || 0,
            conversionRate: summaryRes.conversionRate || 0,
          })

          // Fetch revenue data for chart
          const year = new Date().getFullYear()
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount, status, created_at')
            .gte('created_at', `${year}-01-01`)

          if (orders) {
            const revenue = months.map((month, idx) => {
              const monthOrders = orders.filter(
                (o: any) => new Date(o.created_at).getMonth() === idx && o.status === 'delivered'
              )
              return {
                name: month,
                revenue: monthOrders.reduce((sum, o: any) => sum + Number(o.total_amount || 0), 0),
              }
            })

            const statusCounts = {
              Pending: orders.filter((o: any) => o.status === 'pending').length,
              Prepared: orders.filter((o: any) => o.status === 'prepared').length,
              Dispatched: orders.filter((o: any) => o.status === 'dispatched').length,
              Delivered: orders.filter((o: any) => o.status === 'delivered').length,
              Cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
            }

            setChartData({
              revenue,
              status: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
            })
          }

          setStats((prev) => ({
            ...prev,
            revenue: summaryRes.totalRevenue || 0,
            orders: summaryRes.totalOrders || 0,
            users: summaryRes.totalUsers || 0,
            conversionRate: summaryRes.conversionRate || 0,
          }))
        }
      } catch (e) {
        console.error('Failed to load dashboard', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    try {
      channel = supabase
        .channel('public:dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
        .subscribe()
    } catch (err) {
      console.warn('Realtime failed', err)
    }

    return () => {
      mounted = false
      try { if (channel && channel.unsubscribe) channel.unsubscribe() } catch (e) { }
    }
  }, [])

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome to your admin dashboard. Real-time metrics and insights." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{stats.orders}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{stats.users}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">${(stats.revenue / 1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{stats.conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Revenue This Year</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground">Loading…</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground">Loading…</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.status}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
