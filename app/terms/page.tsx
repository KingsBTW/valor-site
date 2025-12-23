import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-6">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="mt-4 text-muted-foreground">Last updated: January 1, 2025</p>
          </div>

          {/* Content */}
          <div className="glass-panel rounded-xl border border-primary/20 p-8 prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Valor, you agree to be bound by these Terms of Service. If you do not
                agree to these terms, you must not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Use of Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our products are provided for educational and entertainment purposes only. You agree to use our services
                at your own risk and accept full responsibility for any consequences.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You must be 18 years or older to use our services</li>
                <li>You are responsible for maintaining account security</li>
                <li>Sharing or reselling products is strictly prohibited</li>
                <li>We reserve the right to terminate accounts for violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Payments & Subscriptions</h2>
              <p className="text-muted-foreground leading-relaxed">
                All payments are processed securely through Stripe. Subscriptions automatically renew unless cancelled
                before the renewal date. You can manage your subscription through your account dashboard.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, software, and materials provided by Valor are protected by intellectual property
                laws. You may not copy, distribute, or reverse engineer our products.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Valor is not liable for any damages resulting from the use of our products, including but not
                limited to game bans, hardware issues, or account suspensions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of our services after
                modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these terms, please contact us at legal@valor.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
