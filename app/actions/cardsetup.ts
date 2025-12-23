"use server"

import { createClient } from "@/lib/supabase/server"
import { getProductBySlug, getVariantById } from "@/lib/db/products"
import { revalidatePath } from "next/cache"
import { createLicenseKeyForOrder } from "@/lib/db/license-keys"
import { sendPurchaseConfirmationEmail } from "@/lib/email"
import { sendDiscordOrderNotification } from "@/lib/discord"

const CARDSETUP_API_URL = "https://dashboard.card-setup.com/api"

function generateOrderNumber() {
  const prefix = "JC"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function createCardSetupInvoice(data: {
  productSlug: string
  variantId: string
  customerEmail: string
  couponCode?: string
}) {
  const supabase = await createClient()

  // Get product and variant
  const product = await getProductBySlug(data.productSlug)
  if (!product) {
    throw new Error("Product not found")
  }

  const variant = await getVariantById(data.variantId)
  if (!variant) {
    throw new Error("Variant not found")
  }

  // Calculate price (handle coupons if needed)
  let finalAmount = variant.price_cents
  let discountAmount = 0
  let couponId: string | null = null

  if (data.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", data.couponCode.toUpperCase())
      .eq("active", true)
      .single()

    if (coupon) {
      const now = new Date()
      const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

      const isTimeValid = (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil)
      const isUsageValid = !coupon.max_uses || coupon.current_uses < coupon.max_uses
      const meetsMinimum = !coupon.min_order_cents || finalAmount >= coupon.min_order_cents

      if (isTimeValid && isUsageValid && meetsMinimum) {
        if (coupon.discount_type === "percentage") {
          discountAmount = Math.round(finalAmount * (coupon.discount_value / 100))
        } else {
          discountAmount = Math.min(coupon.discount_value, finalAmount)
        }
        finalAmount -= discountAmount
        couponId = coupon.id
      }
    }
  }

  // Generate order number
  const orderNumber = generateOrderNumber()

  // Create order in database with pending status
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_email: data.customerEmail,
      product_id: product.id,
      variant_id: variant.id,
      amount_cents: finalAmount,
      currency: "usd",
      status: "pending",
      payment_method: "cardsetup",
      metadata: {
        coupon_id: couponId,
        coupon_code: data.couponCode || null,
        discount_amount: discountAmount,
        original_amount: variant.price_cents,
      },
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error("[v0] Error creating order:", orderError)
    throw new Error("Failed to create order")
  }

  const storeUrl = (process.env.CARDSETUP_STORE_URL || "https://valor.com").replace(/\/$/, "") + "/"
  const callbackUrl = `${storeUrl}checkout/cardsetup-callback/?order_id=${order.id}`

  const invoiceData = {
    store: storeUrl,
    invoice_id: orderNumber,
    amount: (finalAmount / 100).toFixed(2),
    currency: "USD",
    purchases: [{ name: `${product.name} - ${variant.name}` }],
    email: data.customerEmail,
    callbackURL: callbackUrl,
    orderinfo: `Order ${orderNumber} for ${product.name}`,
  }

  console.log("[v0] Creating Card Setup invoice:", JSON.stringify(invoiceData, null, 2))

  try {
    const response = await fetch(`${CARDSETUP_API_URL}/create-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    })

    const result = await response.json()

    console.log("[v0] Card Setup API response:", JSON.stringify(result, null, 2))

    if (!result.success) {
      console.error("[v0] Card Setup error:", result.errors)
      await supabase.from("orders").delete().eq("id", order.id)
      throw new Error(result.errors?.join(", ") || "Failed to create invoice")
    }

    let redirectUrl = null

    if (result.data?.Transaction) {
      redirectUrl = result.data.Transaction.PaymentPage || result.data.Transaction.PaymentPortal
    }

    if (!redirectUrl && result.data) {
      redirectUrl =
        result.data.PaymentPage ||
        result.data.PaymentPortal ||
        result.data.payment_url ||
        result.data.redirect_url ||
        result.data.url
    }

    if (!redirectUrl) {
      redirectUrl = result.PaymentPage || result.PaymentPortal || result.payment_url
    }

    console.log("[v0] Extracted redirect URL:", redirectUrl)

    if (!redirectUrl) {
      console.error("[v0] No payment URL found in response. Full response:", result)
      await supabase.from("orders").delete().eq("id", order.id)
      throw new Error("Payment gateway did not return a checkout URL. Please contact support.")
    }

    // Update order with Card Setup data
    await supabase
      .from("orders")
      .update({
        metadata: {
          ...order.metadata,
          cardsetup_invoice_id: result.invoice_id,
          cardsetup_data: result.data,
        },
      })
      .eq("id", order.id)

    return {
      success: true,
      orderId: order.id,
      orderNumber,
      redirectUrl,
      invoiceId: result.invoice_id,
    }
  } catch (error) {
    console.error("[v0] Card Setup API error:", error)
    await supabase.from("orders").delete().eq("id", order.id)
    throw error instanceof Error ? error : new Error("Failed to connect to payment gateway")
  }
}

export async function createCardSetupPayment(data: {
  productSlug: string
  variantId: string
  customerEmail: string
  couponCode?: string
}) {
  return createCardSetupInvoice(data)
}

export async function verifyCardSetupOrder(orderId: string): Promise<{
  success: boolean
  alreadyCompleted?: boolean
  pending?: boolean
  licenseKey?: string
  orderNumber?: string
  error?: string
}> {
  const supabase = await createClient()

  // Get the order with license key info
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, products(*), product_variants(*), license_keys(*)")
    .eq("id", orderId)
    .single()

  if (orderError || !order) {
    console.error("[v0] Order not found:", orderId)
    return { success: false, error: "Order not found" }
  }

  // If order is already completed, return success with license key
  if (order.status === "completed") {
    return {
      success: true,
      alreadyCompleted: true,
      licenseKey: order.license_keys?.license_key,
      orderNumber: order.order_number,
    }
  }

  // If order is still pending, check if we can verify it with Card Setup
  if (order.status === "pending") {
    // Try to check with Card Setup if there's invoice data
    const invoiceId = order.metadata?.cardsetup_invoice_id || order.order_number

    try {
      // Attempt to finalize with the order number as a fallback
      const response = await fetch(`${CARDSETUP_API_URL}/finalize-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice_id: invoiceId }),
      })

      const result = await response.json()
      console.log("[v0] Card Setup verify response:", JSON.stringify(result, null, 2))

      if (result.success && result.validation?.valid) {
        // Payment was successful - complete the order
        const licenseKey = await createLicenseKeyForOrder(
          orderId,
          order.variant_id,
          order.product_variants?.duration_days || null,
        )

        await supabase
          .from("orders")
          .update({
            status: "completed",
            paid_at: new Date().toISOString(),
            license_key_id: licenseKey.id,
            metadata: {
              ...order.metadata,
              cardsetup_approval_code: result.validation?.approval_code,
            },
          })
          .eq("id", orderId)

        // Send notifications
        try {
          await sendPurchaseConfirmationEmail({
            customerEmail: order.customer_email,
            orderNumber: order.order_number,
            productName: order.products?.name || "Product",
            variantName: order.product_variants?.name || "License",
            licenseKey: licenseKey.license_key,
            expiresAt: licenseKey.expires_at,
            amount: order.amount_cents,
          })
        } catch (e) {
          console.error("[v0] Email error:", e)
        }

        try {
          await sendDiscordOrderNotification({
            orderNumber: order.order_number,
            customerEmail: order.customer_email,
            productName: order.products?.name || "Product",
            variantName: order.product_variants?.name || "License",
            amount: order.amount_cents,
            paymentMethod: "Card Setup",
          })
        } catch (e) {
          console.error("[v0] Discord error:", e)
        }

        revalidatePath("/admin")
        revalidatePath("/admin/orders")

        return {
          success: true,
          licenseKey: licenseKey.license_key,
          orderNumber: order.order_number,
        }
      }
    } catch (e) {
      console.error("[v0] Card Setup verify error:", e)
    }

    // Payment still pending
    return {
      success: true,
      pending: true,
      orderNumber: order.order_number,
    }
  }

  // Order failed
  return {
    success: false,
    error: "Payment was not completed",
  }
}

