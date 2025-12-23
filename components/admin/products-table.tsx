"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { MoreHorizontal, Pencil, Trash2, Search, Package, Eye, Plus, DollarSign } from "lucide-react"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/app/actions/admin"
import type { Product, ProductVariant } from "@/lib/database.types"

interface ProductWithVariants extends Product {
  product_variants?: ProductVariant[]
}

interface ProductsTableProps {
  initialProducts: ProductWithVariants[]
}

const statusColors: Record<Product["status"], string> = {
  undetected: "bg-green-500/20 text-green-400 border-green-500/30",
  updating: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  testing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  down: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState<ProductWithVariants[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPending, startTransition] = useTransition()

  const [isCreating, setIsCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const [editingVariants, setEditingVariants] = useState<ProductWithVariants | null>(null)
  const [variantForm, setVariantForm] = useState<{
    id?: string
    name: string
    duration_days: string
    price_cents: string
  }>({ name: "", duration_days: "", price_cents: "" })
  const [isAddingVariant, setIsAddingVariant] = useState(false)

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    game: "",
    category: "cheat",
    description: "",
    features: "",
    image_url: "",
    status: "undetected" as Product["status"],
    tags: "",
    popular: false,
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      slug: "",
      name: "",
      game: "",
      category: "cheat",
      description: "",
      features: "",
      image_url: "",
      status: "undetected",
      tags: "",
      popular: false,
    })
  }

  const handleCreateProduct = () => {
    if (!formData.name || !formData.game || !formData.slug) {
      toast.error("Please fill in all required fields")
      return
    }

    startTransition(async () => {
      const result = await createProduct({
        slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
        name: formData.name,
        game: formData.game,
        category: formData.category,
        description: formData.description,
        features: formData.features.split("\n").filter((f) => f.trim()),
        image_url: formData.image_url,
        status: formData.status,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t),
        popular: formData.popular,
      })

      if (result.success && result.product) {
        setProducts((prev) => [{ ...result.product, product_variants: [] }, ...prev])
        setIsCreating(false)
        resetForm()
        toast.success("Product created successfully! Now add pricing variants.")
      } else {
        toast.error(result.error || "Failed to create product")
      }
    })
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return

    startTransition(async () => {
      const result = await updateProduct(editingProduct.id, {
        name: formData.name,
        game: formData.game,
        category: formData.category,
        description: formData.description,
        features: formData.features.split("\n").filter((f) => f.trim()),
        image_url: formData.image_url,
        status: formData.status,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t),
        popular: formData.popular,
      })

      if (result.success && result.product) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...result.product, product_variants: p.product_variants } : p,
          ),
        )
        setEditingProduct(null)
        resetForm()
        toast.success("Product updated successfully")
      } else {
        toast.error(result.error || "Failed to update product")
      }
    })
  }

  const handleDeleteProduct = () => {
    if (!deletingProduct) return

    startTransition(async () => {
      const result = await deleteProduct(deletingProduct.id)

      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
        setDeletingProduct(null)
        toast.success("Product deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete product")
      }
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreating(true)
  }

  const openEditDialog = (product: ProductWithVariants) => {
    setFormData({
      slug: product.slug,
      name: product.name,
      game: product.game,
      category: product.category,
      description: product.description || "",
      features: product.features.join("\n"),
      image_url: product.image_url || "",
      status: product.status,
      tags: product.tags.join(", "),
      popular: product.popular,
    })
    setEditingProduct(product)
  }

  const openVariantsDialog = (product: ProductWithVariants) => {
    setEditingVariants(product)
    setVariantForm({ name: "", duration_days: "", price_cents: "" })
    setIsAddingVariant(false)
  }

  const handleAddVariant = () => {
    if (!editingVariants) return

    const priceCents = Math.round(Number.parseFloat(variantForm.price_cents) * 100)
    const durationDays = variantForm.duration_days ? Number.parseInt(variantForm.duration_days) : null

    if (isNaN(priceCents) || priceCents <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    startTransition(async () => {
      const result = await createVariant({
        product_id: editingVariants.id,
        name: variantForm.name,
        duration_days: durationDays,
        price_cents: priceCents,
        sort_order: (editingVariants.product_variants?.length || 0) + 1,
      })

      if (result.success && result.variant) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingVariants.id
              ? { ...p, product_variants: [...(p.product_variants || []), result.variant] }
              : p,
          ),
        )
        setEditingVariants((prev) =>
          prev ? { ...prev, product_variants: [...(prev.product_variants || []), result.variant] } : null,
        )
        setVariantForm({ name: "", duration_days: "", price_cents: "" })
        setIsAddingVariant(false)
        toast.success("Variant added successfully")
      } else {
        toast.error(result.error || "Failed to add variant")
      }
    })
  }

  const handleUpdateVariant = (variantId: string) => {
    if (!editingVariants) return

    const priceCents = Math.round(Number.parseFloat(variantForm.price_cents) * 100)
    const durationDays = variantForm.duration_days ? Number.parseInt(variantForm.duration_days) : null

    if (isNaN(priceCents) || priceCents <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    startTransition(async () => {
      const result = await updateVariant(variantId, {
        name: variantForm.name,
        duration_days: durationDays,
        price_cents: priceCents,
      })

      if (result.success && result.variant) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingVariants.id
              ? {
                  ...p,
                  product_variants: p.product_variants?.map((v) => (v.id === variantId ? result.variant : v)),
                }
              : p,
          ),
        )
        setEditingVariants((prev) =>
          prev
            ? {
                ...prev,
                product_variants: prev.product_variants?.map((v) => (v.id === variantId ? result.variant : v)),
              }
            : null,
        )
        setVariantForm({ name: "", duration_days: "", price_cents: "" })
        toast.success("Variant updated successfully")
      } else {
        toast.error(result.error || "Failed to update variant")
      }
    })
  }

  const handleDeleteVariant = (variantId: string) => {
    if (!editingVariants) return

    startTransition(async () => {
      const result = await deleteVariant(variantId)

      if (result.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingVariants.id
              ? { ...p, product_variants: p.product_variants?.filter((v) => v.id !== variantId) }
              : p,
          ),
        )
        setEditingVariants((prev) =>
          prev ? { ...prev, product_variants: prev.product_variants?.filter((v) => v.id !== variantId) } : null,
        )
        toast.success("Variant deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete variant")
      }
    })
  }

  const startEditVariant = (variant: ProductVariant) => {
    setVariantForm({
      id: variant.id,
      name: variant.name,
      duration_days: variant.duration_days?.toString() || "",
      price_cents: (variant.price_cents / 100).toFixed(2),
    })
    setIsAddingVariant(false)
  }

  const getVariantStock = (product: ProductWithVariants) => {
    return product.product_variants?.length || 0
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="glass-panel rounded-lg border border-border p-4 hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.game}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-panel border-primary/20">
                  <DropdownMenuItem onClick={() => openEditDialog(product)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openVariantsDialog(product)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Edit Pricing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`/products/${product.slug}`, "_blank")}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Page
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletingProduct(product)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Badge className={statusColors[product.status]}>{product.status}</Badge>
              <Badge variant="outline" className="border-border">
                {getVariantStock(product)} variants
              </Badge>
              {product.popular && <Badge className="bg-primary/20 text-primary border-primary/30">Popular</Badge>}
            </div>

            {product.product_variants && product.product_variants.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {product.product_variants.slice(0, 3).map((variant) => (
                  <span key={variant.id} className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                    {variant.name}: ${(variant.price_cents / 100).toFixed(2)}
                  </span>
                ))}
                {product.product_variants.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{product.product_variants.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No products found</p>
          <Button onClick={openCreateDialog} variant="outline" className="mt-4 bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Create your first product
          </Button>
        </div>
      )}

      <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Product
            </DialogTitle>
            <DialogDescription>
              Add a new product to your store. You can add pricing variants after creating.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Product Name *</Label>
                <Input
                  id="create-name"
                  placeholder="e.g., Fortnite Aimbot"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  className="bg-input border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-slug">URL Slug *</Label>
                <Input
                  id="create-slug"
                  placeholder="fortnite-aimbot"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-game">Game *</Label>
                <Input
                  id="create-game"
                  placeholder="e.g., Fortnite"
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-category">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20">
                    <SelectItem value="cheat">Cheat</SelectItem>
                    <SelectItem value="spoofer">Spoofer</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-input border-border"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-features">Features (one per line)</Label>
              <Textarea
                id="create-features"
                placeholder="Aimbot with smoothing&#10;ESP/Wallhack&#10;No recoil&#10;24/7 Support"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="bg-input border-border"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-image">Image URL</Label>
              <Input
                id="create-image"
                placeholder="https://example.com/image.png"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">Enter a direct link to an image for the product thumbnail</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as Product["status"] })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20">
                    <SelectItem value="undetected">Undetected</SelectItem>
                    <SelectItem value="updating">Updating</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-tags">Tags (comma separated)</Label>
                <Input
                  id="create-tags"
                  placeholder="aimbot, esp, fortnite"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-popular"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="create-popular">Mark as Popular (shows badge on product)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleCreateProduct} disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Product
            </DialogTitle>
            <DialogDescription>Update product details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">URL Slug (read-only)</Label>
                <Input id="edit-slug" value={formData.slug} disabled className="bg-input border-border opacity-50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-game">Game *</Label>
                <Input
                  id="edit-game"
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20">
                    <SelectItem value="cheat">Cheat</SelectItem>
                    <SelectItem value="spoofer">Spoofer</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-input border-border"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-features">Features (one per line)</Label>
              <Textarea
                id="edit-features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="bg-input border-border"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as Product["status"] })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20">
                    <SelectItem value="undetected">Undetected</SelectItem>
                    <SelectItem value="updating">Updating</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-popular"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="edit-popular">Mark as Popular</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pricing/Variants Dialog */}
      <Dialog open={!!editingVariants} onOpenChange={(open) => !open && setEditingVariants(null)}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Edit Pricing - {editingVariants?.name}
            </DialogTitle>
            <DialogDescription>Manage pricing variants (e.g., 1 Day, 7 Days, Lifetime).</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Existing Variants */}
            {editingVariants?.product_variants?.map((variant) => (
              <div
                key={variant.id}
                className={`p-4 rounded-lg border ${
                  variantForm.id === variant.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                {variantForm.id === variant.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={variantForm.name}
                          onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                          placeholder="e.g., 1 Day"
                          className="bg-input border-border h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Duration (days)</Label>
                        <Input
                          type="number"
                          value={variantForm.duration_days}
                          onChange={(e) => setVariantForm({ ...variantForm, duration_days: e.target.value })}
                          placeholder="Leave empty for lifetime"
                          className="bg-input border-border h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variantForm.price_cents}
                          onChange={(e) => setVariantForm({ ...variantForm, price_cents: e.target.value })}
                          placeholder="9.99"
                          className="bg-input border-border h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateVariant(variant.id)}
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setVariantForm({ name: "", duration_days: "", price_cents: "" })}
                        className="border-border"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{variant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {variant.duration_days ? `${variant.duration_days} days` : "Lifetime"} - $
                        {(variant.price_cents / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEditVariant(variant)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteVariant(variant.id)}
                        disabled={isPending}
                        className="h-8 w-8 text-red-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* No variants message */}
            {(!editingVariants?.product_variants || editingVariants.product_variants.length === 0) &&
              !isAddingVariant && (
                <div className="text-center py-6 text-muted-foreground">
                  <DollarSign className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No pricing variants yet</p>
                  <p className="text-sm">Add variants like "1 Day", "7 Days", "Lifetime"</p>
                </div>
              )}

            {/* Add New Variant Form */}
            {isAddingVariant && (
              <div className="p-4 rounded-lg border border-primary bg-primary/5 space-y-3">
                <p className="font-medium text-foreground">Add New Variant</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Name *</Label>
                    <Input
                      value={variantForm.name}
                      onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                      placeholder="e.g., 1 Day"
                      className="bg-input border-border h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Duration (days)</Label>
                    <Input
                      type="number"
                      value={variantForm.duration_days}
                      onChange={(e) => setVariantForm({ ...variantForm, duration_days: e.target.value })}
                      placeholder="Empty = Lifetime"
                      className="bg-input border-border h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price ($) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variantForm.price_cents}
                      onChange={(e) => setVariantForm({ ...variantForm, price_cents: e.target.value })}
                      placeholder="9.99"
                      className="bg-input border-border h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddVariant}
                    disabled={isPending || !variantForm.name || !variantForm.price_cents}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isPending ? "Adding..." : "Add Variant"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingVariant(false)
                      setVariantForm({ name: "", duration_days: "", price_cents: "" })
                    }}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Add Variant Button */}
            {!isAddingVariant && (
              <Button
                variant="outline"
                className="w-full border-dashed border-border bg-transparent"
                onClick={() => {
                  setVariantForm({ name: "", duration_days: "", price_cents: "" })
                  setIsAddingVariant(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Variant
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVariants(null)} className="border-border">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone and
              will also delete all variants and license keys associated with this product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)} className="border-border">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProduct}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
