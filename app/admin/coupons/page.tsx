import { Suspense } from "react"
import { getAllCoupons } from "@/lib/db/coupons"
import { CouponsManager } from "@/components/admin/coupons-manager"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

async function CouponsData() {
  const coupons = await getAllCoupons()
  return <CouponsManager initialCoupons={coupons} />
}

function CouponsSkeleton() {
  return (
    <Card className="glass-panel border-primary/20">
      <CardContent className="p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
            <Skeleton className="h-8 w-24 bg-muted" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 bg-muted" />
            </div>
            <Skeleton className="h-8 w-20 bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
        <p className="text-muted-foreground">Create and manage discount codes</p>
      </div>

      <Suspense fallback={<CouponsSkeleton />}>
        <CouponsData />
      </Suspense>
    </div>
  )
}
