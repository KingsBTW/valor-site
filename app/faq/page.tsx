import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How do I receive my product after purchase?",
    answer:
      "After completing your purchase through Stripe, you will receive an email with download links and activation instructions within minutes. You can also access your purchases through your account dashboard.",
  },
  {
    question: "Are your products undetected?",
    answer:
      "Yes, all our products use advanced kernel-level bypass technology. We monitor anti-cheat updates 24/7 and update our software immediately when needed. Check our status page for real-time detection status.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, and select digital payment methods through our secure Stripe payment processor. All transactions are encrypted and PCI compliant.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer refunds within 24 hours of purchase if you have not downloaded or used the product. Once the product has been accessed, refunds are not available due to the digital nature of our products.",
  },
  {
    question: "Is there a HWID spoofer included?",
    answer:
      "Yes! All our products include a free HWID spoofer to protect your hardware identity. This is automatically included with every purchase at no additional cost.",
  },
  {
    question: "How often are products updated?",
    answer:
      "We update our products within 24-48 hours of any game or anti-cheat update. Critical security updates are deployed immediately. Check our status page for the latest update information.",
  },
  {
    question: "What are the system requirements?",
    answer:
      "Our products work on Windows 10 and Windows 11 (64-bit). You need a stable internet connection for loader authentication. Specific game requirements vary by product.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team through our Discord server for immediate assistance, or submit a ticket through our support page. We typically respond within 1 hour during business hours.",
  },
  {
    question: "Can I use multiple products on the same account?",
    answer:
      "Yes! Your account supports multiple products. Each product subscription is separate and can be managed independently through your dashboard.",
  },
  {
    question: "Is streaming safe with your products?",
    answer:
      "Yes, all our products include a stream-proof mode that hides the overlay from OBS, Discord, and other streaming/recording software. You can safely stream while using our products.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-6">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Help Center</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions about our products and services
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="glass-panel rounded-xl border border-primary/20 p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-primary/10">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center glass-panel rounded-xl border border-primary/20 p-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">Our support team is available 24/7 to help you</p>
            <a
              href="/support"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
