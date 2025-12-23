import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight, Star, CheckCircle } from "lucide-react"
import type { Product } from "@/lib/database.types"

const statusColors = {
  undetected: "bg-green-500/20 text-green-400 border-green-500/30",
  updating: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  down: "bg-red-500/20 text-red-400 border-red-500/30",
  testing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

const statusText = {
  undetected: "Undetected",
  updating: "Updating",
  down: "Down",
  testing: "Testing",
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="glass-panel border-primary/20 overflow-hidden group hover-lift card-shine">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.image_url || "/placeholder.svg?height=200&width=400&query=gaming+software"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        {product.popular && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/90 text-primary-foreground border-0 flex items-center gap-1 animate-pulse-glow">
              <Star className="h-3 w-3 fill-current" />
              Popular
            </Badge>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusColors[product.status]} border backdrop-blur-sm`}>
            {statusText[product.status]}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.game}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
        <div className="flex flex-wrap gap-2">
          {product.features.slice(0, 3).map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-1 text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full"
            >
              <CheckCircle className="h-3 w-3 text-primary" />
              {feature}
            </div>
          ))}
          {product.features.length > 3 && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              +{product.features.length - 3} more
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn btn-glow">
          <Link href={`/products/${product.slug}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
