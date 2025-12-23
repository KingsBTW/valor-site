import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { getOrderByCheckoutSession, getOrderByPaymentIntent, updateOrderStatus } from "@/lib/db/orders"
import { createLicenseKeyForOrder } from "@/lib/db/license-keys"
import { getVariantById, getProductById } from "@/lib/db/products"
import { incrementCouponUsage } from "@/lib/db/coupons"
import { sendDiscordOrderNotification, sendDiscordErrorNotification } from "@/lib/discord"
import { sendPurchaseConfirmationEmail } from "@/lib/email"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  console.log("[v0] Stripe webhook received")

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    console.error("[v0] Missing stripe-signature header")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  if (!webhookSecret) {
    console.error("[v0] STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log("[v0] Webhook event verified:", event.type)
  } catch (err) {
    console.error("[v0] Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log("[v0] Processing payment_intent.succeeded")
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const order = await getOrderByPaymentIntent(paymentIntent.id)
        if (!order) {
          console.error("[v0] Order not found for payment intent:", paymentIntent.id)
          break
        }

        console.log("[v0] Found order:", order.order_number, "Status:", order.status)

        if (order.status === "completed" || order.status === "paid") {
          console.log("[v0] Order already processed:", order.order_number)
          break
        }

        const product = await getProductById(order.product_id)
        const variant = await getVariantById(order.variant_id)
        console.log("[v0] Product:", product?.name, "Variant:", variant?.name)

        const durationDays = variant?.duration_days || null

        const licenseKey = await createLicenseKeyForOrder(order.variant_id, order.id, durationDays)

        if (!licenseKey) {
          console.error("[v0] Failed to create license key")
          await sendDiscordErrorNotification({
            orderNumber: order.order_number,
            customerEmail: order.customer_email,
            error: "Failed to generate license key",
            context: `Product: ${product?.name || "Unknown"} - ${variant?.name || "Unknown"}`,
          })

          await updateOrderStatus(order.id, "completed", {
            payment_method: paymentIntent.payment_method_types?.[0] || "card",
            metadata: {
              ...((order.metadata as Record<string, unknown>) || {}),
              license_key_error: "Failed to generate",
              stripe_payment_id: paymentIntent.id,
            },
          })
          break
        }

        console.log("[v0] License key created:", licenseKey.license_key)

        await updateOrderStatus(order.id, "completed", {
          license_key_id: licenseKey.id,
          payment_method: paymentIntent.payment_method_types?.[0] || "card",
          metadata: {
            ...((order.metadata as Record<string, unknown>) || {}),
            stripe_payment_id: paymentIntent.id,
          },
        })

        const couponId = paymentIntent.metadata?.coupon_id
        if (couponId) {
          await incrementCouponUsage(couponId)
        }

        console.log("[v0] Sending email to:", order.customer_email)
        await sendPurchaseConfirmationEmail({
          customerEmail: order.customer_email,
          orderNumber: order.order_number,
          productName: product?.name || "Unknown Product",
          variantName: variant?.name || "Unknown Variant",
          licenseKey: licenseKey.license_key,
          expiresAt: licenseKey.expires_at,
          amount: order.amount_cents,
        })

        console.log("[v0] Sending Discord notification")
        await sendDiscordOrderNotification({
          orderNumber: order.order_number,
          productName: product?.name || "Unknown Product",
          variantName: variant?.name || "Unknown Variant",
          customerEmail: order.customer_email,
          amount: order.amount_cents,
          paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
          remainingStock: 999,
          stripePaymentId: paymentIntent.id,
        })

        console.log("[v0] Order completed successfully:", order.order_number)
        break
      }

      case "checkout.session.completed": {
        console.log("[v0] Processing checkout.session.completed")
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status !== "paid") {
          console.log("[v0] Payment not completed yet, status:", session.payment_status)
          break
        }

        const order = await getOrderByCheckoutSession(session.id)
        if (!order) {
          console.error("[v0] Order not found for session:", session.id)
          break
        }

        console.log("[v0] Found order:", order.order_number, "Status:", order.status)

        if (order.status === "completed" || order.status === "paid") {
          console.log("[v0] Order already processed:", order.order_number)
          break
        }

        const product = await getProductById(order.product_id)
        const variant = await getVariantById(order.variant_id)

        const durationDays = variant?.duration_days || null

        const licenseKey = await createLicenseKeyForOrder(order.variant_id, order.id, durationDays)

        if (!licenseKey) {
          console.error("[v0] Failed to create license key")
          await sendDiscordErrorNotification({
            orderNumber: order.order_number,
            customerEmail: order.customer_email,
            error: "Failed to generate license key",
            context: `Product: ${product?.name || "Unknown"} - ${variant?.name || "Unknown"}`,
          })

          await updateOrderStatus(order.id, "completed", {
            payment_method: session.payment_method_types?.[0] || "card",
            metadata: {
              ...((order.metadata as Record<string, unknown>) || {}),
              license_key_error: "Failed to generate",
              stripe_session_id: session.id,
            },
          })
          break
        }

        console.log("[v0] License key created:", licenseKey.license_key)

        await updateOrderStatus(order.id, "completed", {
          license_key_id: licenseKey.id,
          payment_method: session.payment_method_types?.[0] || "card",
          metadata: {
            ...((order.metadata as Record<string, unknown>) || {}),
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
          },
        })

        const couponId = session.metadata?.coupon_id
        if (couponId) {
          await incrementCouponUsage(couponId)
        }

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
          paymentMethod: session.payment_method_types?.[0] || "card",
          remainingStock: 999,
          stripePaymentId: session.payment_intent as string,
        })

        console.log("[v0] Order completed successfully:", order.order_number)
        break
      }

      case "charge.refunded": {
        console.log("[v0] Processing charge.refunded")
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          const order = await getOrderByPaymentIntent(paymentIntentId)
          if (order) {
            console.log("[v0] Marking order as refunded:", order.order_number)
            await updateOrderStatus(order.id, "refunded", {
              metadata: {
                ...((order.metadata as Record<string, unknown>) || {}),
                refund_id: charge.refunds?.data[0]?.id,
                refunded_at: new Date().toISOString(),
              },
            })
          }
        }
        break
      }

      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    // Return 200 to prevent Stripe from retrying
    return NextResponse.json({ received: true, error: "Internal error" }, { status: 200 })
  }
}
