"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { sendPurchaseConfirmationEmail } from "@/lib/email"
import { sendDiscordOrderNotification } from "@/lib/discord"
import { createLicenseKeyForOrder } from "@/lib/db/license-keys"
import type { Product, ProductVariant, Coupon } from "@/lib/database.types"

// Product CRUD operations
export async function createProduct(data: {
  slug: string
  name: string
  game: string
  category: string
  description: string
  features: string[]
  image_url: string
  status: Product["status"]
  tags: string[]
  popular: boolean
}) {
  const supabase = await createClient()

  const { data: product, error } = await supabase.from("products").insert(data).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, product }
}

export async function updateProduct(
  productId: string,
  data: Partial<{
    name: string
    game: string
    category: string
    description: string
    features: string[]
    image_url: string
    status: Product["status"]
    tags: string[]
    popular: boolean
  }>,
) {
  const supabase = await createClient()

  const { data: product, error } = await supabase.from("products").update(data).eq("id", productId).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/status")
  return { success: true, product }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("products").delete().eq("id", productId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true }
}

export async function updateProductStatus(productId: string, status: Product["status"]) {
  return updateProduct(productId, { status })
}

// Variant CRUD operations
export async function createVariant(data: {
  product_id: string
  name: string
  duration_days: number | null
  price_cents: number
  sort_order: number
}) {
  const supabase = await createClient()

  const { data: variant, error } = await supabase.from("product_variants").insert(data).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true, variant }
}

export async function updateVariant(variantId: string, data: Partial<ProductVariant>) {
  const supabase = await createClient()

  const { data: variant, error } = await supabase
    .from("product_variants")
    .update(data)
    .eq("id", variantId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true, variant }
}

export async function deleteVariant(variantId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("product_variants").delete().eq("id", variantId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true }
}

// License Key operations
export async function addLicenseKeys(variantId: string, keys: string[]) {
  const supabase = await createClient()

  const keysToInsert = keys
    .map((key) => key.trim())
    .filter((key) => key.length > 0)
    .map((key) => ({
      variant_id: variantId,
      license_key: key,
      status: "unused" as const,
    }))

  const { data, error } = await supabase.from("license_keys").insert(keysToInsert).select()

  if (error) {
    return { success: false, error: error.message, count: 0 }
  }

  revalidatePath("/admin/products")
  return { success: true, count: data?.length || 0 }
}

export async function revokeLicenseKey(licenseKeyId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("license_keys").update({ status: "revoked" }).eq("id", licenseKeyId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true }
}

export async function deleteLicenseKey(licenseKeyId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("license_keys").delete().eq("id", licenseKeyId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true }
}

// Order operations
export async function updateOrderStatus(orderId: string, status: "pending" | "paid" | "failed" | "refunded") {
  const supabase = await createClient()

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/orders")
  return { success: true }
}

// Coupon CRUD operations
export async function createCoupon(data: {
  code: string
  discount_type: Coupon["discount_type"]
  discount_value: number
  max_uses?: number
  min_order_cents?: number
  valid_until?: string
}) {
  const supabase = await createClient()

  const { data: coupon, error } = await supabase
    .from("coupons")
    .insert({
      ...data,
      code: data.code.toUpperCase(),
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/coupons")
  return { success: true, coupon }
}

export async function updateCoupon(couponId: string, data: Partial<Coupon>) {
  const supabase = await createClient()

  const { error } = await supabase.from("coupons").update(data).eq("id", couponId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/coupons")
  return { success: true }
}

export async function deleteCoupon(couponId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("coupons").delete().eq("id", couponId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/coupons")
  return { success: true }
}

// Bulk status update
export async function bulkUpdateProductStatus(productIds: string[], status: Product["status"]) {
  const supabase = await createClient()

  const { error } = await supabase.from("products").update({ status }).in("id", productIds)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/admin/status")
  revalidatePath("/products")
  revalidatePath("/status")
  return { success: true }
}

// Get admin stats
export async function getAdminStats(dateRange?: { start: string; end: string }) {
  const supabase = await createClient()

  // Get all orders first
  let ordersQuery = supabase.from("orders").select("id, status, amount_cents, created_at, paid_at")

  if (dateRange) {
    const startDate = new Date(dateRange.start).toISOString()
    const endDate = new Date(dateRange.end)
    endDate.setHours(23, 59, 59, 999)
    const endDateStr = endDate.toISOString()
    ordersQuery = ordersQuery.gte("created_at", startDate).lte("created_at", endDateStr)
  }

  const [productsResult, ordersResult] = await Promise.all([supabase.from("products").select("status"), ordersQuery])

  const products = productsResult.data || []
  const orders = ordersResult.data || []

  // Calculate revenue ONLY from completed or paid orders
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "paid")
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount_cents || 0), 0)

  // Count orders by status
  const completedOrderCount = completedOrders.length
  const pendingOrderCount = orders.filter((o) => o.status === "pending").length
  const failedOrderCount = orders.filter((o) => o.status === "failed" || o.status === "refunded").length

  const statusCounts = {
    undetected: products.filter((p) => p.status === "undetected").length,
    updating: products.filter((p) => p.status === "updating").length,
    testing: products.filter((p) => p.status === "testing").length,
    down: products.filter((p) => p.status === "down").length,
  }

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders: completedOrderCount,
    pendingOrders: pendingOrderCount,
    failedOrders: failedOrderCount,
    totalProducts: products.length,
    statusCounts,
  }
}

