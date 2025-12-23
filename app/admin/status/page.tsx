import { Suspense } from "react"
import { getAllProducts } from "@/lib/db/products"
import { StatusManager } from "@/components/admin/status-manager"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

async function StatusData() {
  const products = await getAllProducts()
  return <StatusManager initialProducts={products} />
}

function StatusSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-panel border-primary/20">
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass-panel border-primary/20">
        <CardContent className="p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4 last:mb-0 bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminStatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Status Management</h1>
        <p className="text-muted-foreground">Control product detection status</p>
      </div>

      <Suspense fallback={<StatusSkeleton />}>
        <StatusData />
      </Suspense>
    </div>
  )
}
