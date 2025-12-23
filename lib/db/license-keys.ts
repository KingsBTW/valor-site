import { createClient } from "@/lib/supabase/server"
import type { LicenseKey } from "@/lib/database.types"

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const segments = 4
  const segmentLength = 5
  const keyParts: string[] = []

  for (let i = 0; i < segments; i++) {
    let segment = ""
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    keyParts.push(segment)
  }

  return keyParts.join("-")
}

export async function createLicenseKeyForOrder(
  variantId: string,
  orderId: string,
  durationDays: number | null,
  customKey?: string,
): Promise<LicenseKey | null> {
  const supabase = await createClient()

  const licenseKey = customKey || generateLicenseKey()
  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : null

  const { data, error } = await supabase
    .from("license_keys")
    .insert({
      variant_id: variantId,
      license_key: licenseKey,
      status: "used",
      assigned_to_order: orderId,
      assigned_at: new Date().toISOString(),
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating license key:", error)
    return null
  }

  console.log("[v0] Created license key:", licenseKey)
  return data
}

export async function getAvailableLicenseKey(variantId: string): Promise<LicenseKey | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("license_keys")
    .select("*")
    .eq("variant_id", variantId)
    .eq("status", "unused")
    .limit(1)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function assignLicenseKeyToOrder(
  licenseKeyId: string,
  orderId: string,
  durationDays: number | null,
): Promise<LicenseKey | null> {
  const supabase = await createClient()

  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : null

  const { data, error } = await supabase
    .from("license_keys")
    .update({
      status: "used",
      assigned_to_order: orderId,
      assigned_at: new Date().toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", licenseKeyId)
    .eq("status", "unused")
    .select()
    .single()

  if (error) {
    console.error("[v0] Error assigning license key:", error)
    return null
  }

  return data
}

export async function getLicenseKeysByVariant(variantId: string): Promise<LicenseKey[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("license_keys")
    .select("*")
    .eq("variant_id", variantId)
    .order("status")
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export async function addLicenseKeys(variantId: string, keys: string[]): Promise<number> {
  const supabase = await createClient()

  const keysToInsert = keys.map((key) => ({
    variant_id: variantId,
    license_key: key.trim(),
    status: "unused" as const,
  }))

  const { data, error } = await supabase.from("license_keys").insert(keysToInsert).select()

  if (error) {
    console.error("[v0] Error adding license keys:", error)
    return 0
  }

  return data?.length || 0
}

export async function revokeLicenseKey(licenseKeyId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("license_keys").update({ status: "revoked" }).eq("id", licenseKeyId)

  return !error
}
