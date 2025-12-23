// Database types matching the Supabase schema
export interface Product {
  id: string
  slug: string
  name: string
  game: string
  category: string
  description: string | null
  features: string[]
  image_url: string | null
  status: "undetected" | "updating" | "down" | "testing"
  tags: string[]
  popular: boolean
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  duration_days: number | null
  price_cents: number
  stripe_price_id: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface LicenseKey {
  id: string
  variant_id: string
  license_key: string
  status: "unused" | "used" | "expired" | "revoked"
  assigned_to_order: string | null
  assigned_at: string | null
  expires_at: string | null
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  product_id: string
  variant_id: string
  license_key_id: string | null
  amount_cents: number
  currency: string
  status: "pending" | "paid" | "failed" | "refunded"
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  payment_method: string | null
  metadata: Record<string, unknown>
  created_at: string
  paid_at: string | null
}

export interface Coupon {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_uses: number | null
  current_uses: number
  min_order_cents: number
  valid_from: string
  valid_until: string | null
  active: boolean
  created_at: string
}

export interface SupportTicket {
  id: string
  ticket_number: string
  customer_email: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "normal" | "high" | "urgent"
  order_id: string | null
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface ProductWithVariants extends Product {
  variants: ProductVariant[]
}

export interface OrderWithDetails extends Order {
  product?: Product
  variant?: ProductVariant
  license_key?: LicenseKey
}
