"use server"

import { updateSetting, getAllSettings, type PaymentProvider } from "@/lib/db/settings"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  return getAllSettings()
}

export async function updatePaymentProvider(provider: PaymentProvider) {
  await updateSetting("payment_provider", provider)
  revalidatePath("/admin/settings")
  revalidatePath("/products")
}

export async function updateCardSetupStoreUrl(url: string) {
  await updateSetting("cardsetup_store_url", url)
  revalidatePath("/admin/settings")
}

export async function updateSiteName(name: string) {
  await updateSetting("site_name", name)
  revalidatePath("/admin/settings")
  revalidatePath("/")
}

export async function updateMaintenanceMode(enabled: boolean) {
  await updateSetting("maintenance_mode", enabled)
  revalidatePath("/")
}
