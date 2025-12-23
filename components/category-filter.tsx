"use client"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          "border",
          selectedCategory === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "border",
            selectedCategory === category
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
