"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Settings, CreditCard, Shield, Bell, Key, Loader2, CheckCircle2 } from "lucide-react"
import {
  getSettings,
  updatePaymentProvider,
  updateCardSetupStoreUrl,
  updateMaintenanceMode,
} from "@/app/actions/settings"
import type { PaymentProvider } from "@/lib/db/settings"

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("stripe")
  const [cardSetupStoreUrl, setCardSetupStoreUrl] = useState("https://valor.com")
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const settings = await getSettings()
      setPaymentProvider(settings.payment_provider)
      setCardSetupStoreUrl(settings.cardsetup_store_url)
      setMaintenanceMode(settings.maintenance_mode)
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePaymentProviderChange(value: PaymentProvider) {
    setPaymentProvider(value)
    setIsSaving(true)
    try {
      await updatePaymentProvider(value)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Failed to update payment provider:", error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCardSetupUrlSave() {
    setIsSaving(true)
    try {
      await updateCardSetupStoreUrl(cardSetupStoreUrl)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Failed to update Card Setup URL:", error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleMaintenanceModeChange(enabled: boolean) {
    setMaintenanceMode(enabled)
    try {
      await updateMaintenanceMode(enabled)
    } catch (error) {
      console.error("Failed to update maintenance mode:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your platform settings</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            <span>Settings saved</span>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Payment Settings */}
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Settings
            </CardTitle>
            <CardDescription>Choose your payment provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Provider Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Payment Provider</Label>
              <RadioGroup
                value={paymentProvider}
                onValueChange={(value) => handlePaymentProviderChange(value as PaymentProvider)}
                className="grid gap-4"
              >
                {/* Stripe Option */}
                <div className="flex items-center space-x-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#635BFF] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                      </div>
                      <div>
                        <p className="font-semibold">Stripe</p>
                        <p className="text-sm text-muted-foreground">Accept cards, Apple Pay, Google Pay</p>
                      </div>
                    </div>
                  </Label>
                  {paymentProvider === "stripe" && <div className="h-2 w-2 rounded-full bg-green-500" />}
                </div>

                {/* Card Setup Option */}
                <div className="flex items-center space-x-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="cardsetup" id="cardsetup" />
                  <Label htmlFor="cardsetup" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Card Setup</p>
                        <p className="text-sm text-muted-foreground">Alternative payment gateway</p>
                      </div>
                    </div>
                  </Label>
                  {paymentProvider === "cardsetup" && <div className="h-2 w-2 rounded-full bg-green-500" />}
                </div>

                {/* Both Option */}
                <div className="flex items-center space-x-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">2x</span>
                      </div>
                      <div>
                        <p className="font-semibold">Both Providers</p>
                        <p className="text-sm text-muted-foreground">Let customers choose their payment method</p>
                      </div>
                    </div>
                  </Label>
                  {paymentProvider === "both" && <div className="h-2 w-2 rounded-full bg-green-500" />}
                </div>
              </RadioGroup>
            </div>

            <Separator className="bg-border" />

            {/* Stripe Status */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-400">Stripe Connected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your Stripe account is connected and accepting payments
              </p>
            </div>

            {/* Card Setup Settings */}
            {(paymentProvider === "cardsetup" || paymentProvider === "both") && (
              <>
                <Separator className="bg-border" />
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Card Setup Configuration</Label>
                  <div className="space-y-2">
                    <Label>Store URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={cardSetupStoreUrl}
                        onChange={(e) => setCardSetupStoreUrl(e.target.value)}
                        placeholder="https://yourstore.com"
                        className="bg-input border-border"
                      />
                      <Button
                        onClick={handleCardSetupUrlSave}
                        disabled={isSaving}
                        variant="outline"
                        className="border-primary/30 bg-transparent"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">This URL must be registered with Card Setup</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5 text-primary" />
              General Settings
            </CardTitle>
            <CardDescription>Configure basic site settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input defaultValue="Valor" className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input defaultValue="https://valor.com" className="bg-input border-border" />
              </div>
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable site access</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={handleMaintenanceModeChange} />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Security and access settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <Label>Admin Password</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="Enter new password" className="bg-input border-border" />
                <Button variant="outline" className="border-primary/30 bg-transparent">
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Order Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified on new orders</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Discord Notifications</Label>
                <p className="text-sm text-muted-foreground">Send order alerts to Discord</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5 text-primary" />
              Environment Variables
            </CardTitle>
            <CardDescription>Required API keys and secrets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="font-medium text-foreground mb-2">Required for Card Setup:</p>
              <code className="text-xs text-muted-foreground font-mono block">
                CARDSETUP_STORE_URL=https://valor.com
              </code>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="font-medium text-foreground mb-2">Required for Stripe:</p>
              <code className="text-xs text-muted-foreground font-mono block">
                STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

