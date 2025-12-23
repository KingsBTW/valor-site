import { createClient } from "@/lib/supabase/server"
import type { Coupon } from "@/lib/database.types"

export async function validateCoupon(code: string, orderAmountCents: number): Promise<Coupon | null> {
  const supabase = await createClient()

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single()

  if (error || !coupon) {
    return null
  }

  // Check if coupon is valid
  const now = new Date()
  const validFrom = new Date(coupon.valid_from)
  const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

  if (now < validFrom) {
    return null
  }

  if (validUntil && now > validUntil) {
    return null
  }

  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return null
  }

  if (orderAmountCents < coupon.min_order_cents) {
    return null
  }

  return coupon
}

export async function applyCouponDiscount(coupon: Coupon, amountCents: number): number {
  if (coupon.discount_type === "percentage") {
    return Math.round(amountCents * (1 - coupon.discount_value / 100))
  } else {
    return Math.max(0, amountCents - coupon.discount_value)
  }
}

export async function incrementCouponUsage(couponId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.rpc("increment_coupon_usage", { coupon_id: couponId })

  return !error
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return data || []
}
