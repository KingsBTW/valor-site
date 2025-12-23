"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, GripVertical, Gamepad2, Trash2, ArrowUp, ArrowDown, Check, X, Pencil } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  reorderCategoriesAction,
} from "@/app/actions/categories"

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  active: boolean
  created_at: string
}

interface CategoriesManagerProps {
  initialCategories: Category[]
  initialGames: string[]
}

export function CategoriesManager({ initialCategories, initialGames }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [games] = useState<string[]>(initialGames)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    if (categories.some((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast.error("This category already exists")
      return
    }

    startTransition(async () => {
      const result = await createCategoryAction(newCategoryName.trim())
      if (result.success && result.category) {
        setCategories([...categories, result.category])
        setNewCategoryName("")
        toast.success("Category created successfully")
      } else {
        toast.error(result.error || "Failed to create category")
      }
    })
  }

  const handleDeleteCategory = (id: string) => {
    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      if (result.success) {
        setCategories(categories.filter((c) => c.id !== id))
        toast.success("Category deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete category")
      }
      setDeleteId(null)
    })
  }

  const handleToggleActive = (id: string, active: boolean) => {
    startTransition(async () => {
      const result = await updateCategoryAction(id, { active })
      if (result.success) {
        setCategories(categories.map((c) => (c.id === id ? { ...c, active } : c)))
        toast.success(active ? "Category enabled" : "Category disabled")
      } else {
        toast.error(result.error || "Failed to update category")
      }
    })
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty")
      return
    }

    startTransition(async () => {
      const result = await updateCategoryAction(id, { name: editingName.trim() })
      if (result.success) {
        setCategories(categories.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c)))
        setEditingId(null)
        setEditingName("")
        toast.success("Category updated successfully")
      } else {
        toast.error(result.error || "Failed to update category")
      }
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return

    const newCategories = [...categories]
    const temp = newCategories[index - 1]
    newCategories[index - 1] = newCategories[index]
    newCategories[index] = temp

    setCategories(newCategories)

    startTransition(async () => {
      const orderedIds = newCategories.map((c) => c.id)
      const result = await reorderCategoriesAction(orderedIds)
      if (!result.success) {
        // Revert on error
        setCategories(categories)
        toast.error("Failed to reorder categories")
      }
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return

    const newCategories = [...categories]
    const temp = newCategories[index + 1]
    newCategories[index + 1] = newCategories[index]
    newCategories[index] = temp

    setCategories(newCategories)

    startTransition(async () => {
      const orderedIds = newCategories.map((c) => c.id)
      const result = await reorderCategoriesAction(orderedIds)
      if (!result.success) {
        // Revert on error
        setCategories(categories)
        toast.error("Failed to reorder categories")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Plus className="h-5 w-5 text-primary" />
            Add New Category
          </CardTitle>
          <CardDescription>Create a new game category for product filtering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter category name (e.g., Fortnite, Valorant)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="bg-input border-border"
              disabled={isPending}
            />
            <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90" disabled={isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">Manage Categories</CardTitle>
          <CardDescription>
            Drag to reorder, toggle visibility, edit or delete categories. Categories appear in the product filter on
            the public products page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories yet. Add your first category above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    category.active ? "bg-card border-primary/30" : "bg-card/50 border-border opacity-60"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isPending}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === categories.length - 1 || isPending}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                  <div className="flex-1">
                    {editingId === category.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-8 bg-input"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(category.id)
                            if (e.key === "Escape") handleCancelEdit()
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-500 hover:text-green-400"
                          onClick={() => handleSaveEdit(category.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-400"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{category.name}</span>
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {category.slug}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{category.active ? "Visible" : "Hidden"}</span>
                      <Switch
                        checked={category.active}
                        onCheckedChange={(checked) => handleToggleActive(category.id, checked)}
                        disabled={isPending}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleStartEdit(category)}
                      disabled={isPending || editingId !== null}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteId(category.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Games from Products */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">Games from Products</CardTitle>
          <CardDescription>
            These are the unique game names currently assigned to your products. Make sure you have matching categories
            for each game.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <p className="text-muted-foreground text-sm">No games found in products.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {games.map((game) => {
                const hasCategory = categories.some((c) => c.name.toLowerCase() === game.toLowerCase())
                return (
                  <Badge
                    key={game}
                    variant="outline"
                    className={`px-3 py-1 ${
                      hasCategory
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    }`}
                  >
                    {game}
                    {hasCategory ? (
                      <Check className="h-3 w-3 ml-1" />
                    ) : (
                      <span className="ml-1 text-xs">(no category)</span>
                    )}
                  </Badge>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Products using this category will not be affected, but they
              won't appear under this filter anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && handleDeleteCategory(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
