import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCheckoutSessionStatus, getPaymentIntentStatus } from "@/app/actions/stripe"
import { CheckCircle, XCircle, Clock, ArrowRight, Mail, Download, Copy, AlertTriangle } from "lucide-react"
import { getOrderByPaymentIntent, getOrderByCheckoutSession, getOrderWithDetails } from "@/lib/db/orders"
import { OrderCompletionHandler } from "@/components/order-completion-handler"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; payment_intent?: string; cardsetup_order?: string }>
}) {
  const { session_id, payment_intent, cardsetup_order } = await searchParams

  if (cardsetup_order) {
    const orderDetails = await getOrderWithDetails(cardsetup_order)

    if (!orderDetails) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-16">
            <div className="mx-auto max-w-lg px-6 lg:px-8">
              <Card className="glass-panel border-primary/20 text-center">
                <CardContent className="pt-8 pb-8">
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
                  <p className="text-muted-foreground mb-6">We couldn't find your order. Please contact support.</p>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      )
    }

    const isPaid = orderDetails.status === "paid"
    const hasLicenseKey = orderDetails.license_key?.license_key

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-lg px-6 lg:px-8">
            <Card className="glass-panel border-primary/20">
              <CardHeader className="text-center pb-4">
                {isPaid ? (
                  <>
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">Payment Successful!</CardTitle>
                    <p className="text-muted-foreground mt-2">Thank you for your purchase</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="h-10 w-10 text-yellow-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">Payment Processing</CardTitle>
                    <p className="text-muted-foreground mt-2">Your payment is being verified</p>
                  </>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Details */}
                <div className="glass-panel rounded-lg p-4 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Number</span>
                      <span className="font-mono text-foreground">{orderDetails.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product</span>
                      <span className="text-foreground">{orderDetails.product?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="text-foreground">{orderDetails.variant?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-green-400 font-semibold">
                        ${(orderDetails.amount_cents / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="text-foreground">Card Setup</span>
                    </div>
                  </div>
                </div>

                {/* Get License Key via Discord */}
                <div className="glass-panel rounded-lg p-6 border border-primary/30 bg-primary/5 text-center">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Get Your License Key</h3>
                  <p className="text-muted-foreground mb-4">
                    Open a ticket in our Discord server to receive your license key
                  </p>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 mb-3">
                    <a href="https://discord.gg/warpcheats" target="_blank" rel="noopener noreferrer">
                      Open Discord Ticket
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your order number: <span className="font-mono text-primary font-bold">{orderDetails.order_number}</span>
                  </p>
                </div>

                {isPaid && (
                  <>
                    <div className="glass-panel rounded-lg p-4 border border-green-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">Check Your Email</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your license key and download instructions have been sent to{" "}
                        <span className="text-foreground font-medium">{orderDetails.customer_email}</span>
                      </p>
                    </div>

                    <div className="glass-panel rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Download className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">Next Steps</span>
                      </div>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Download the loader from the provided link</li>
                        <li>Run the loader and enter your license key</li>
                        <li>Follow the in-app setup instructions</li>
                        <li>Enjoy your premium features!</li>
                      </ol>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/products">
                      Continue Shopping
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent border-primary/30">
                    <Link href="https://discord.gg/warpcheats">Need Help? Join Discord</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ... existing code for PaymentIntent and Checkout Session handling ...
  // Handle PaymentIntent-based checkout (new flow)
  if (payment_intent) {
    const status = await getPaymentIntentStatus(payment_intent)
    const order = await getOrderByPaymentIntent(payment_intent)
    const orderDetails = order ? await getOrderWithDetails(order.id) : null

    const isPaid = status.status === "succeeded"
    const isPending = status.status === "processing" || status.status === "requires_action"

    const hasLicenseKey = orderDetails?.license_key?.license_key

    return (
      <div className="min-h-screen bg-background">
        <OrderCompletionHandler />
        <Header />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-lg px-6 lg:px-8">
            <Card className="glass-panel border-primary/20">
              <CardHeader className="text-center pb-4">
                {isPaid ? (
                  <>
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">Payment Successful!</CardTitle>
                    <p className="text-muted-foreground mt-2">Thank you for your purchase</p>
                  </>
                ) : isPending ? (
                  <>
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="h-10 w-10 text-yellow-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">Payment Processing</CardTitle>
                    <p className="text-muted-foreground mt-2">Your payment is being processed</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">Payment Failed</CardTitle>
                    <p className="text-muted-foreground mt-2">Something went wrong with your payment</p>
                  </>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {isPaid && orderDetails && (
                  <>
                    {/* Order Details */}
                    <div className="glass-panel rounded-lg p-4 border border-primary/20">
                      <h3 className="font-semibold text-foreground mb-3">Order Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order Number</span>
                          <span className="font-mono text-foreground">{orderDetails.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product</span>
                          <span className="text-foreground">{orderDetails.product?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="text-foreground">{orderDetails.variant?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="text-green-400 font-semibold">
                            ${(orderDetails.amount_cents / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Get License Key via Discord */}
                    <div className="glass-panel rounded-lg p-6 border border-primary/30 bg-primary/5 text-center">
                      <h3 className="font-semibold text-foreground mb-3 text-lg">Get Your License Key</h3>
                      <p className="text-muted-foreground mb-4">
                        Open a ticket in our Discord server to receive your license key
                      </p>
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 mb-3">
                        <a href="https://discord.gg/warpcheats" target="_blank" rel="noopener noreferrer">
                          Open Discord Ticket
                        </a>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Your order number: <span className="font-mono text-primary font-bold">{orderDetails.order_number}</span>
                      </p>
                    </div>

                    <div className="glass-panel rounded-lg p-4 border border-green-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">Check Your Email</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order confirmation has been sent to{" "}
                        <span className="text-foreground font-medium">{status.customerEmail}</span>
                      </p>
                    </div>

                    <div className="glass-panel rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Download className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">Next Steps</span>
                      </div>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Join our Discord server using the button above</li>
                        <li>Open a ticket with your order number</li>
                        <li>Our team will provide your license key within minutes</li>
                        <li>Download the loader and activate your product</li>
                      </ol>
                    </div>
                  </>
                )}

                {isPending && (
                  <div className="glass-panel rounded-lg p-4 border border-yellow-500/20">
                    <p className="text-sm text-muted-foreground">
                      Your payment is being processed. You will receive an email with your license key once the payment
                      is confirmed.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/products">
                      Continue Shopping
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent border-primary/30">
                    <Link href="https://discord.gg/warpcheats">Need Help? Join Discord</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Handle Checkout Session-based checkout (legacy flow)
  if (!session_id) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-lg px-6 lg:px-8">
            <Card className="glass-panel border-primary/20 text-center">
              <CardContent className="pt-8 pb-8">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Session</h1>
                <p className="text-muted-foreground mb-6">No payment information found. Please try again.</p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/products">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const session = await getCheckoutSessionStatus(session_id)
  const order = await getOrderByCheckoutSession(session_id)
  const orderDetails = order ? await getOrderWithDetails(order.id) : null

  const isPaid = session.paymentStatus === "paid"
  const isPending = session.status === "open"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-lg px-6 lg:px-8">
          <Card className="glass-panel border-primary/20">
            <CardHeader className="text-center pb-4">
              {isPaid ? (
                <>
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">Payment Successful!</CardTitle>
                  <p className="text-muted-foreground mt-2">Thank you for your purchase</p>
                </>
              ) : isPending ? (
                <>
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="h-10 w-10 text-yellow-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">Payment Pending</CardTitle>
                  <p className="text-muted-foreground mt-2">Your payment is being processed</p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">Payment Failed</CardTitle>
                  <p className="text-muted-foreground mt-2">Something went wrong with your payment</p>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isPaid && orderDetails && (
                <>
                  {/* Order Details */}
                  <div className="glass-panel rounded-lg p-4 border border-primary/20">
                    <h3 className="font-semibold text-foreground mb-3">Order Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Number</span>
                        <span className="font-mono text-foreground">{orderDetails.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product</span>
                        <span className="text-foreground">{orderDetails.product?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="text-foreground">{orderDetails.variant?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="text-green-400 font-semibold">
                          ${(orderDetails.amount_cents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Get License Key via Discord */}
                  <div className="glass-panel rounded-lg p-6 border border-primary/30 bg-primary/5 text-center">
                    <h3 className="font-semibold text-foreground mb-3 text-lg">Get Your License Key</h3>
                    <p className="text-muted-foreground mb-4">
                      Open a ticket in our Discord server to receive your license key
                    </p>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 mb-3">
                      <a href="https://discord.gg/warpcheats" target="_blank" rel="noopener noreferrer">
                        Open Discord Ticket
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Your order number: <span className="font-mono text-primary font-bold">{orderDetails.order_number}</span>
                    </p>
                  </div>

                  <div className="glass-panel rounded-lg p-4 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Check Your Email</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order confirmation has been sent to{" "}
                      <span className="text-foreground font-medium">{session.customerEmail}</span>
                    </p>
                  </div>

                  <div className="glass-panel rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Next Steps</span>
                    </div>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Join our Discord server using the button above</li>
                      <li>Open a ticket with your order number</li>
                      <li>Our team will provide your license key within minutes</li>
                      <li>Download the loader and activate your product</li>
                    </ol>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href="/products">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent border-primary/30">
                  <Link href="https://discord.gg/warpcheats">Need Help? Join Discord</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

