"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Elements, PaymentElement, useStripe, useElements, LinkAuthenticationElement } from "@stripe/react-stripe-js"
import { loadStripe, type StripeElementsOptions, type Appearance } from "@stripe/stripe-js"
import { createPaymentIntent, validateCouponCode } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2, Tag, Shield, Zap, CheckCircle, Lock, CreditCard } from "lucide-react"
import type { ProductVariant } from "@/lib/database.types"
import Image from "next/image"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Custom appearance matching Warp Cheats blue theme
const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#90bdf8",
    colorBackground: "#1a1a1a",
    colorText: "#f5f5f5",
    colorDanger: "#ef4444",
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
    colorTextSecondary: "#a1a1aa",
    colorTextPlaceholder: "#71717a",
  },
  rules: {
    ".Tab": {
      border: "1px solid rgba(144, 189, 248, 0.3)",
      boxShadow: "0 0 10px rgba(144, 189, 248, 0.1)",
      backgroundColor: "#1a1a1a",
    },
    ".Tab:hover": {
      color: "#f5f5f5",
      borderColor: "rgba(144, 189, 248, 0.5)",
    },
    ".Tab--selected": {
      borderColor: "#90bdf8",
      backgroundColor: "rgba(144, 189, 248, 0.1)",
      boxShadow: "0 0 20px rgba(144, 189, 248, 0.3)",
    },
    ".Input": {
      backgroundColor: "#262626",
      border: "1px solid rgba(144, 189, 248, 0.2)",
    },
    ".Input:focus": {
      borderColor: "#90bdf8",
      boxShadow: "0 0 0 2px rgba(144, 189, 248, 0.2)",
    },
    ".Input--invalid": {
      borderColor: "#ef4444",
      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
    },
    ".Label": {
      color: "#e5e5e5",
    },
    ".Error": {
      color: "#ef4444",
    },
  },
}

interface StripeCheckoutProps {
  productSlug: string
  productName: string
  productImage?: string
  productDescription?: string
  variants: ProductVariant[]
  productStatus: string
}

