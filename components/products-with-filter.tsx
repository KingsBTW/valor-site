"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CategoryFilter } from "@/components/category-filter"
import { ProductCard } from "@/components/product-card"
import type { Product, ProductVariant } from "@/lib/database.types"

interface ProductWithVariants extends Product {
  product_variants?: ProductVariant[]
}

interface ProductsWithFilterProps {
  products: ProductWithVariants[]
  categories: string[]
}

export function ProductsWithFilter({ products, categories }: ProductsWithFilterProps) {
  const searchParams = useSearchParams()
  const gameParam = searchParams.get("game")
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(gameParam)

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (gameParam) {
      setSelectedCategory(gameParam)
    }
  }, [gameParam])

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter(
      (product) =>
        product.game?.toLowerCase() === selectedCategory.toLowerCase() ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase(),
    )
  }, [products, selectedCategory])

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wider font-medium">Select Your Game</p>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
