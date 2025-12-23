import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Lock } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-6">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="mt-4 text-muted-foreground">Last updated: January 1, 2025</p>
          </div>

          {/* Content */}
          <div className="glass-panel rounded-xl border border-primary/20 p-8 prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information necessary to provide our services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Account information (email, username)</li>
                <li>Payment information (processed by Stripe)</li>
                <li>Hardware identifiers for license management</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Your information is used to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate updates and support</li>
                <li>Improve our products and services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data. Payment information is processed
                through Stripe and never stored on our servers. All communications are encrypted using SSL/TLS.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use trusted third-party services including Stripe for payments and analytics providers. These
                services have their own privacy policies governing data use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. You may
                request data deletion by contacting our support team.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related inquiries, contact us at privacy@warpcheats.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