// Payment form component that uses Stripe hooks
function PaymentForm({
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: {
  onSuccess: () => void
  onError: (message: string) => void
  isProcessing: boolean
  setIsProcessing: (val: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (error) {
      onError(error.message || "Payment failed")
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <LinkAuthenticationElement
          options={{
            defaultValues: {
              email: "",
            },
          }}
        />
        <PaymentElement
          options={{
            layout: "accordion",
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: true,
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all duration-300 glow-border"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Complete Purchase
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>Secured by</span>
        <span className="font-semibold text-foreground">Stripe</span>
      </div>
    </form>
  )
}

export function StripeCheckout({
  productSlug,
  productName,
  productImage,
  productDescription,
  variants,
  productStatus,
}: StripeCheckoutProps) {
  const safeVariants = variants && variants.length > 0 ? variants : []
  const [selectedVariant, setSelectedVariant] = useState<string>(safeVariants[0]?.id || "")
  const [email, setEmail] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<{
    discountAmount: number
    finalAmount: number
  } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderInfo, setOrderInfo] = useState<{
    orderNumber: string
    finalAmount: number
    originalAmount: number
    discountAmount: number
  } | null>(null)

  const selectedVariantData = safeVariants.find((v) => v.id === selectedVariant)
  const displayAmount = couponApplied ? couponApplied.finalAmount : selectedVariantData?.price_cents || 0
  const displayDiscount = couponApplied?.discountAmount || 0
  const originalAmount = selectedVariantData?.price_cents || 0

  // Reset coupon when variant changes
  useEffect(() => {
    setCouponApplied(null)
    setCouponError(null)
  }, [selectedVariant])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedVariant) return

    setCouponLoading(true)
    setCouponError(null)

    try {
      const result = await validateCouponCode(couponCode, selectedVariant)
      if (result.valid) {
        setCouponApplied({
          discountAmount: result.discountAmount!,
          finalAmount: result.finalAmount!,
        })
      } else {
        setCouponError(result.error || "Invalid coupon")
        setCouponApplied(null)
      }
    } catch {
      setCouponError("Failed to validate coupon")
      setCouponApplied(null)
    } finally {
      setCouponLoading(false)
    }
  }

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
      const result = await createPaymentIntent({
        productSlug,
        variantId: selectedVariant,
        customerEmail: email,
        couponCode: couponApplied ? couponCode : undefined,
      })
      setClientSecret(result.clientSecret)
      setOrderInfo({
        orderNumber: result.orderNumber,
        finalAmount: result.finalAmount,
        originalAmount: result.originalAmount,
        discountAmount: result.discountAmount,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout")
    } finally {
      setIsLoading(false)
    }
  }

  if (productStatus === "down") {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="font-bold text-lg text-destructive">Product Currently Unavailable</p>
        <p className="text-sm text-muted-foreground mt-2">
          This product is temporarily down. Check our status page for updates.
        </p>
      </div>
    )
  }

  if (safeVariants.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p className="font-bold text-lg text-yellow-500">No Pricing Options Available</p>
        <p className="text-sm text-muted-foreground mt-2">
          This product does not have any pricing options configured yet. Please check back later or contact support.
        </p>
      </div>
    )
  }

  // Show checkout form before payment
  if (!clientSecret) {
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
            <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant} className="grid grid-cols-2 gap-3">
              {safeVariants.map((variant) => (
                <div key={variant.id}>
                  <RadioGroupItem value={variant.id} id={variant.id} className="peer sr-only" />
                  <Label
                    htmlFor={variant.id}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/50 p-4 hover:bg-accent/50 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-foreground">{variant.name}</span>
                    <span className="text-xl font-bold gradient-text">${(variant.price_cents / 100).toFixed(2)}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, title: "Undetected", desc: "Advanced bypass" },
              { icon: Zap, title: "Instant", desc: "Auto delivery" },
              { icon: CheckCircle, title: "24/7 Support", desc: "Always available" },
            ].map((benefit) => (
              <div key={benefit.title} className="glass-panel rounded-lg p-3 border border-primary/20 text-center">
                <benefit.icon className="h-5 w-5 text-primary mx-auto mb-1" />
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
                className="bg-card border-border h-12"
              />
              <p className="text-xs text-muted-foreground">Your license key will be sent to this email</p>
            </div>

            {/* Coupon Code */}
            <div className="space-y-2">
              <Label htmlFor="coupon" className="text-sm font-medium text-foreground">
                Coupon Code
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="coupon"
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase())
                      if (couponApplied) {
                        setCouponApplied(null)
                      }
                    }}
                    className="bg-card border-border pl-10 h-12"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="h-12 px-6 border-primary/30 hover:bg-primary/10 bg-transparent"
                >
                  {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
              {couponError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {couponError}
                </p>
              )}
              {couponApplied && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Coupon applied! You save ${(couponApplied.discountAmount / 100).toFixed(2)}
                </p>
              )}
            </div>

            <Separator className="bg-border" />

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${(originalAmount / 100).toFixed(2)}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${(displayDiscount / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator className="bg-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="gradient-text">${(displayAmount / 100).toFixed(2)}</span>
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

            {/* Continue to Payment Button */}
            <Button
              onClick={handleStartCheckout}
              disabled={isLoading || !email || !selectedVariant}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all duration-300 glow-border"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing Checkout...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Continue to Payment
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe. Your payment info is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show Stripe Payment Element
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Order Summary */}
      <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h3 className="font-semibold text-foreground">Order Details</h3>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-primary/30">
              <Image
                src={productImage || "/placeholder.svg?height=64&width=64&query=gaming+software"}
                alt={productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground">{productName}</h4>
              <p className="text-primary text-sm">{selectedVariantData?.name}</p>
            </div>
          </div>

          <Separator className="bg-border mb-4" />

          <div className="space-y-2 text-sm">
            {orderInfo && (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <span>Order #</span>
                  <span className="font-mono text-foreground">{orderInfo.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${(orderInfo.originalAmount / 100).toFixed(2)}</span>
                </div>
                {orderInfo.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${(orderInfo.discountAmount / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator className="bg-border" />
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span className="text-foreground">Total</span>
                  <span className="gradient-text">${(orderInfo.finalAmount / 100).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="glass-panel rounded-xl p-6 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-4">What You Get</h3>
          <ul className="space-y-3">
            {[
              "Instant license key delivery via email",
              "Access to all premium features",
              "Automatic updates included",
              "24/7 customer support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Payment Form */}
      <div className="glass-panel rounded-xl p-6 border border-primary/20 glow-border">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Payment Method</h2>
        </div>

        <Elements stripe={stripePromise} options={elementsOptions}>
          <PaymentForm
            onSuccess={() => {}}
            onError={(message) => setError(message)}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </Elements>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
