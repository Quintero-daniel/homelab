export interface Ingredient {
  id: string
  name: string
}

export interface RecipeIngredient {
  id: string
  ingredient: Ingredient
  quantity: number | null
  unit: string | null
  notes: string | null
}

export interface NutritionalFactor {
  id: string
  name: string
}

export interface RecipeNutritionalFactor {
  id: string
  nutritionalFactor: NutritionalFactor
  amount: number
  unit: string
}

export interface Direction {
  id: string
  stepNumber: number
  description: string
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  rating: number | null
  pictureUrl: string | null
  ingredients: RecipeIngredient[]
  nutritionalFactors: RecipeNutritionalFactor[]
  directions: Direction[]
}

const BASE_URL = '/api/recipes'

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(BASE_URL)
  if (!response.ok) throw new Error('Failed to fetch recipes')
  return response.json()
}

export async function getRecipeById(id: string): Promise<Recipe> {
  const response = await fetch(`${BASE_URL}/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch recipe ${id}`)
  return response.json()
}

export async function deleteRecipe(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(`Failed to delete recipe ${id}`)
}

export async function createRecipe(recipe: Recipe): Promise<Recipe> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!response.ok) throw new Error('Failed to create recipe')
  return response.json()
}

export async function updateRecipe(id: string, recipe: Recipe): Promise<Recipe> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!response.ok) throw new Error(`Failed to update recipe ${id}`)
  return response.json()
}
