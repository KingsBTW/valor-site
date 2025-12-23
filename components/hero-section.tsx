"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap, Eye, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] animate-pulse delay-500" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-primary/8 rounded-full blur-[60px] animate-float-slow" />

      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute inset-0 bg-dots-pattern opacity-30" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.08_0.01_0)_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-8 animate-reveal-up hover-glow cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">All products currently undetected</span>
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-reveal-up delay-100">
            <span className="text-foreground">Dominate Every</span>
            <br />
            <span className="gradient-text glow-text-strong animate-text-glow">Game You Play</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-balance animate-reveal-up delay-200">
            Premium gaming enhancement software trusted by over 50,000 elite players. Undetected, feature-rich, and
            backed by 24/7 support.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal-up delay-300">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-border-strong px-8 py-6 text-lg group btn-glow"
            >
              <Link href="/products">
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5 px-8 py-6 text-lg bg-transparent hover-glow"
            >
              <Link href="/status">View Status</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
            {[
              { label: "Active Users", value: "50K+" },
              { label: "Games Supported", value: "15+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Support Response", value: "<1hr" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="glass-panel rounded-xl p-4 border border-primary/20 hover-lift card-shine animate-reveal-scale"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: null, useLogo: true, title: "Undetected", desc: "Kernel-level bypass technology" },
            { icon: Zap, useLogo: false, title: "Instant Access", desc: "Automatic delivery after purchase" },
            { icon: Eye, useLogo: false, title: "Stream Proof", desc: "Hide from OBS & Discord" },
            { icon: Lock, useLogo: false, title: "HWID Spoofer", desc: "Included with all products" },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="glass-panel rounded-xl p-6 border border-primary/20 hover-lift card-shine group animate-reveal-up"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {feature.useLogo ? (
                  <Image
                    src="https://i.postimg.cc/rsCspgyJ/image-removebg-preview.png"
                    alt="Valor"
                    width={32}
                    height={32}
                    className="relative transition-all duration-300 group-hover:scale-110"
                  />
                ) : (
                  feature.icon && (
                    <feature.icon className="relative h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  )
                )}
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

