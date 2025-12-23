"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Loader2 } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { updateProductStatus, bulkUpdateProductStatus } from "@/app/actions/admin"
import { toast } from "sonner"
import type { Product } from "@/lib/database.types"

interface StatusManagerProps {
  initialProducts: Product[]
}

export function StatusManager({ initialProducts }: StatusManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (productId: string, newStatus: Product["status"]) => {
    startTransition(async () => {
      const result = await updateProductStatus(productId, newStatus)
      if (result.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p)))
        toast.success("Status updated")
      } else {
        toast.error(result.error || "Failed to update status")
      }
    })
  }

  const handleBulkUpdate = (status: Product["status"]) => {
    startTransition(async () => {
      const productIds = products.map((p) => p.id)
      const result = await bulkUpdateProductStatus(productIds, status)
      if (result.success) {
        setProducts((prev) => prev.map((p) => ({ ...p, status })))
        toast.success(`All products marked as ${status}`)
      } else {
        toast.error(result.error || "Failed to update products")
      }
    })
  }

  const undetectedCount = products.filter((p) => p.status === "undetected").length
  const updatingCount = products.filter((p) => p.status === "updating").length
  const testingCount = products.filter((p) => p.status === "testing").length
  const downCount = products.filter((p) => p.status === "down").length

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => handleBulkUpdate("updating")}
          disabled={isPending}
          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
        >
          {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Mark All Updating
        </Button>
        <Button
          onClick={() => handleBulkUpdate("undetected")}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          Mark All Undetected
        </Button>
        <Button
          variant="outline"
          onClick={() => handleBulkUpdate("down")}
          disabled={isPending}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
        >
          {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
          Mark All Down
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{undetectedCount}</p>
                <p className="text-sm text-muted-foreground">Undetected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{updatingCount}</p>
                <p className="text-sm text-muted-foreground">Updating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{testingCount}</p>
                <p className="text-sm text-muted-foreground">Testing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{downCount}</p>
                <p className="text-sm text-muted-foreground">Down</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Status List */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Individual Product Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No products found</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.game}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-muted-foreground hidden sm:block">
                      Updated: {new Date(product.updated_at).toLocaleDateString()}
                    </div>
                    <Select
                      value={product.status}
                      onValueChange={(value) => handleStatusChange(product.id, value as Product["status"])}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-36 bg-transparent border-border">
                        <StatusBadge status={product.status} size="small" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel border-primary/20">
                        <SelectItem value="undetected">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Undetected
                          </div>
                        </SelectItem>
                        <SelectItem value="updating">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            Updating
                          </div>
                        </SelectItem>
                        <SelectItem value="testing">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            Testing
                          </div>
                        </SelectItem>
                        <SelectItem value="down">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            Down
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
