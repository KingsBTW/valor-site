import { getProductBySlug } from "@/lib/db/products"
import { notFound } from "next/navigation"
import { PaymentMethodSelector } from "@/components/payment-method-selector"
import { getPaymentProvider } from "@/lib/db/settings"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductBySlug(id)

  if (!product) {
    notFound()
  }

  const paymentProvider = await getPaymentProvider()

  const lowestPrice = product.variants && product.variants.length > 0 ? Math.min(...product.variants.map((v) => v.price_cents)) : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground">
            <Link href="/products/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>

          {/* Product Header */}
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Product Image */}
              <div className="relative aspect-video overflow-hidden rounded-xl glass-panel border border-primary/20">
                <Image
                  src={product.image_url || "/placeholder.svg?height=400&width=600&query=gaming+software"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <StatusBadge status={product.status} size="large" />
                </div>
                {product.popular && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                    <p className="text-lg text-muted-foreground mt-1">{product.game}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">Starting at</span>
                    <p className="text-3xl font-bold gradient-text">${(lowestPrice / 100).toFixed(2)}</p>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Calendar className="h-4 w-4" />
                  Last updated:{" "}
                  {new Date(product.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                <Card className="glass-panel border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground">Features Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {product.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="border-t border-primary/20 pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Complete Your Purchase</h2>
            {product.variants && product.variants.length > 0 ? (
              <PaymentMethodSelector
                productSlug={product.slug}
                productName={product.name}
                productImage={product.image_url || undefined}
                productDescription={product.description || undefined}
                variants={product.variants}
                productStatus={product.status}
                availableMethods={paymentProvider}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground glass-panel rounded-xl border border-primary/20">
                <p>No pricing options available for this product.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
