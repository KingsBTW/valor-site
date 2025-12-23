import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RefreshCcw } from "lucide-react"

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-6">
              <RefreshCcw className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Refund <span className="gradient-text">Policy</span>
            </h1>
            <p className="mt-4 text-muted-foreground">Last updated: January 1, 2025</p>
          </div>

          {/* Content */}
          <div className="glass-panel rounded-xl border border-primary/20 p-8 prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Refund Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We offer refunds under the following conditions:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Request made within 24 hours of purchase</li>
                <li>Product has not been downloaded or accessed</li>
                <li>No license key has been generated or used</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Non-Refundable Situations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Refunds will not be issued if:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>The product has been downloaded or used</li>
                <li>More than 24 hours have passed since purchase</li>
                <li>You received a game ban (use is at your own risk)</li>
                <li>Product is working as intended but does not meet expectations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">How to Request a Refund</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">To request a refund:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>Contact our support team within 24 hours</li>
                <li>Provide your order ID and email address</li>
                <li>Explain the reason for your refund request</li>
                <li>Wait for confirmation (typically within 2-4 hours)</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Processing Time</h2>
              <p className="text-muted-foreground leading-relaxed">
                Approved refunds are processed within 5-10 business days. The funds will be returned to your original
                payment method through Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For refund requests, contact billing@warpcheats.com with your order details.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
