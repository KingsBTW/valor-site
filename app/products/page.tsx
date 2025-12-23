import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductsWithFilter } from "@/components/products-with-filter"
import { getAllProducts } from "@/lib/db/products"
import { getUniqueGamesFromProducts } from "@/lib/db/categories"
import { Skeleton } from "@/components/ui/skeleton"

async function ProductsContent() {
  const [products, games] = await Promise.all([getAllProducts(), getUniqueGamesFromProducts()])

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products available. Run the database seed scripts to add products.</p>
      </div>
    )
  }

  return <ProductsWithFilter products={products} categories={games} />
}

function ProductsSkeleton() {
  return (
    <div>
      {/* Category filter skeleton */}
      <div className="mb-8">
        <Skeleton className="h-4 w-32 mb-3 bg-muted" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full bg-muted" />
          ))}
        </div>
      </div>
      {/* Products grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-lg p-4 border border-primary/20">
            <Skeleton className="h-48 w-full rounded-md bg-muted" />
            <Skeleton className="h-6 w-3/4 mt-4 bg-muted" />
            <Skeleton className="h-4 w-1/2 mt-2 bg-muted" />
            <Skeleton className="h-10 w-full mt-4 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Our <span className="gradient-text">Products</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Premium gaming enhancement software for the most popular games. All products include HWID spoofer, 24/7
              support, and instant delivery.
            </p>
          </div>

          {/* Products with filter */}
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
