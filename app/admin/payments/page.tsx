import { Card, CardContent } from "@/components/ui/card"
import { getAllOrders } from "@/lib/db/orders"
import PaymentsClientComponent from "@/components/admin/payments-client"
import type { OrderWithDetails } from "@/lib/database.types"

export default async function PaymentsDashboard() {
  let orders: OrderWithDetails[] = []
  let error: string | null = null

  try {
    orders = await getAllOrders(100)
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load orders"
    console.error("Failed to load orders:", err)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments Dashboard</h1>
          <p className="text-muted-foreground">View and manage all customer payments</p>
        </div>
      </div>

      {/* Pass data to client component for interactivity */}
      {error ? (
        <Card className="glass-panel border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <PaymentsClientComponent initialOrders={orders} />
      )}
    </div>
  )
}
