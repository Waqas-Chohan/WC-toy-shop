'use client'


import { PageHeader } from "@/components/dashboard_new/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download, TrendingUp, DollarSign } from "lucide-react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e']

type RevenueEntry = { name: string; revenue: number }
type StatusEntry = { name: string; value: number }
type ProductEntry = { name: string; quantity: number; revenue: number; color: string }

export default function ReportsPage() {
  const [chartData, setChartData] = useState<{
    revenue: RevenueEntry[]
    topProducts: ProductEntry[]
    orderStatus: StatusEntry[]
  }>({
    revenue: [],
    topProducts: [],
    orderStatus: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let channel: any = null

    async function load() {
      try {
        setLoading(true)

        const year = new Date().getFullYear()
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, status, created_at, order_items(quantity, price, product:product_id(name))')
          .gte('created_at', `${year}-01-01`)

        const topProductMap: Record<string, { quantity: number; revenue: number }> = {}

        ;(orders || []).forEach((order: any) => {
          if (order.status === 'cancelled') return

          (order.order_items || []).forEach((item: any) => {
            const name = item.product?.name || 'Unknown Product'
            const qty = Number(item.quantity || 0)
            const price = Number(item.price || 0)
            const revenue = qty * price

            if (!topProductMap[name]) {
              topProductMap[name] = { quantity: 0, revenue: 0 }
            }
            topProductMap[name].quantity += qty
            topProductMap[name].revenue += revenue
          })
        })

        const sortedTopProducts = Object.entries(topProductMap)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.quantity - a.quantity)

        const topProducts = sortedTopProducts.slice(0, 6).map((product, idx) => ({
          ...product,
          color: COLORS[idx % COLORS.length],
        }))

        if (mounted && orders) {
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
            orderStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
            topProducts,
          })
        }
      } catch (e) {
        console.error('Failed to load reports', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    try {
      channel = supabase
        .channel('public:reports')
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

  const totalRevenue = chartData.revenue.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = chartData.orderStatus.reduce((sum, item) => sum + item.value, 0)
  const deliveredOrders = chartData.orderStatus.find((item) => item.name === 'Delivered')?.value || 0
  const avgOrderValue = deliveredOrders ? totalRevenue / deliveredOrders : 0

  return (
    <>
      <PageHeader title="Reports & Analytics" description="Comprehensive business insights and metrics.">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm">
          <Calendar className="w-4 h-4" />
          This Year
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Order Value</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{avgOrderValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">Loading…</div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">Loading…</div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.orderStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {chartData.orderStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {chartData.topProducts.length > 0 && (
        <Card className="bg-card border border-border mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Top Ordered Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.topProducts} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={40} paddingAngle={3}>
                      {chartData.topProducts.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} items`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                {chartData.topProducts.map((product: any, idx: number) => (
                  <div key={product.name} className="rounded-xl border border-border p-4 bg-slate-950/70">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} units ordered</p>
                      </div>
                      <span className="text-sm font-semibold text-cyan-400">${product.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 mt-3 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.min(100, (product.quantity / Math.max(...chartData.topProducts.map((p: any) => p.quantity))) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">Loading…</div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
