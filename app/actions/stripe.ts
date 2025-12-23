"use server"

import { stripe } from "@/lib/stripe"
import { getProductBySlug, getVariantById } from "@/lib/db/products"
import { createOrder } from "@/lib/db/orders"
import { validateCoupon, applyCouponDiscount } from "@/lib/db/coupons"
import { headers } from "next/headers"

export async function createPaymentIntent(data: {
  productSlug: string
  variantId: string
  customerEmail: string
  couponCode?: string
}) {
  const product = await getProductBySlug(data.productSlug)
  if (!product) {
    throw new Error("Product not found")
  }

  if (product.status === "down") {
    throw new Error("This product is currently unavailable")
  }

  const variant = await getVariantById(data.variantId)
  if (!variant || variant.product_id !== product.id) {
    throw new Error("Invalid variant selected")
  }

  let finalAmount = variant.price_cents
  let discountAmount = 0
  let couponId: string | null = null
  let couponCodeUsed: string | null = null

  if (data.couponCode) {
    const coupon = await validateCoupon(data.couponCode, variant.price_cents)
    if (coupon) {
      const discountedAmount = await applyCouponDiscount(coupon, variant.price_cents)
      discountAmount = variant.price_cents - discountedAmount
      finalAmount = discountedAmount
      couponId = coupon.id
      couponCodeUsed = data.couponCode
    }
  }

  // Create PaymentIntent instead of Checkout Session
  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "usd",
    receipt_email: data.customerEmail,
    metadata: {
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      variant_id: variant.id,
      variant_name: variant.name,
      customer_email: data.customerEmail,
      coupon_id: couponId || "",
      duration_days: variant.duration_days?.toString() || "lifetime",
      original_amount: variant.price_cents.toString(),
      discount_amount: discountAmount.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  // Create pending order in database
  const order = await createOrder({
    customer_email: data.customerEmail,
    product_id: product.id,
    variant_id: variant.id,
    amount_cents: finalAmount,
    stripe_payment_intent_id: paymentIntent.id,
    metadata: {
      coupon_id: couponId,
      coupon_code: couponCodeUsed,
      original_amount: variant.price_cents,
      discount_amount: discountAmount,
    },
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    orderId: order.id,
    orderNumber: order.order_number,
    productName: product.name,
    variantName: variant.name,
    originalAmount: variant.price_cents,
    discountAmount,
    finalAmount,
  }
}

export async function createCheckoutSession(data: {
  productSlug: string
  variantId: string
  customerEmail: string
  couponCode?: string
}) {
  const product = await getProductBySlug(data.productSlug)
  if (!product) {
    throw new Error("Product not found")
  }

  if (product.status === "down") {
    throw new Error("This product is currently unavailable")
  }

  const variant = await getVariantById(data.variantId)
  if (!variant || variant.product_id !== product.id) {
    throw new Error("Invalid variant selected")
  }

  let finalAmount = variant.price_cents
  let couponId: string | null = null

  if (data.couponCode) {
    const coupon = await validateCoupon(data.couponCode, variant.price_cents)
    if (coupon) {
      finalAmount = await applyCouponDiscount(coupon, variant.price_cents)
      couponId = coupon.id
    }
  }

  const headersList = await headers()
  const origin = headersList.get("origin") || "https://valor.com"

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    customer_email: data.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} - ${variant.name}`,
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: finalAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      product_id: product.id,
      product_slug: product.slug,
      variant_id: variant.id,
      variant_name: variant.name,
      customer_email: data.customerEmail,
      coupon_id: couponId || "",
      duration_days: variant.duration_days?.toString() || "lifetime",
    },
    return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  })

  await createOrder({
    customer_email: data.customerEmail,
    product_id: product.id,
    variant_id: variant.id,
    amount_cents: finalAmount,
    stripe_checkout_session_id: session.id,
    metadata: {
      coupon_id: couponId,
      original_amount: variant.price_cents,
    },
  })

  return { clientSecret: session.client_secret! }
}

export async function validateCouponCode(couponCode: string, variantId: string) {
  const variant = await getVariantById(variantId)
  if (!variant) {
    return { valid: false, error: "Invalid variant" }
  }

  const coupon = await validateCoupon(couponCode, variant.price_cents)
  if (!coupon) {
    return { valid: false, error: "Invalid or expired coupon code" }
  }

  const discountedAmount = await applyCouponDiscount(coupon, variant.price_cents)
  const discountAmount = variant.price_cents - discountedAmount

  return {
    valid: true,
    discountAmount,
    finalAmount: discountedAmount,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
  }
}

export async function getPaymentIntentStatus(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  return {
    status: paymentIntent.status,
    customerEmail: paymentIntent.receipt_email,
    metadata: paymentIntent.metadata,
  }
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.status,
    customerEmail: session.customer_email || session.customer_details?.email,
    paymentStatus: session.payment_status,
  }
}

