"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Eye,
  RefreshCcw,
  Mail,
  Loader2,
  Copy,
  Key,
  Package,
  Calendar,
  DollarSign,
  User,
  AlertTriangle,
  CheckCircle,
  Play,
} from "lucide-react"
import { updateOrderStatus, processOrderManually, processAllPendingOrders } from "@/app/actions/admin"
import { toast } from "sonner"
import type { OrderWithDetails } from "@/lib/database.types"

interface OrdersTableProps {
  initialOrders: OrderWithDetails[]
}

const statusColors: Record<string, string> = {
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  refunded: "bg-red-500/20 text-red-400 border-red-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)
  const [isProcessingAll, setIsProcessingAll] = useState(false)

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const hasPendingOrders = pendingOrders.length > 0

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const handleRefund = (orderId: string) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, "refunded")
      if (result.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "refunded" } : o)))
        toast.success("Order marked as refunded")
      } else {
        toast.error(result.error || "Failed to process refund")
      }
    })
  }

  const handleProcessOrder = async (orderId: string) => {
    setProcessingOrderId(orderId)
    try {
      const result = await processOrderManually(orderId)
      if (result.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o)))
        toast.success(`Order completed! License key: ${result.licenseKey}`)
      } else {
        toast.error(result.error || "Failed to process order")
      }
    } catch (error) {
      toast.error("Failed to process order")
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleProcessAllPending = async () => {
    setIsProcessingAll(true)
    try {
      const result = await processAllPendingOrders()
      if (result.success) {
        toast.success(`Processed ${result.processed} orders. ${result.failed} failed.`)
        // Refresh the page to get updated data
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to process orders")
      }
    } catch (error) {
      toast.error("Failed to process orders")
    } finally {
      setIsProcessingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      {hasPendingOrders && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-500">
                    {pendingOrders.length} Pending Order{pendingOrders.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    These orders may have completed payments but weren't processed.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleProcessAllPending}
                disabled={isProcessingAll}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {isProcessingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Process All Pending
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-input border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-primary/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== "all" ? "No orders match your filters" : "No orders yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-border">
                    <TableCell className="font-mono text-sm text-foreground">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>
                        <p>{order.product?.name || "Unknown"}</p>
                        <p className="text-xs">{order.variant?.name || ""}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      ${(order.amount_cents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-panel border-primary/20">
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(order.customer_email, "Email")}>
                            <Mail className="h-4 w-4 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                          {order.status === "pending" && (
                            <DropdownMenuItem
                              className="text-yellow-400"
                              onClick={() => handleProcessOrder(order.id)}
                              disabled={processingOrderId === order.id}
                            >
                              {processingOrderId === order.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Process Order
                            </DropdownMenuItem>
                          )}
                          {(order.status === "paid" || order.status === "completed") && (
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() => handleRefund(order.id)}
                              disabled={isPending}
                            >
                              {isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCcw className="h-4 w-4 mr-2" />
                              )}
                              Process Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Order Details
            </DialogTitle>
            <DialogDescription>Order {selectedOrder?.order_number}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusColors[selectedOrder.status]}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <User className="h-4 w-4 text-primary" />
                  Customer
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Email</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm">{selectedOrder.customer_email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(selectedOrder.customer_email, "Email")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Package className="h-4 w-4 text-primary" />
                  Product
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Name</span>
                  <span className="text-foreground text-sm">{selectedOrder.product?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Variant</span>
                  <span className="text-foreground text-sm">{selectedOrder.variant?.name || "Unknown"}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Payment
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Amount</span>
                  <span className="text-green-400 font-medium">${(selectedOrder.amount_cents / 100).toFixed(2)}</span>
                </div>
                {selectedOrder.stripe_payment_intent_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Stripe ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-xs font-mono truncate max-w-[150px]">
                        {selectedOrder.stripe_payment_intent_id}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(selectedOrder.stripe_payment_intent_id || "", "Payment ID")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* License Key Info */}
              {selectedOrder.license_key && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Key className="h-4 w-4 text-primary" />
                    License Key
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-primary text-sm">{selectedOrder.license_key.license_key}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(selectedOrder.license_key?.license_key || "", "License Key")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {selectedOrder.license_key.expires_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Expires</span>
                      <span className="text-yellow-400 text-sm">
                        {new Date(selectedOrder.license_key.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Timeline
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Created</span>
                  <span className="text-foreground text-sm">{formatFullDate(selectedOrder.created_at)}</span>
                </div>
                {selectedOrder.paid_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Paid</span>
                    <span className="text-green-400 text-sm">{formatFullDate(selectedOrder.paid_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
