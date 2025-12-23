"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Trash2, Loader2, Tag, Percent, DollarSign } from "lucide-react"
import { createCoupon, updateCoupon, deleteCoupon } from "@/app/actions/admin"
import { toast } from "sonner"
import type { Coupon } from "@/lib/database.types"

interface CouponsManagerProps {
  initialCoupons: Coupon[]
}

export function CouponsManager({ initialCoupons }: CouponsManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as Coupon["discount_type"],
    discount_value: "",
    max_uses: "",
    min_order_cents: "",
    valid_until: "",
  })

  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      max_uses: "",
      min_order_cents: "",
      valid_until: "",
    })
  }

  const handleCreateCoupon = () => {
    startTransition(async () => {
      const result = await createCoupon({
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: Number.parseInt(formData.discount_value),
        max_uses: formData.max_uses ? Number.parseInt(formData.max_uses) : undefined,
        min_order_cents: formData.min_order_cents ? Number.parseInt(formData.min_order_cents) * 100 : undefined,
        valid_until: formData.valid_until || undefined,
      })

      if (result.success && result.coupon) {
        setCoupons((prev) => [result.coupon, ...prev])
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("Coupon created successfully")
      } else {
        toast.error(result.error || "Failed to create coupon")
      }
    })
  }

  const handleToggleActive = (couponId: string, active: boolean) => {
    startTransition(async () => {
      const result = await updateCoupon(couponId, { active })
      if (result.success) {
        setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, active } : c)))
        toast.success(active ? "Coupon activated" : "Coupon deactivated")
      } else {
        toast.error(result.error || "Failed to update coupon")
      }
    })
  }

  const handleDeleteCoupon = () => {
    if (!deletingCoupon) return

    startTransition(async () => {
      const result = await deleteCoupon(deletingCoupon.id)
      if (result.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== deletingCoupon.id))
        setDeletingCoupon(null)
        toast.success("Coupon deleted")
      } else {
        toast.error(result.error || "Failed to delete coupon")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Coupon</DialogTitle>
            <DialogDescription>Create a new discount code for customers.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Coupon Code *</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  className="bg-input border-border pl-10 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v) => setFormData({ ...formData, discount_type: v as Coupon["discount_type"] })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20">
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">
                  {formData.discount_type === "percentage" ? "Discount %" : "Discount (cents)"}
                </Label>
                <div className="relative">
                  {formData.discount_type === "percentage" ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    id="value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === "percentage" ? "20" : "500"}
                    className="bg-input border-border pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max_uses">Max Uses (optional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="100"
                  className="bg-input border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min_order">Min Order $ (optional)</Label>
                <Input
                  id="min_order"
                  type="number"
                  value={formData.min_order_cents}
                  onChange={(e) => setFormData({ ...formData, min_order_cents: e.target.value })}
                  placeholder="10"
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valid_until">Expiration Date (optional)</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                resetForm()
              }}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCoupon}
              disabled={isPending || !formData.code || !formData.discount_value}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupons Table */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Code</TableHead>
                <TableHead className="text-muted-foreground">Discount</TableHead>
                <TableHead className="text-muted-foreground">Usage</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Active</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No coupons yet. Create your first coupon!
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date()
                  const isMaxedOut = coupon.max_uses && coupon.current_uses >= coupon.max_uses

                  return (
                    <TableRow key={coupon.id} className="border-border">
                      <TableCell className="font-mono font-bold text-foreground">{coupon.code}</TableCell>
                      <TableCell className="text-foreground">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `$${(coupon.discount_value / 100).toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.current_uses}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                      </TableCell>
                      <TableCell>
                        {isExpired ? (
                          <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                            Expired
                          </Badge>
                        ) : isMaxedOut ? (
                          <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                            Maxed Out
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                            Valid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.active}
                          onCheckedChange={(checked) => handleToggleActive(coupon.id, checked)}
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-400"
                          onClick={() => setDeletingCoupon(coupon)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCoupon} onOpenChange={(open) => !open && setDeletingCoupon(null)}>
        <AlertDialogContent className="glass-panel border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon &quot;{deletingCoupon?.code}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
