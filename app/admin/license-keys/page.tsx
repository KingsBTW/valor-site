import { Suspense } from "react"
import { getAllProductsWithVariantsAndStock } from "@/app/actions/license-keys"
import { LicenseKeysManager } from "@/components/admin/license-keys-manager"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

async function LicenseKeysData() {
  const products = await getAllProductsWithVariantsAndStock()
  return <LicenseKeysManager initialProducts={products} />
}

function LicenseKeysSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="glass-panel border-primary/20">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-10 w-64 bg-muted" />
            <Skeleton className="h-10 w-48 bg-muted" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
              <Skeleton className="h-12 w-12 rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 bg-muted" />
                <Skeleton className="h-3 w-32 bg-muted" />
              </div>
              <Skeleton className="h-8 w-24 bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminLicenseKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">License Keys</h1>
        <p className="text-muted-foreground">Manage license keys for all products and variants</p>
      </div>

      <Suspense fallback={<LicenseKeysSkeleton />}>
        <LicenseKeysData />
      </Suspense>
    </div>
  )
}
