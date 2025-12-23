import { Suspense } from "react"
import { getAllProducts } from "@/lib/db/products"
import { ProductsTable } from "@/components/admin/products-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

async function ProductsData() {
  const products = await getAllProducts()
  return <ProductsTable initialProducts={products} />
}

function ProductsTableSkeleton() {
  return (
    <Card className="glass-panel border-primary/20">
      <CardContent className="p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
            <Skeleton className="h-10 w-10 rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-3 w-24 bg-muted" />
            </div>
            <Skeleton className="h-8 w-24 bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog, variants, and license keys</p>
      </div>

      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsData />
      </Suspense>
    </div>
  )
}
