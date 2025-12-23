"use client"

import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "xShadow",
    game: "Valorant",
    rating: 5,
    content:
      "Best Valorant software I've ever used. Been using it for 6 months, never detected. The aimbot smoothness is incredible.",
    avatar: "S",
  },
  {
    name: "PhantomGG",
    game: "Fortnite",
    rating: 5,
    content:
      "The silent aim feature is unreal. Support team helped me set everything up in minutes. Worth every penny.",
    avatar: "P",
  },
  {
    name: "DeadlyAce",
    game: "Warzone",
    rating: 5,
    content: "Finally a Warzone cheat that actually works. HWID spoofer saved me twice already. Great product.",
    avatar: "D",
  },
  {
    name: "NightHawk",
    game: "CS2",
    rating: 5,
    content: "Legit config is perfect for ranked games. Been ranking up consistently without any issues.",
    avatar: "N",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by <span className="gradient-text glow-text">Elite Players</span>
          </h2>
          <p className="mt-2 text-muted-foreground">Join thousands of satisfied customers worldwide</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="glass-panel border-primary/20 hover-lift card-shine animate-reveal-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">{testimonial.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold border border-primary/30">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.game}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
