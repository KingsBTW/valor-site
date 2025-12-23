"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StripeCheckout } from "@/components/stripe-checkout"
import { CardSetupCheckout } from "@/components/card-setup-checkout"
import type { ProductVariant } from "@/lib/database.types"

interface PaymentMethodSelectorProps {
  productSlug: string
  productName: string
  productImage?: string
  productDescription?: string
  variants: ProductVariant[]
  productStatus: string
  availableMethods: "stripe" | "cardsetup" | "both"
}

export function PaymentMethodSelector({
  productSlug,
  productName,
  productImage,
  productDescription,
  variants,
  productStatus,
  availableMethods,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "cardsetup">(
    availableMethods === "cardsetup" ? "cardsetup" : "stripe",
  )

  // If only one method available, show it directly
  if (availableMethods === "stripe") {
    return (
      <StripeCheckout
        productSlug={productSlug}
        productName={productName}
        productImage={productImage}
        productDescription={productDescription}
        variants={variants}
        productStatus={productStatus}
      />
    )
  }

  if (availableMethods === "cardsetup") {
    return (
      <CardSetupCheckout
        productSlug={productSlug}
        productName={productName}
        productImage={productImage}
        productDescription={productDescription}
        variants={variants}
      />
    )
  }

  // Show both methods in tabs
  return (
    <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as "stripe" | "cardsetup")}>
      <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2 bg-muted/30">
        <TabsTrigger
          value="stripe"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Stripe
        </TabsTrigger>
        <TabsTrigger
          value="cardsetup"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Card Setup
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stripe" className="mt-6">
        <StripeCheckout
          productSlug={productSlug}
          productName={productName}
          productImage={productImage}
          productDescription={productDescription}
          variants={variants}
          productStatus={productStatus}
        />
      </TabsContent>

      <TabsContent value="cardsetup" className="mt-6">
        <CardSetupCheckout
          productSlug={productSlug}
          productName={productName}
          productImage={productImage}
          productDescription={productDescription}
          variants={variants}
        />
      </TabsContent>
    </Tabs>
  )
}
