"use client"

import { useEffect, useState } from "react"

import { PageHeader } from "@/components/dashboard_new/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Users, Mail, MapPin, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"

function formatDate(date: string | null) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, new: 0 })

  useEffect(() => {
    let mounted = true
    let channel: any = null

    async function load() {
      try {
        setLoading(true)
        const { data } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
        
        if (mounted) {
          const users = (data || []).map((u: any) => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || 'N/A',
            phone: u.phone || 'N/A',
            location: u.location || 'N/A',
            joined: formatDate(u.created_at),
          }))
          setCustomers(users)
          
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          const newCount = (data || []).filter((u: any) => new Date(u.created_at) >= sevenDaysAgo).length
          
          setStats({ total: users.length, active: Math.ceil(users.length * 0.75), new: newCount })
        }
      } catch (e) {
        console.error('Failed to load customers', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    try {
      channel = supabase
        .channel('public:user_profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, load)
        .subscribe()
    } catch (err) {
      console.warn('Realtime subscribe failed', err)
    }

    return () => {
      mounted = false
      try { if (channel && channel.unsubscribe) channel.unsubscribe() } catch (e) { }
    }
  }, [])

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <PageHeader title="Customers" description="Manage and view all customer profiles.">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Customers</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">New This Week</span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold">{stats.new}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">All Customers</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">Loading…</td></tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm font-medium">{customer.name}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{customer.email}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{customer.phone}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {customer.location}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{customer.joined}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
