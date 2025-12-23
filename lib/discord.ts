// Discord webhook for order notifications
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

interface DiscordEmbed {
  title: string
  description?: string
  color: number
  fields: { name: string; value: string; inline?: boolean }[]
  timestamp: string
  footer?: { text: string; icon_url?: string }
  thumbnail?: { url: string }
}

export async function sendDiscordOrderNotification(data: {
  orderNumber: string
  productName: string
  variantName: string
  customerEmail: string
  amount: number
  paymentMethod?: string
  remainingStock: number
  stripePaymentId?: string
}) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook not configured, skipping notification")
    return
  }

  const embed: DiscordEmbed = {
    title: "New Order Completed",
    color: 0x22c55e, // Green for completed orders
    fields: [
      { name: "Order ID", value: `\`${data.orderNumber}\``, inline: true },
      { name: "Product", value: data.productName, inline: true },
      { name: "Variant", value: data.variantName, inline: true },
      { name: "Customer", value: `||${data.customerEmail}||`, inline: true },
      { name: "Amount", value: `**$${(data.amount / 100).toFixed(2)}**`, inline: true },
      { name: "Payment", value: data.paymentMethod || "Card", inline: true },
      ...(data.stripePaymentId ? [{ name: "Stripe ID", value: `\`${data.stripePaymentId}\``, inline: false }] : []),
      { name: "Remaining Stock", value: `${data.remainingStock} keys`, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Valor Sales" },
    thumbnail: { url: "https://i.postimg.cc/rsCspgyJ/image-removebg-preview.png" },
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      console.error("Discord webhook failed:", await response.text())
    }
  } catch (error) {
    console.error("Failed to send Discord notification:", error)
  }
}

export async function sendDiscordStockAlert(data: {
  productName: string
  variantName: string
  remainingStock: number
}) {
  if (!DISCORD_WEBHOOK_URL) return

  const embed: DiscordEmbed = {
    title: "Low Stock Alert",
    description: `Stock is running low for **${data.productName}** - ${data.variantName}`,
    color: 0xfbbf24, // Yellow/warning color
    fields: [{ name: "Remaining Keys", value: `${data.remainingStock}`, inline: true }],
    timestamp: new Date().toISOString(),
    footer: { text: "Valor - Restock Soon!" },
  }

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "@here",
        embeds: [embed],
      }),
    })
  } catch (error) {
    console.error("Failed to send Discord stock alert:", error)
  }
}

export async function sendDiscordErrorNotification(data: {
  orderNumber: string
  customerEmail: string
  error: string
  context?: string
}) {
  if (!DISCORD_WEBHOOK_URL) return

  const embed: DiscordEmbed = {
    title: "Order Processing Error",
    description: `An error occurred while processing an order`,
    color: 0xdc2626, // Red for errors
    fields: [
      { name: "Order", value: `\`${data.orderNumber}\``, inline: true },
      { name: "Customer", value: data.customerEmail, inline: true },
      { name: "Error", value: data.error, inline: false },
      ...(data.context ? [{ name: "Context", value: data.context, inline: false }] : []),
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Valor - Requires Attention" },
  }

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "@here",
        embeds: [embed],
      }),
    })
  } catch (error) {
    console.error("Failed to send Discord error notification:", error)
  }
}

