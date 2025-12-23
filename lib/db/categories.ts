import { createClient } from "@/lib/supabase/server"

export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  active: boolean
  created_at: string
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("sort_order")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*").order("sort_order")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export async function getUniqueGamesFromProducts(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("game").order("game")

  if (error) {
    console.error("Error fetching games:", error)
    return []
  }

  // Get unique games
  const uniqueGames = [...new Set(data?.map((p) => p.game).filter(Boolean) || [])]
  return uniqueGames
}

export async function createCategory(name: string): Promise<Category | null> {
  const supabase = await createClient()

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

  // Get max sort_order
  const { data: maxOrder } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      sort_order: nextOrder,
      active: true,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    return null
  }

  return data
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("categories").update(data).eq("id", id)

  if (error) {
    console.error("Error updating category:", error)
    return false
  }

  return true
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    return false
  }

  return true
}

export async function reorderCategories(orderedIds: string[]): Promise<boolean> {
  const supabase = await createClient()

  // Update each category with its new sort_order
  const updates = orderedIds.map((id, index) => supabase.from("categories").update({ sort_order: index }).eq("id", id))

  const results = await Promise.all(updates)
  const hasError = results.some((r) => r.error)

  if (hasError) {
    console.error("Error reordering categories")
    return false
  }

  return true
}
