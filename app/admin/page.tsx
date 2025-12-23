import { StatsCard } from "@/components/admin/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAdminStats } from "@/app/actions/admin"
import { getAllOrders } from "@/lib/db/orders"
import { DollarSign, ShoppingCart, Package, Activity, Clock, XCircle } from "lucide-react"
import { DateRangeFilter } from "@/components/admin/date-range-filter"

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>
}) {
  const params = await searchParams

  const dateRange = params.start && params.end ? { start: params.start, end: params.end } : undefined

  const stats = await getAdminStats(dateRange)
  const recentOrders = await getAllOrders(10)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here is an overview of your platform.</p>
        </div>
        <DateRangeFilter />
      </div>

      {/* Stats Grid - Only showing completed order metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${(stats.totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          change="From completed orders only"
          changeType="neutral"
          icon={DollarSign}
        />
        <StatsCard
          title="Completed Orders"
          value={stats.completedOrders.toString()}
          change={`${stats.totalOrders} total orders`}
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders.toString()}
          change={stats.pendingOrders > 0 ? "Awaiting payment" : "None pending"}
          changeType={stats.pendingOrders > 0 ? "neutral" : "positive"}
          icon={Clock}
        />
        <StatsCard
          title="Failed Orders"
          value={stats.failedOrders.toString()}
          change={stats.failedOrders > 0 ? "Payment failed" : "No failures"}
          changeType={stats.failedOrders > 0 ? "negative" : "positive"}
          icon={XCircle}
        />
      </div>

      {/* Product Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          change={`${stats.statusCounts.undetected} undetected`}
          changeType="positive"
          icon={Package}
        />
        <StatsCard
          title="Products Down"
          value={stats.statusCounts.down.toString()}
          change={stats.statusCounts.down > 0 ? "Needs attention" : "All operational"}
          changeType={stats.statusCounts.down > 0 ? "negative" : "positive"}
          icon={Activity}
        />
      </div>

      {/* Product Status Overview */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Product Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">{stats.statusCounts.undetected} Undetected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-muted-foreground">{stats.statusCounts.updating} Updating</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">{stats.statusCounts.testing} Testing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">{stats.statusCounts.down} Down</span>
            </div>
          </div>
          {stats.totalProducts > 0 && (
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden flex">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(stats.statusCounts.undetected / stats.totalProducts) * 100}%` }}
              />
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${(stats.statusCounts.updating / stats.totalProducts) * 100}%` }}
              />
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(stats.statusCounts.testing / stats.totalProducts) * 100}%` }}
              />
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(stats.statusCounts.down / stats.totalProducts) * 100}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.slice(0, 8).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {order.customer_email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.product?.name || "Unknown Product"}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">${(order.amount_cents / 100).toFixed(2)}</p>
                    <Badge
                      variant="outline"
                      className={
                        order.status === "completed" || order.status === "paid"
                          ? "border-green-500/30 text-green-400 bg-green-500/10"
                          : order.status === "pending"
                            ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                            : "border-red-500/30 text-red-400 bg-red-500/10"
                      }
                    >
                      {order.status === "paid" ? "completed" : order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