export async function finalizeCardSetupPayment(transactionId: string, orderId: string) {
  const supabase = await createClient()

  // Get the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, products(*), product_variants(*)")
    .eq("id", orderId)
    .single()

  if (orderError || !order) {
    throw new Error("Order not found")
  }

  if (order.status === "completed") {
    // Get existing license key
    const { data: licenseKey } = await supabase
      .from("license_keys")
      .select("license_key")
      .eq("id", order.license_key_id)
      .single()

    return {
      success: true,
      alreadyCompleted: true,
      licenseKey: licenseKey?.license_key,
      orderNumber: order.order_number,
    }
  }

  // Finalize with Card Setup
  try {
    const response = await fetch(`${CARDSETUP_API_URL}/finalize-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionid: transactionId }),
    })

    const result = await response.json()

    console.log("[v0] Finalize response:", JSON.stringify(result, null, 2))

    if (!result.success || !result.validation?.valid) {
      console.error("[v0] Card Setup finalize error:", result)
      await supabase.from("orders").update({ status: "failed" }).eq("id", orderId)
      throw new Error(result.validation?.status || "Payment validation failed")
    }

    // Payment successful - generate license key
    const licenseKey = await createLicenseKeyForOrder(
      orderId,
      order.variant_id,
      order.product_variants?.duration_days || null,
    )

    // Update order to completed
    await supabase
      .from("orders")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
        license_key_id: licenseKey.id,
        metadata: {
          ...order.metadata,
          cardsetup_transaction_id: transactionId,
          cardsetup_approval_code: result.validation?.approval_code,
        },
      })
      .eq("id", orderId)

    // Increment coupon usage if applicable
    if (order.metadata?.coupon_id) {
      await supabase.rpc("increment_coupon_usage", { coupon_id: order.metadata.coupon_id })
    }

    // Send email notification
    try {
      await sendPurchaseConfirmationEmail({
        customerEmail: order.customer_email,
        orderNumber: order.order_number,
        productName: order.products?.name || "Product",
        variantName: order.product_variants?.name || "License",
        licenseKey: licenseKey.license_key,
        expiresAt: licenseKey.expires_at,
        amount: order.amount_cents,
      })
    } catch (emailError) {
      console.error("[v0] Email error:", emailError)
    }

    // Send Discord notification
    try {
      await sendDiscordOrderNotification({
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        productName: order.products?.name || "Product",
        variantName: order.product_variants?.name || "License",
        amount: order.amount_cents,
        paymentMethod: "Card Setup",
      })
    } catch (discordError) {
      console.error("[v0] Discord error:", discordError)
    }

    revalidatePath("/admin")
    revalidatePath("/admin/orders")

    return {
      success: true,
      licenseKey: licenseKey.license_key,
      orderNumber: order.order_number,
    }
  } catch (error) {
    console.error("[v0] Finalize payment error:", error)
    throw error
  }
}

