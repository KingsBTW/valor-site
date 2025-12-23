"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Key, Plus, Trash2, Package, Loader2, Eye, EyeOff, Copy, CheckCircle2, RefreshCcw } from "lucide-react"
import {
  addLicenseKeysToVariant,
  getLicenseKeysByVariant,
  deleteLicenseKey,
  bulkDeleteUnusedKeys,
} from "@/app/actions/license-keys"
import { toast } from "sonner"
import type { ProductVariant, LicenseKey } from "@/lib/database.types"

interface ProductWithVariants {
  id: string
  name: string
  game: string
  image_url: string | null
  variants: (ProductVariant & { stock: { total: number; unused: number; used: number } })[]
}

interface LicenseKeysManagerProps {
  initialProducts: ProductWithVariants[]
}

export function LicenseKeysManager({ initialProducts }: LicenseKeysManagerProps) {
  const [products, setProducts] = useState<ProductWithVariants[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<
    (ProductVariant & { stock: { total: number; unused: number; used: number } }) | null
  >(null)
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
  const [isViewKeysDialogOpen, setIsViewKeysDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([])
  const [newKeys, setNewKeys] = useState("")
  const [showKeys, setShowKeys] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.game.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleOpenRestockDialog = (
    product: ProductWithVariants,
    variant: ProductVariant & { stock: { total: number; unused: number; used: number } },
  ) => {
    setSelectedProduct(product)
    setSelectedVariant(variant)
    setNewKeys("")
    setIsRestockDialogOpen(true)
  }

  const handleOpenViewKeysDialog = async (
    product: ProductWithVariants,
    variant: ProductVariant & { stock: { total: number; unused: number; used: number } },
  ) => {
    setSelectedProduct(product)
    setSelectedVariant(variant)
    setShowKeys(false)
    setIsViewKeysDialogOpen(true)

    startTransition(async () => {
      const keys = await getLicenseKeysByVariant(variant.id)
      setLicenseKeys(keys)
    })
  }

  const handleAddKeys = () => {
    if (!selectedVariant) return

    startTransition(async () => {
      const keys = newKeys.split("\n").filter((k) => k.trim())
      const result = await addLicenseKeysToVariant(selectedVariant.id, keys)

      if (result.success) {
        toast.success(
          `Added ${result.count} license keys${result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ""}`,
        )
        setIsRestockDialogOpen(false)
        setNewKeys("")

        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === selectedProduct?.id) {
              return {
                ...p,
                variants: p.variants.map((v) => {
                  if (v.id === selectedVariant.id) {
                    return {
                      ...v,
                      stock: {
                        ...v.stock,
                        total: v.stock.total + (result.count || 0),
                        unused: v.stock.unused + (result.count || 0),
                      },
                    }
                  }
                  return v
                }),
              }
            }
            return p
          }),
        )
      } else {
        toast.error(result.error || "Failed to add license keys")
      }
    })
  }

  const handleDeleteKey = (keyId: string) => {
    startTransition(async () => {
      const result = await deleteLicenseKey(keyId)
      if (result.success) {
        toast.success("License key deleted")
        setLicenseKeys((prev) => prev.filter((k) => k.id !== keyId))

        if (selectedProduct && selectedVariant) {
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id === selectedProduct.id) {
                return {
                  ...p,
                  variants: p.variants.map((v) => {
                    if (v.id === selectedVariant.id) {
                      return {
                        ...v,
                        stock: {
                          ...v.stock,
                          total: v.stock.total - 1,
                          unused: v.stock.unused - 1,
                        },
                      }
                    }
                    return v
                  }),
                }
              }
              return p
            }),
          )
        }
      } else {
        toast.error(result.error || "Failed to delete license key")
      }
    })
  }

  const handleBulkDelete = () => {
    if (!selectedVariant) return

    startTransition(async () => {
      const result = await bulkDeleteUnusedKeys(selectedVariant.id)
      if (result.success) {
        toast.success(`Deleted ${result.count} unused license keys`)
        setIsBulkDeleteDialogOpen(false)
        setLicenseKeys((prev) => prev.filter((k) => k.status !== "unused"))

        if (selectedProduct && selectedVariant) {
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id === selectedProduct.id) {
                return {
                  ...p,
                  variants: p.variants.map((v) => {
                    if (v.id === selectedVariant.id) {
                      return {
                        ...v,
                        stock: {
                          ...v.stock,
                          total: v.stock.total - (result.count || 0),
                          unused: 0,
                        },
                      }
                    }
                    return v
                  }),
                }
              }
              return p
            }),
          )
        }
      } else {
        toast.error(result.error || "Failed to delete license keys")
      }
    })
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success("Copied to clipboard")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unused":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Available</Badge>
      case "used":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Used</Badge>
      case "expired":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <Card className="glass-panel border-primary/20">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No products match your search" : "No products found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="glass-panel border-primary/20 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                    {product.image_url ? (
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.game}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{variant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {variant.duration_days} day{variant.duration_days !== 1 ? "s" : ""} - ${variant.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{variant.stock.unused} available</p>
                          <p className="text-xs text-muted-foreground">
                            {variant.stock.used} used / {variant.stock.total} total
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent"
                            onClick={() => handleOpenViewKeysDialog(product, variant)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleOpenRestockDialog(product, variant)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Restock
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add License Keys
            </DialogTitle>
            <DialogDescription>
              Add license keys for {selectedProduct?.name} - {selectedVariant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keys" className="text-foreground">
                License Keys (one per line)
              </Label>
              <Textarea
                id="keys"
                value={newKeys}
                onChange={(e) => setNewKeys(e.target.value)}
                placeholder={"XXXX-XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY-YYYY\nZZZZ-ZZZZ-ZZZZ-ZZZZ"}
                className="min-h-[200px] font-mono text-sm bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                {newKeys.split("\n").filter((k) => k.trim()).length} keys entered
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleAddKeys}
              disabled={isPending || !newKeys.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Add Keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewKeysDialogOpen} onOpenChange={setIsViewKeysDialogOpen}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              License Keys - {selectedProduct?.name} ({selectedVariant?.name})
            </DialogTitle>
            <DialogDescription>Manage individual license keys for this variant</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowKeys(!showKeys)} className="bg-transparent">
                {showKeys ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showKeys ? "Hide Keys" : "Show Keys"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  selectedProduct && selectedVariant && handleOpenViewKeysDialog(selectedProduct, selectedVariant)
                }
                disabled={isPending}
                className="bg-transparent"
              >
                <RefreshCcw className={`h-4 w-4 mr-1 ${isPending ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400"
              disabled={licenseKeys.filter((k) => k.status === "unused").length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete All Unused
            </Button>
          </div>

          <div className="flex-1 overflow-auto border border-border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">License Key</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Assigned At</TableHead>
                  <TableHead className="text-muted-foreground">Expires At</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && licenseKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : licenseKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No license keys found for this variant
                    </TableCell>
                  </TableRow>
                ) : (
                  licenseKeys.map((key) => (
                    <TableRow key={key.id} className="border-border">
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{showKeys ? key.license_key : "••••-••••-••••-••••"}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyKey(key.license_key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(key.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {key.assigned_at ? new Date(key.assigned_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {key.status === "unused" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleDeleteKey(key.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent className="glass-panel border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete All Unused Keys?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {licenseKeys.filter((k) => k.status === "unused").length} unused license
              keys for this variant. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
