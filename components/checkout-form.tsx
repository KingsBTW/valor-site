"use client"

import { useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Loader2, Tag } from "lucide-react"
import type { ProductVariant } from "@/lib/database.types"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  productSlug: string
  variants: ProductVariant[]
  productStatus: string
}

export function CheckoutForm({ productSlug, variants, productStatus }: CheckoutFormProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>(variants[0]?.id || "")
  const [email, setEmail] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const selectedVariantData = variants.find((v) => v.id === selectedVariant)

  const handleStartCheckout = async () => {
    if (!email || !selectedVariant) {
      setError("Please enter your email and select a duration")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await createCheckoutSession({
        productSlug,
        variantId: selectedVariant,
        customerEmail: email,
        couponCode: couponCode || undefined,
      })
      setClientSecret(result.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout")
    } finally {
      setIsLoading(false)
    }
  }

  if (productStatus === "down") {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-3" />
        <p className="font-medium text-destructive">Product Currently Unavailable</p>
        <p className="text-sm text-muted-foreground mt-1">
          This product is temporarily down. Check our status page for updates.
        </p>
      </div>
    )
  }

  if (clientSecret) {
    return (
      <div className="w-full">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Select Duration</Label>
        <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant} className="grid grid-cols-2 gap-3">
          {variants.map((variant) => (
            <div key={variant.id}>
              <RadioGroupItem value={variant.id} id={variant.id} className="peer sr-only" />
              <Label
                htmlFor={variant.id}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
              >
                <span className="text-sm font-medium">{variant.name}</span>
                <span className="text-lg font-bold gradient-text">${(variant.price_cents / 100).toFixed(2)}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-input border-border"
        />
        <p className="text-xs text-muted-foreground">Your license key will be sent to this email</p>
      </div>

      {/* Coupon Code */}
      <div className="space-y-2">
        <Label htmlFor="coupon" className="text-sm font-medium text-foreground">
          Coupon Code (Optional)
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="coupon"
              type="text"
              placeholder="Enter code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="bg-input border-border pl-10"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Checkout Button */}
      <Button
        onClick={handleStartCheckout}
        disabled={isLoading || !email || !selectedVariant}
        className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>Purchase for ${selectedVariantData ? (selectedVariantData.price_cents / 100).toFixed(2) : "0.00"}</>
        )}
      </Button>

      {/* Security Note */}
      <p className="text-xs text-center text-muted-foreground">
        Secure payment powered by Stripe. Your payment info is never stored on our servers.
      </p>
    </div>
  )
}
