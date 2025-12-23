import { getPaymentProvider, getSetting } from "@/lib/db/settings"

export interface CardSetupInvoice {
  store: string
  invoice_id: string
  amount: string
  currency: string
  purchases: Array<{ name: string }>
  email: string
  callbackURL: string
  orderinfo?: string
}

export async function createCardSetupInvoice(data: {
  invoiceId: string
  amount: number
  productName: string
  email: string
  callbackURL: string
  orderinfo?: string
}) {
  const storeUrl = await getSetting("cardsetup_store_url")

  const payload: CardSetupInvoice = {
    store: storeUrl,
    invoice_id: data.invoiceId,
    amount: (data.amount / 100).toFixed(2),
    currency: "USD",
    purchases: [{ name: data.productName }],
    email: data.email,
    callbackURL: data.callbackURL,
    orderinfo: data.orderinfo,
  }

  const response = await fetch("https://dashboard.card-setup.com/api/create-invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.errors?.[0] || "Failed to create Card Setup invoice")
  }

  return result
}

export async function finalizeCardSetupInvoice(transactionId: string) {
  const response = await fetch("https://dashboard.card-setup.com/api/finalize-invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transactionid: transactionId }),
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || "Failed to finalize payment")
  }

  return result
}

export async function shouldUseCardSetup(): Promise<boolean> {
  const provider = await getPaymentProvider()
  return provider === "cardsetup" || provider === "both"
}

export async function shouldUseStripe(): Promise<boolean> {
  const provider = await getPaymentProvider()
  return provider === "stripe" || provider === "both"
}
