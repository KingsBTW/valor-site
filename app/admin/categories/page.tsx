import { CategoriesManager } from "@/components/admin/categories-manager"
import { getAllCategoriesAdmin, getUniqueGamesFromProducts } from "@/lib/db/categories"

export default async function AdminCategoriesPage() {
  const [categories, games] = await Promise.all([getAllCategoriesAdmin(), getUniqueGamesFromProducts()])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground">Manage game categories for product filtering</p>
      </div>

      <CategoriesManager initialCategories={categories} initialGames={games} />
    </div>
  )
}
