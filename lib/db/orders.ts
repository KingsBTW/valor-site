import { createClient } from "@/lib/supabase/server"
import type { Order, OrderWithDetails } from "@/lib/database.types"

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `JC-${timestamp}-${random}`
}

export async function createOrder(data: {
  customer_email: string
  product_id: string
  variant_id: string
  amount_cents: number
  stripe_payment_intent_id?: string
  stripe_checkout_session_id?: string
  metadata?: Record<string, unknown>
}): Promise<Order | null> {
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_email: data.customer_email,
      product_id: data.product_id,
      variant_id: data.variant_id,
      amount_cents: data.amount_cents,
      stripe_payment_intent_id: data.stripe_payment_intent_id,
      stripe_checkout_session_id: data.stripe_checkout_session_id,
      metadata: data.metadata || {},
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating order:", error)
    return null
  }

  return order
}

export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getOrderByCheckoutSession(sessionId: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("orders").select("*").eq("stripe_checkout_session_id", sessionId).single()

  if (error) {
    return null
  }

  return data
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "completed" | "failed" | "refunded",
  additionalData?: Partial<Order>,
): Promise<Order | null> {
  const supabase = await createClient()

  const updateData: Partial<Order> = {
    status,
    ...additionalData,
  }

  if (status === "paid" || status === "completed") {
    updateData.paid_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from("orders").update(updateData).eq("id", orderId).select().single()

  if (error) {
    console.error("Error updating order:", error)
    return null
  }

  return data
}

export async function getOrderWithDetails(orderId: string): Promise<OrderWithDetails | null> {
  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (orderError || !order) {
    return null
  }

  const { data: product } = await supabase.from("products").select("*").eq("id", order.product_id).single()

  const { data: variant } = await supabase.from("product_variants").select("*").eq("id", order.variant_id).single()

  const { data: license_key } = order.license_key_id
    ? await supabase.from("license_keys").select("*").eq("id", order.license_key_id).single()
    : { data: null }

  return {
    ...order,
    product: product || undefined,
    variant: variant || undefined,
    license_key: license_key || undefined,
  }
}

export async function getAllOrders(limit = 100): Promise<OrderWithDetails[]> {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, products(*), product_variants(*), license_keys(*)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return (orders || []).map((order: { products: unknown; product_variants: unknown; license_keys: unknown }) => ({
    ...order,
    product: order.products as OrderWithDetails["product"],
    variant: order.product_variants as OrderWithDetails["variant"],
    license_key: order.license_keys as OrderWithDetails["license_key"],
  }))
}

export async function getOrdersByEmail(email: string): Promise<OrderWithDetails[]> {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, products(*), product_variants(*), license_keys(*)")
    .eq("customer_email", email)
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return (orders || []).map((order: { products: unknown; product_variants: unknown; license_keys: unknown }) => ({
    ...order,
    product: order.products as OrderWithDetails["product"],
    variant: order.product_variants as OrderWithDetails["variant"],
    license_key: order.license_keys as OrderWithDetails["license_key"],
  }))
}

export async function getCompletedOrders(limit = 100): Promise<OrderWithDetails[]> {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, products(*), product_variants(*)")
    .in("status", ["completed", "paid"])
    .order("paid_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching completed orders:", error)
    return []
  }

  return (orders || []).map((order: { products: unknown; product_variants: unknown }) => ({
    ...order,
    product: order.products as OrderWithDetails["product"],
    variant: order.product_variants as OrderWithDetails["variant"],
  }))
}
