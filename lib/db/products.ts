import { createClient } from "@/lib/supabase/server"
import type { Product, ProductWithVariants, ProductVariant } from "@/lib/database.types"
import { notFound } from "next/navigation"

export async function getAllProducts(): Promise<(Product & { product_variants?: ProductVariant[] })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("popular", { ascending: false })
    .order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient()

  const { data: product, error: productError } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (productError || !product) {
    return null
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .eq("active", true)
    .order("sort_order")

  if (variantsError) {
    console.error("Error fetching variants:", variantsError)
    return { ...product, variants: [] }
  }

  return { ...product, variants: variants || [] }
}

export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient()

  const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", id).single()

  if (productError || !product) {
    return null
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .eq("active", true)
    .order("sort_order")

  return { ...product, variants: variants || [] }
}

export async function getProductsByGame(game: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*").ilike("game", `%${game}%`).order("name")

  if (error) {
    return []
  }

  return data || []
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*").eq("category", category).order("name")

  if (error) {
    return []
  }

  return data || []
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*").eq("popular", true).limit(8)

  if (error) {
    return []
  }

  return data || []
}

export async function getVariantById(variantId: string): Promise<ProductVariant | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("product_variants").select("*").eq("id", variantId).single()

  if (error) {
    return null
  }

  return data
}

export async function getVariantStock(variantId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("license_keys")
    .select("*", { count: "exact", head: true })
    .eq("variant_id", variantId)
    .eq("status", "unused")

  if (error) {
    return 0
  }

  return count || 0
}

export { notFound }