// Get orders by date range
export async function getOrdersByDateRange(dateRange?: { start: string; end: string }, status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("orders")
    .select("*, products(*), product_variants(*)")
    .order("created_at", { ascending: false })

  if (dateRange) {
    const startDate = new Date(dateRange.start).toISOString()
    const endDate = new Date(dateRange.end)
    endDate.setHours(23, 59, 59, 999)
    query = query.gte("created_at", startDate).lte("created_at", endDate.toISOString())
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { data: orders, error } = await query.limit(100)

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return (orders || []).map((order: { products: unknown; product_variants: unknown }) => ({
    ...order,
    product: order.products,
    variant: order.product_variants,
  }))
}

// Manually process a pending order
export async function processOrderManually(orderId: string) {
  console.log("[v0] Processing order manually:", orderId)
  const supabase = await createClient()

  // Get the order with product and variant info
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, products(*), product_variants(*)")
    .eq("id", orderId)
    .single()

  if (orderError || !order) {
    console.error("[v0] Order not found:", orderError)
    return { success: false, error: "Order not found" }
  }

  console.log("[v0] Order found:", order.order_number, "Status:", order.status)

  // Check if already completed
  if (order.status === "completed" || order.status === "paid") {
    return { success: false, error: "Order already completed" }
  }

  // Verify payment with Stripe if we have a payment intent
  if (order.stripe_payment_intent_id) {
    try {
      console.log("[v0] Verifying with Stripe:", order.stripe_payment_intent_id)
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)
      console.log("[v0] Stripe payment status:", paymentIntent.status)

      if (paymentIntent.status !== "succeeded") {
        return { success: false, error: `Payment not successful. Status: ${paymentIntent.status}` }
      }
    } catch (e) {
      console.error("[v0] Stripe verification error:", e)
      return { success: false, error: "Could not verify payment with Stripe" }
    }
  } else {
    console.log("[v0] No stripe_payment_intent_id - processing anyway")
  }

  const variant = order.product_variants as ProductVariant
  const product = order.products as Product
  const durationDays = variant?.duration_days || null

  console.log("[v0] Generating license key for variant:", order.variant_id)
  const licenseKey = await createLicenseKeyForOrder(order.variant_id, orderId, durationDays)

  if (!licenseKey) {
    console.error("[v0] Failed to generate license key")
    return { success: false, error: "Failed to generate license key" }
  }

  console.log("[v0] Generated license key:", licenseKey.license_key)

  // Update order to completed
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      license_key_id: licenseKey.id,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (updateError) {
    console.error("[v0] Failed to update order:", updateError)
    return { success: false, error: "Failed to update order status" }
  }

  console.log("[v0] Order completed successfully")

  // Send email (non-blocking)
  try {
    await sendPurchaseConfirmationEmail({
      customerEmail: order.customer_email,
      orderNumber: order.order_number,
      productName: product?.name || "Unknown Product",
      variantName: variant?.name || "Unknown Variant",
      licenseKey: licenseKey.license_key,
      expiresAt: licenseKey.expires_at,
      amount: order.amount_cents,
    })
  } catch (e) {
    console.error("[v0] Email send error (non-blocking):", e)
  }

  // Send Discord notification (non-blocking)
  try {
    await sendDiscordOrderNotification({
      orderNumber: order.order_number,
      productName: product?.name || "Unknown Product",
      variantName: variant?.name || "Unknown Variant",
      customerEmail: order.customer_email,
      amount: order.amount_cents,
      paymentMethod: "card",
      remainingStock: 999, // Infinite stock
      stripePaymentId: order.stripe_payment_intent_id || "manual",
    })
  } catch (e) {
    console.error("[v0] Discord notification error (non-blocking):", e)
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  return { success: true, licenseKey: licenseKey.license_key }
}

// Bulk process all pending orders
export async function processAllPendingOrders() {
  console.log("[v0] Processing all pending orders...")
  const supabase = await createClient()

  const { data: pendingOrders, error } = await supabase
    .from("orders")
    .select("id, order_number, stripe_payment_intent_id")
    .eq("status", "pending")

  if (error || !pendingOrders) {
    console.error("[v0] Failed to fetch pending orders:", error)
    return { success: false, error: "Failed to fetch pending orders", processed: 0, failed: 0, errors: [] }
  }

  console.log("[v0] Found", pendingOrders.length, "pending orders")

  let processed = 0
  let failed = 0
  const errors: string[] = []

  for (const order of pendingOrders) {
    console.log("[v0] Processing order:", order.order_number)

    // If no Stripe payment intent, skip
    if (!order.stripe_payment_intent_id) {
      console.log("[v0] No payment intent, skipping:", order.order_number)
      failed++
      errors.push(`Order ${order.order_number}: No payment intent ID`)
      continue
    }

    try {
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)
      console.log("[v0] Payment status for", order.order_number, ":", paymentIntent.status)

      if (paymentIntent.status === "succeeded") {
        const result = await processOrderManually(order.id)
        if (result.success) {
          console.log("[v0] Successfully processed:", order.order_number)
          processed++
        } else {
          console.log("[v0] Failed to process:", order.order_number, result.error)
          failed++
          errors.push(`Order ${order.order_number}: ${result.error}`)
        }
      } else {
        console.log("[v0] Payment not succeeded:", order.order_number, paymentIntent.status)
        failed++
        errors.push(`Order ${order.order_number}: Payment status is ${paymentIntent.status}`)
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      console.error("[v0] Error processing order:", order.order_number, e)
      failed++
      errors.push(`Order ${order.order_number}: ${errorMessage}`)
    }
  }

  console.log("[v0] Finished processing. Processed:", processed, "Failed:", failed)

  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  return { success: true, processed, failed, errors }
}
