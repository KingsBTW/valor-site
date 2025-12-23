"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Lock, CreditCard } from "lucide-react"
import type { ProductVariant } from "@/lib/database.types"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { createCardSetupPayment } from "@/app/actions/cardsetup"

interface CardSetupCheckoutProps {
  productSlug: string
  productName: string
  productImage?: string
  productDescription?: string
  variants: ProductVariant[]
}

export function CardSetupCheckout({
  productSlug,
  productName,
  productImage,
  productDescription,
  variants,
}: CardSetupCheckoutProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>(variants[0]?.id || "")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedVariantData = variants.find((v) => v.id === selectedVariant)

  const handleCheckout = async () => {
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
      const result = await createCardSetupPayment({
        productSlug,
        variantId: selectedVariant,
        customerEmail: email,
      })

      if (result && result.redirectUrl) {
        // Simply redirect to payment page in the same tab
        window.location.href = result.redirectUrl
      } else {
        throw new Error("No payment URL received")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment")
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Product Summary */}
      <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border border-primary/30">
              <Image
                src={productImage || "/placeholder.svg?height=80&width=80&query=gaming+software"}
                alt={productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground truncate">{productName}</h3>
              {selectedVariantData && <p className="text-primary font-medium">{selectedVariantData.name}</p>}
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{productDescription}</p>
            </div>
          </div>
        </div>

        {/* Variant Selection */}
        <div className="glass-panel rounded-xl p-6 border border-primary/20">
          <Label className="text-sm font-semibold text-foreground mb-4 block">Select Duration</Label>
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all duration-200 ${
                  selectedVariant === variant.id
                    ? "border-primary bg-primary/10"
                    : "border-muted bg-card/50 hover:border-primary/50"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-sm font-medium text-foreground">{variant.name}</span>
                <span className="text-xl font-bold gradient-text">${(variant.price_cents / 100).toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: "Undetected", desc: "Advanced bypass" },
            { title: "Instant", desc: "Auto delivery" },
            { title: "24/7 Support", desc: "Always available" },
          ].map((benefit) => (
            <div key={benefit.title} className="glass-panel rounded-lg p-3 border border-primary/20 text-center">
              <p className="font-medium text-xs text-foreground">{benefit.title}</p>
              <p className="text-xs text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Checkout Form */}
      <div className="glass-panel rounded-xl p-6 border border-primary/20 glow-border">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Complete Purchase</h2>
        </div>

        <div className="space-y-5">
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
              disabled={isLoading}
              className="bg-card border-border h-12"
            />
            <p className="text-xs text-muted-foreground">Your license key will be sent to this email</p>
          </div>

          <Separator className="bg-border" />

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  ${(selectedVariantData?.price_cents ? selectedVariantData.price_cents / 100 : 0).toFixed(2)}
                </span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="gradient-text">
                  ${(selectedVariantData?.price_cents ? selectedVariantData.price_cents / 100 : 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Pay Button */}
          <Button
            onClick={handleCheckout}
            disabled={isLoading || !email || !selectedVariant}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all duration-300 glow-border"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting to Payment...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Pay with Card Setup
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Card Setup. Your payment info is never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  )
}
