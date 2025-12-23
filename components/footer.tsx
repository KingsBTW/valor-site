import Link from "next/link"
import Image from "next/image"
import { Mail, MessageCircle, ArrowUpRight } from "lucide-react"

const footerLinks = {
  products: [
    { name: "Valorant", href: "/products?game=valorant" },
    { name: "Fortnite", href: "/products?game=fortnite" },
    { name: "Warzone", href: "/products?game=warzone" },
    { name: "CS2", href: "/products?game=cs2" },
  ],
  support: [
    { name: "FAQ", href: "/faq" },
    { name: "Status Page", href: "/status" },
    { name: "Discord Support", href: "https://discord.gg/valorcheats", external: true },
    { name: "Contact", href: "https://discord.gg/valorcheats", external: true },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-primary/20 bg-gradient-to-b from-card/50 to-background">
      {/* Subtle glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="https://i.postimg.cc/rsCspgyJ/image-removebg-preview.png"
                  alt="Valor Logo"
                  width={40}
                  height={40}
                  className="transition-transform group-hover:scale-110"
                />
              </div>
              <span className="text-xl font-bold gradient-text">
                VALOR
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Premium gaming enhancement software. Undetected, reliable, and trusted by thousands of elite players
              worldwide.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://discord.gg/valorcheats"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all hover-glow"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@valor.com"
                className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all hover-glow"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((item) => (
                <li key={item.name}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {item.name}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {item.name}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Valor. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            Payment secured by <span className="text-primary font-medium">Stripe</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


