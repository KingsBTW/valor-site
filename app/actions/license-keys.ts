"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { LicenseKey, ProductVariant } from "@/lib/database.types"

// Get all variants for a product with their stock counts
export async function getProductVariantsWithStock(
  productId: string,
): Promise<(ProductVariant & { stock: { total: number; unused: number; used: number } })[]> {
  const supabase = await createClient()

  // Get variants for this product
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order")

  if (error || !variants) {
    console.error("Error fetching variants:", error)
    return []
  }

  // Get stock counts for each variant
  const variantsWithStock = await Promise.all(
    variants.map(async (variant) => {
      const { count: total } = await supabase
        .from("license_keys")
        .select("*", { count: "exact", head: true })
        .eq("variant_id", variant.id)

      const { count: unused } = await supabase
        .from("license_keys")
        .select("*", { count: "exact", head: true })
        .eq("variant_id", variant.id)
        .eq("status", "unused")

      const { count: used } = await supabase
        .from("license_keys")
        .select("*", { count: "exact", head: true })
        .eq("variant_id", variant.id)
        .eq("status", "used")

      return {
        ...variant,
        stock: {
          total: total || 0,
          unused: unused || 0,
          used: used || 0,
        },
      }
    }),
  )

  return variantsWithStock
}

// Get license keys for a specific variant
export async function getLicenseKeysByVariant(variantId: string): Promise<LicenseKey[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("license_keys")
    .select("*")
    .eq("variant_id", variantId)
    .order("status")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching license keys:", error)
    return []
  }

  return data || []
}

// Add license keys to a specific variant
export async function addLicenseKeysToVariant(
  variantId: string,
  keys: string[],
): Promise<{
  success: boolean
  count: number
  duplicates: number
  error?: string
}> {
  const supabase = await createClient()

  // Clean and filter keys
  const cleanedKeys = keys.map((key) => key.trim()).filter((key) => key.length > 0)

  if (cleanedKeys.length === 0) {
    return { success: false, count: 0, duplicates: 0, error: "No valid keys provided" }
  }

  // Check for existing keys to avoid duplicates
  const { data: existingKeys } = await supabase
    .from("license_keys")
    .select("license_key")
    .in("license_key", cleanedKeys)

  const existingKeySet = new Set(existingKeys?.map((k) => k.license_key) || [])
  const newKeys = cleanedKeys.filter((key) => !existingKeySet.has(key))
  const duplicates = cleanedKeys.length - newKeys.length

  if (newKeys.length === 0) {
    return { success: false, count: 0, duplicates, error: "All keys already exist in the system" }
  }

  const keysToInsert = newKeys.map((key) => ({
    variant_id: variantId,
    license_key: key,
    status: "unused" as const,
  }))

  const { data, error } = await supabase.from("license_keys").insert(keysToInsert).select()

  if (error) {
    console.error("Error adding license keys:", error)
    return { success: false, count: 0, duplicates: 0, error: error.message }
  }

  revalidatePath("/admin/license-keys")
  revalidatePath("/admin/products")
  return { success: true, count: data?.length || 0, duplicates }
}

// Update a single license key
export async function updateLicenseKey(
  licenseKeyId: string,
  data: { license_key?: string; status?: LicenseKey["status"] },
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("license_keys").update(data).eq("id", licenseKeyId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/license-keys")
  return { success: true }
}

// Delete a single license key
export async function deleteLicenseKey(licenseKeyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Check if key is used - don't allow deleting used keys
  const { data: key } = await supabase.from("license_keys").select("status").eq("id", licenseKeyId).single()

  if (key?.status === "used") {
    return { success: false, error: "Cannot delete a used license key" }
  }

  const { error } = await supabase.from("license_keys").delete().eq("id", licenseKeyId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/license-keys")
  return { success: true }
}

// Bulk delete unused keys for a variant
export async function bulkDeleteUnusedKeys(
  variantId: string,
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("license_keys")
    .delete()
    .eq("variant_id", variantId)
    .eq("status", "unused")
    .select()

  if (error) {
    return { success: false, count: 0, error: error.message }
  }

  revalidatePath("/admin/license-keys")
  return { success: true, count: data?.length || 0 }
}

// Bulk revoke keys for a variant
export async function bulkRevokeKeys(
  variantId: string,
  keyIds: string[],
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("license_keys")
    .update({ status: "revoked" })
    .in("id", keyIds)
    .eq("variant_id", variantId)
    .select()

  if (error) {
    return { success: false, count: 0, error: error.message }
  }

  revalidatePath("/admin/license-keys")
  return { success: true, count: data?.length || 0 }
}

// Get all products with their variants and stock counts for the license keys page
export async function getAllProductsWithVariantsAndStock(): Promise<
  {
    id: string
    name: string
    game: string
    image_url: string | null
    variants: (ProductVariant & { stock: { total: number; unused: number; used: number } })[]
  }[]
> {
  const supabase = await createClient()

  const { data: products, error } = await supabase.from("products").select("id, name, game, image_url").order("name")

  if (error || !products) {
    return []
  }

  const productsWithVariants = await Promise.all(
    products.map(async (product) => {
      const variants = await getProductVariantsWithStock(product.id)
      return {
        ...product,
        variants,
      }
    }),
  )

  return productsWithVariants
}
