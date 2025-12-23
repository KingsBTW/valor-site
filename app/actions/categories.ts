"use server"

import { revalidatePath } from "next/cache"
import { createCategory, deleteCategory, updateCategory, reorderCategories, type Category } from "@/lib/db/categories"

export async function createCategoryAction(
  name: string,
): Promise<{ success: boolean; category?: Category; error?: string }> {
  try {
    const category = await createCategory(name)

    if (!category) {
      return { success: false, error: "Failed to create category" }
    }

    revalidatePath("/admin/categories")
    revalidatePath("/products")
    return { success: true, category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: "An error occurred while creating the category" }
  }
}

export async function deleteCategoryAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await deleteCategory(id)

    if (!success) {
      return { success: false, error: "Failed to delete category" }
    }

    revalidatePath("/admin/categories")
    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "An error occurred while deleting the category" }
  }
}

export async function updateCategoryAction(
  id: string,
  data: Partial<Category>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await updateCategory(id, data)

    if (!success) {
      return { success: false, error: "Failed to update category" }
    }

    revalidatePath("/admin/categories")
    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Error updating category:", error)
    return { success: false, error: "An error occurred while updating the category" }
  }
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await reorderCategories(orderedIds)

    if (!success) {
      return { success: false, error: "Failed to reorder categories" }
    }

    revalidatePath("/admin/categories")
    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Error reordering categories:", error)
    return { success: false, error: "An error occurred while reordering categories" }
  }
}
