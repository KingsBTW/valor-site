import { NextResponse } from "next/server"
import { getOrderByPaymentIntent, updateOrderStatus } from "@/lib/db/orders"
import { createLicenseKeyForOrder } from "@/lib/db/license-keys"
import { getVariantById, getProductById } from "@/lib/db/products"
import { sendDiscordOrderNotification } from "@/lib/discord"
import { sendPurchaseConfirmationEmail } from "@/lib/email"
import { fetchExternalLicenseKey, hasExternalAPI } from "@/lib/external-key-api"

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing payment intent ID" }, { status: 400 })
    }

    const order = await getOrderByPaymentIntent(paymentIntentId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === "paid" || order.status === "completed") {
      return NextResponse.json({ message: "Order already completed", order }, { status: 200 })
    }

    const product = await getProductById(order.product_id)
    const variant = await getVariantById(order.variant_id)

    const durationDays = variant?.duration_days || null
    let licenseKeyValue = ""

    // Check if product has external API configured
    if (product?.slug && hasExternalAPI(product.slug)) {
      console.log(`[Order] Fetching external key for ${product.slug}`)
      
      const externalKeyResult = await fetchExternalLicenseKey(product.slug, {
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        variantName: variant?.name || "Unknown",
        productName: product.name,
      })

      if (externalKeyResult.success && externalKeyResult.key) {
        licenseKeyValue = externalKeyResult.key
        console.log(`[Order] Successfully fetched external key`)
      } else {
        console.error(`[Order] Failed to fetch external key: ${externalKeyResult.error}`)
        // Fallback to local key generation
        console.log(`[Order] Falling back to local key generation`)
      }
    }

    // Create license key record (with external key if available, otherwise generate local)
    const licenseKey = await createLicenseKeyForOrder(
      order.variant_id, 
      order.id, 
      durationDays,
      licenseKeyValue || undefined
    )

    if (!licenseKey) {
      return NextResponse.json({ error: "Failed to create license key" }, { status: 500 })
    }

    await updateOrderStatus(order.id, "paid", {
      license_key_id: licenseKey.id,
      payment_method: "card",
    })

    await sendPurchaseConfirmationEmail({
      customerEmail: order.customer_email,
      orderNumber: order.order_number,
      productName: product?.name || "Unknown Product",
      variantName: variant?.name || "Unknown Variant",
      licenseKey: licenseKey.license_key,
      expiresAt: licenseKey.expires_at,
      amount: order.amount_cents,
    })

    await sendDiscordOrderNotification({
      orderNumber: order.order_number,
      productName: product?.name || "Unknown Product",
      variantName: variant?.name || "Unknown Variant",
      customerEmail: order.customer_email,
      amount: order.amount_cents,
      paymentMethod: "card",
      remainingStock: 999,
      stripePaymentId: paymentIntentId,
    })

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      licenseKey: licenseKey.license_key,
    })
  } catch (error) {
    console.error("Error completing order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
