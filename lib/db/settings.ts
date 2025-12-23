import { createClient } from "@/lib/supabase/server"

export type PaymentProvider = "stripe" | "cardsetup" | "both"

export interface SiteSettings {
  payment_provider: PaymentProvider
  cardsetup_store_url: string
  site_name: string
  site_url: string
  maintenance_mode: boolean
}

const defaultSettings: SiteSettings = {
  payment_provider: "stripe",
  cardsetup_store_url: "https://warpcheats.com",
  site_name: "Warp Cheats",
  site_url: "https://warpcheats.com",
  maintenance_mode: false,
}

export async function getSetting<K extends keyof SiteSettings>(key: K): Promise<SiteSettings[K]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).single()

  if (error || !data) {
    return defaultSettings[key]
  }

  return data.value as SiteSettings[K]
}

export async function getAllSettings(): Promise<SiteSettings> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("site_settings").select("key, value")

  if (error || !data) {
    return defaultSettings
  }

  const settings = { ...defaultSettings }
  for (const row of data) {
    if (row.key in settings) {
      ;(settings as any)[row.key] = row.value
    }
  }

  return settings
}

export async function updateSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })

  if (error) {
    console.error("[v0] Error updating setting:", error)
    throw new Error("Failed to update setting")
  }
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  return getSetting("payment_provider")
}
