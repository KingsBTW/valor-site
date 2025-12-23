"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react"
import { finalizeCardSetupPayment, verifyCardSetupOrder } from "@/app/actions/cardsetup"
import Link from "next/link"

export default function CardSetupCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const orderId = searchParams.get("order_id")

    const transactionId =
      searchParams.get("transactionid") ||
      searchParams.get("transaction_id") ||
      searchParams.get("TransactionId") ||
      searchParams.get("txn_id") ||
      searchParams.get("txnid") ||
      searchParams.get("payment_id") ||
      searchParams.get("paymentid") ||
      searchParams.get("ref") ||
      searchParams.get("reference")

    console.log("[v0] Callback params - orderId:", orderId, "transactionId:", transactionId)
    console.log("[v0] All search params:", Object.fromEntries(searchParams.entries()))

    if (!orderId) {
      setStatus("error")
      setError("Missing order information")
      return
    }

    if (!transactionId) {
      verifyOrder(orderId)
    } else {
      finalizePayment(transactionId, orderId)
    }
  }, [searchParams])

  async function verifyOrder(orderId: string) {
    try {
      const result = await verifyCardSetupOrder(orderId)

      if (result.success) {
        if (result.alreadyCompleted) {
          // Order was already completed - show success
          setStatus("success")
          setLicenseKey(result.licenseKey || null)
          setOrderNumber(result.orderNumber || null)
        } else if (result.pending) {
          // Payment still pending - show message
          setStatus("error")
          setError("Payment is still being processed. Please wait a few moments and refresh this page.")
        } else {
          setStatus("success")
          setLicenseKey(result.licenseKey || null)
          setOrderNumber(result.orderNumber || null)
        }

        // Notify parent window if in popup
        if (window.opener && result.success) {
          window.opener.postMessage(
            {
              type: "cardsetup_payment_complete",
              orderId,
              success: true,
            },
            "*",
          )
          setTimeout(() => window.close(), 1500)
        } else if (!result.pending) {
          setTimeout(() => {
            router.push(`/checkout/success?cardsetup_order=${orderId}`)
          }, 2000)
        }
      } else {
        setStatus("error")
        setError(result.error || "Unable to verify payment status")
      }
    } catch (err) {
      console.error("[v0] Verify order error:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Payment verification failed")
    }
  }

  async function finalizePayment(transactionId: string, orderId: string) {
    try {
      const result = await finalizeCardSetupPayment(transactionId, orderId)

      if (result.success) {
        setStatus("success")
        setLicenseKey(result.licenseKey || null)
        setOrderNumber(result.orderNumber || null)

        if (window.opener) {
          window.opener.postMessage(
            {
              type: "cardsetup_payment_complete",
              orderId,
              success: true,
            },
            "*",
          )
          setTimeout(() => window.close(), 1500)
        } else {
          setTimeout(() => {
            router.push(`/checkout/success?cardsetup_order=${orderId}`)
          }, 2000)
        }
      }
    } catch (err) {
      console.error("[v0] Finalize payment error:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Payment verification failed")

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "cardsetup_payment_failed",
            error: err instanceof Error ? err.message : "Payment failed",
          },
          "*",
        )
      }
    }
  }

  function handleCopy() {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-panel border-primary/20">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <CardTitle>Processing Payment</CardTitle>
              <p className="text-muted-foreground">Please wait while we verify your payment...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-green-500">Payment Successful!</CardTitle>
              <p className="text-muted-foreground">
                {typeof window !== "undefined" && window.opener
                  ? "This window will close automatically..."
                  : "Redirecting to your order..."}
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-500">Payment Issue</CardTitle>
              <p className="text-muted-foreground">{error}</p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {status === "success" && licenseKey && (
            <div className="space-y-4">
              {orderNumber && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono font-bold">{orderNumber}</p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-muted-foreground text-center mb-2">Your License Key</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-background rounded font-mono text-sm text-center break-all">
                    {licenseKey}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0 bg-transparent">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your license key has also been sent to your email address.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              {error?.includes("still being processed") ? (
                <Button onClick={() => window.location.reload()} className="w-full bg-primary hover:bg-primary/90">
                  Refresh Page
                </Button>
              ) : (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-center">Please create a support ticket in our Discord for assistance:</p>
                  <a
                    href="https://discord.gg/warpcheats"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-primary hover:underline mt-2"
                  >
                    discord.gg/warpcheats
                  </a>
                </div>
              )}
            </div>
          )}

          {typeof window !== "undefined" && !window.opener && (
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
                <Link href="https://discord.gg/warpcheats" target="_blank">
                  Join Discord
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

