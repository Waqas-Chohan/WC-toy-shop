"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard_new/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ShoppingCart, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react"
import { supabase } from '@/lib/supabase'

function formatCurrency(val: any) {
  if (val == null) return "$0.00"
  const num = Number(val)
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" })
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
      let mounted = true
      let ordersChannel: any = null

      async function load() {
        try {
          setLoading(true)
          const [ordersRes, summaryRes] = await Promise.all([
            fetch('/api/orders').then((r) => r.json()),
            fetch('/api/dashboard/summary').then((r) => r.json()),
          ])

          if (mounted) {
            setOrders((ordersRes.orders || []).map((o: any) => ({
              id: o.id,
              customer: o.user?.name || o.user_email || (o.user?.email ?? 'Unknown'),
              email: o.user?.email || o.user_email || '',
              items: (o.order_items || []).length,
              total: formatCurrency(o.total_amount || o.total || 0),
              status: o.status || 'unknown',
              date: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A',
              payment: o.payment_method || 'N/A',
            })))

            const sum = summaryRes || {}
            setStats([
              { label: 'Total Orders', value: sum.totalOrders?.toString() || '0', change: '', icon: ShoppingCart },
              { label: 'Pending', value: sum.pendingOrders?.toString() || '0', change: '', icon: Clock },
              { label: 'Delivered', value: sum.completedOrders?.toString() || '0', change: '', icon: Truck },
              { label: 'Revenue', value: formatCurrency(sum.totalRevenue || 0), change: '', icon: CheckCircle },
            ])
          }
        } catch (e) {
          console.error('Failed to load orders', e)
        } finally {
          if (mounted) setLoading(false)
        }
      }

      load()

      // Setup Supabase realtime subscriptions (client)
      try {
        if (supabase && supabase.channel) {
          ordersChannel = supabase
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
              // refresh orders list and summary on any change
              fetch('/api/orders').then((r) => r.json()).then((data) => {
                if (!mounted) return
                setOrders((data.orders || []).map((o: any) => ({
                  id: o.id,
                  customer: o.user?.name || o.user_email || (o.user?.email ?? 'Unknown'),
                  email: o.user?.email || o.user_email || '',
                  items: (o.order_items || []).length,
                  total: formatCurrency(o.total_amount || o.total || 0),
                  status: o.status || 'unknown',
                  date: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A',
                  payment: o.payment_method || 'N/A',
                })))
              }).catch(console.error)

              // refresh summary
              fetch('/api/dashboard/summary').then((r) => r.json()).then((sum) => {
                if (!mounted) return
                setStats([
                  { label: 'Total Orders', value: sum.totalOrders?.toString() || '0', change: '', icon: ShoppingCart },
                  { label: 'Pending', value: sum.pendingOrders?.toString() || '0', change: '', icon: Clock },
                  { label: 'Delivered', value: sum.completedOrders?.toString() || '0', change: '', icon: Truck },
                  { label: 'Revenue', value: formatCurrency(sum.totalRevenue || 0), change: '', icon: CheckCircle },
                ])
              }).catch(console.error)
            })
            .subscribe()
        }
      } catch (err) {
        console.warn('Realtime subscribe failed', err)
      }

      return () => {
        mounted = false
        try {
          if (ordersChannel && ordersChannel.unsubscribe) ordersChannel.unsubscribe()
        } catch (e) {
          // ignore
        }
      }
    }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'Completed':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'Processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
      case 'Shipped':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-3 h-3" />
      case 'Processing':
      case 'processing':
        return <Clock className="w-3 h-3" />
      case 'Shipped':
      case 'shipped':
        return <Truck className="w-3 h-3" />
      case 'Pending':
      case 'pending':
        return <Package className="w-3 h-3" />
      case 'Cancelled':
      case 'cancelled':
        return <XCircle className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <Header />
        <main className="p-6">
      <PageHeader title="Orders" description="Track and manage customer orders.">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="p-2 bg-muted rounded-lg">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="text-xs text-[var(--color-positive)] mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(null)}
          className={statusFilter === null ? 'bg-foreground text-background' : 'bg-transparent'}
        >
          All Orders
        </Button>
        {['pending', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? 'bg-foreground text-background' : 'bg-transparent'}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">All Orders</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Payment</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">Loading…</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer">
                      <td className="py-3 px-2">
                        <span className="text-sm font-medium">{order.id}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-sm font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{order.date}</td>
                      <td className="py-3 px-2 text-sm text-center">{order.items}</td>
                      <td className="py-3 px-2 text-sm">{order.payment}</td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-medium">{order.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </main>
      </div>
    </div>
  )
}
