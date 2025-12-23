import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { getAllProducts } from "@/lib/db/products"
import { Activity, Clock, Shield } from "lucide-react"

export default async function StatusPage() {
  const products = await getAllProducts()

  const undetectedCount = products.filter((p) => p.status === "undetected").length
  const updatingCount = products.filter((p) => p.status === "updating").length
  const testingCount = products.filter((p) => p.status === "testing").length
  const downCount = products.filter((p) => p.status === "down").length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-6">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Real-time Status</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Product <span className="gradient-text">Status</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">Live detection status for all our products</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="glass-panel border-green-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-400">{undetectedCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Undetected</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-yellow-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-yellow-400">{updatingCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Updating</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-blue-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-400">{testingCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Testing</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-red-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-red-400">{downCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Down</p>
              </CardContent>
            </Card>
          </div>

          {/* Status List */}
          <Card className="glass-panel border-primary/20">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No products found. Run the database seed scripts to add products.
                  </div>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.game}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Updated{" "}
                            {new Date(product.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <StatusBadge status={product.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="mt-8 glass-panel rounded-lg p-6 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">Status Definitions</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3">
                <StatusBadge status="undetected" size="small" />
                <span className="text-muted-foreground">
                  Product is fully operational and undetected by anti-cheat systems.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <StatusBadge status="updating" size="small" />
                <span className="text-muted-foreground">
                  Product is being updated. May experience temporary downtime.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <StatusBadge status="testing" size="small" />
                <span className="text-muted-foreground">New features are being tested. Use with caution.</span>
              </div>
              <div className="flex items-start gap-3">
                <StatusBadge status="down" size="small" />
                <span className="text-muted-foreground">Product is temporarily unavailable. Do not purchase.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
