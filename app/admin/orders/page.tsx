import { Suspense } from "react"
import { getAllOrders } from "@/lib/db/orders"
import { OrdersTable } from "@/components/admin/orders-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

async function OrdersData() {
  const orders = await getAllOrders(100)
  return <OrdersTable initialOrders={orders} />
}

function OrdersTableSkeleton() {
  return (
    <Card className="glass-panel border-primary/20">
      <CardContent className="p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
            <Skeleton className="h-8 w-24 bg-muted" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-3 w-48 bg-muted" />
            </div>
            <Skeleton className="h-6 w-20 bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersData />
      </Suspense>
    </div>
  )
}
