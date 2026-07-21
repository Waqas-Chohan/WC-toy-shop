"use client"

import { PageHeader } from "@/components/dashboard_new/page-header"
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

export default function AdminSalesPage() {
  return (
    <>
      <PageHeader title="Sales Analytics" description="Track your sales performance and product metrics.">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm">
          <Calendar className="w-4 h-4" />
          This Year
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Top products data will appear here (connected to Supabase).</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
