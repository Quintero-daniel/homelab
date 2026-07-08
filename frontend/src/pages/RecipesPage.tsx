import { useEffect, useRef, useState } from 'react'
import { getRecipes, updateRecipe, deleteRecipe } from '../api/recipeApi'
import type { Recipe } from '../api/recipeApi'
import styles from './RecipesPage.module.css'

// ── Draft types (flat, string-based for form inputs) ──────────────────────────

interface DraftIngredient {
  _key: string
  id: string | null
  ingredientName: string
  quantity: string
  unit: string
  notes: string
}

interface DraftNutrition {
  _key: string
  id: string | null
  factorName: string
  amount: string
  unit: string
}

interface DraftDirection {
  _key: string
  id: string | null
  description: string
}

interface EditDraft {
  name: string
  description: string
  rating: number | null
  ingredients: DraftIngredient[]
  nutritionalFactors: DraftNutrition[]
  directions: DraftDirection[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getNutritionIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('calor') || n.includes('energy') || n.includes('kcal')) return '🔥'
  if (n.includes('protein')) return '🥩'
  if (n.includes('fat') || n.includes('lipid')) return '🫙'
  if (n.includes('carb')) return '🌾'
  if (n.includes('fiber') || n.includes('fibre')) return '🌿'
  if (n.includes('sugar')) return '🍬'
  if (n.includes('sodium') || n.includes('salt')) return '🧂'
  if (n.includes('cholesterol')) return '🫀'
  if (n.includes('vitamin')) return '💊'
  if (n.includes('iron')) return '⚙️'
  if (n.includes('calcium')) return '🦷'
  if (n.includes('water') || n.includes('hydrat')) return '💧'
  if (n.includes('alcohol')) return '🍷'
  return '📊'
}

function formatIngredient(ri: Recipe['ingredients'][0]): string {
  const parts: string[] = []
  if (ri.quantity !== null) parts.push(String(ri.quantity))
  if (ri.unit) parts.push(ri.unit)
  parts.push(ri.ingredient.name)
  if (ri.notes) parts.push(`(${ri.notes})`)
  return parts.join(' ')
}

function buildPayload(recipe: Recipe, draft: EditDraft): Recipe {
  return {
    ...recipe,
    name: draft.name,
    description: draft.description || null,
    rating: draft.rating,
    ingredients: draft.ingredients
      .filter((di) => di.ingredientName.trim() !== '')
      .map((di) => {
        const item: Record<string, unknown> = {
          ingredient: { name: di.ingredientName.trim() },
          quantity: di.quantity !== '' ? parseFloat(di.quantity) : null,
          unit: di.unit || null,
          notes: di.notes || null,
        }
        if (di.id) item.id = di.id
        return item as unknown as Recipe['ingredients'][0]
      }),
    nutritionalFactors: draft.nutritionalFactors
      .filter((dn) => dn.factorName.trim() !== '')
      .map((dn) => {
        const item: Record<string, unknown> = {
          nutritionalFactor: { name: dn.factorName.trim() },
          amount: parseFloat(dn.amount) || 0,
          unit: dn.unit,
        }
      if (dn.id) item.id = dn.id
      return item as unknown as Recipe['nutritionalFactors'][0]
    }),
    directions: draft.directions
      .filter((dd) => dd.description.trim() !== '')
      .map((dd, index) => {
        const item: Record<string, unknown> = {
          stepNumber: index + 1,
          description: dd.description.trim(),
        }
        if (dd.id) item.id = dd.id
        return item as unknown as Recipe['directions'][0]
      }),
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const keyCounter = useRef(0)

  function newKey() {
    return `new-${++keyCounter.current}`
  }

  useEffect(() => {
    getRecipes()
      .then(setRecipes)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleRandomize() {
    if (recipes.length === 0) return
    const random = recipes[Math.floor(Math.random() * recipes.length)]
    setRecipes([random, ...recipes.filter((r) => r.id !== random.id)])
    setExpandedId(random.id)
  }

  function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setEditingId(null)
      setEditDraft(null)
    } else {
      setRecipes((prev) => {
        const selected = prev.find((r) => r.id === id)!
        return [selected, ...prev.filter((r) => r.id !== id)]
      })
      setExpandedId(id)
    }
  }

  function startEdit(recipe: Recipe) {
    setEditingId(recipe.id)
    setEditDraft({
      name: recipe.name,
      description: recipe.description ?? '',
      rating: recipe.rating,
      ingredients: recipe.ingredients.map((ri) => ({
        _key: ri.id,
        id: ri.id,
        ingredientName: ri.ingredient.name,
        quantity: ri.quantity !== null ? String(ri.quantity) : '',
        unit: ri.unit ?? '',
        notes: ri.notes ?? '',
      })),
      nutritionalFactors: recipe.nutritionalFactors.map((nf) => ({
        _key: nf.id,
        id: nf.id,
        factorName: nf.nutritionalFactor.name,
        amount: String(nf.amount),
        unit: nf.unit,
      })),
      directions: [...recipe.directions]
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((d) => ({
          _key: d.id,
          id: d.id,
          description: d.description,
        })),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft(null)
  }

  async function saveEdit(recipe: Recipe) {
    if (!editDraft) return
    const payload = buildPayload(recipe, editDraft)
    try {
      const saved = await updateRecipe(recipe.id, payload)
      setRecipes((prev) => prev.map((r) => (r.id === saved.id ? saved : r)))
      setEditingId(null)
      setEditDraft(null)
    } catch {
      alert('Failed to save changes.')
    }
  }

  async function handleDelete(recipe: Recipe) {
    if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return
    try {
      await deleteRecipe(recipe.id)
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))
      setExpandedId(null)
    } catch {
      alert('Failed to delete recipe.')
    }
  }

  // ── Draft updaters ──────────────────────────────────────────────────────────

  function updateIngredient(key: string, field: keyof DraftIngredient, value: string) {
    setEditDraft((d) =>
      d ? { ...d, ingredients: d.ingredients.map((i) => i._key === key ? { ...i, [field]: value } : i) } : d
    )
  }

  function removeIngredient(key: string) {
    setEditDraft((d) => d ? { ...d, ingredients: d.ingredients.filter((i) => i._key !== key) } : d)
  }

  function addIngredient() {
    setEditDraft((d) =>
      d ? { ...d, ingredients: [...d.ingredients, { _key: newKey(), id: null, ingredientName: '', quantity: '', unit: '', notes: '' }] } : d
    )
  }

  function updateNutrition(key: string, field: keyof DraftNutrition, value: string) {
    setEditDraft((d) =>
      d ? { ...d, nutritionalFactors: d.nutritionalFactors.map((n) => n._key === key ? { ...n, [field]: value } : n) } : d
    )
  }

  function removeNutrition(key: string) {
    setEditDraft((d) => d ? { ...d, nutritionalFactors: d.nutritionalFactors.filter((n) => n._key !== key) } : d)
  }

  function addNutrition() {
    setEditDraft((d) =>
      d ? { ...d, nutritionalFactors: [...d.nutritionalFactors, { _key: newKey(), id: null, factorName: '', amount: '', unit: '' }] } : d
    )
  }

  function updateDirection(key: string, value: string) {
    setEditDraft((d) =>
      d ? { ...d, directions: d.directions.map((dir) => dir._key === key ? { ...dir, description: value } : dir) } : d
    )
  }

  function removeDirection(key: string) {
    setEditDraft((d) => d ? { ...d, directions: d.directions.filter((dir) => dir._key !== key) } : d)
  }

  function addDirection() {
    setEditDraft((d) =>
      d ? { ...d, directions: [...d.directions, { _key: newKey(), id: null, description: '' }] } : d
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.btn} onClick={handleRandomize}>🎲 Randomize Recipe</button>
        <button className={styles.btn}>➕ Add New Recipe</button>
      </div>

      {loading && <p style={{ padding: '16px' }}>Loading...</p>}
      {error && <p style={{ padding: '16px', color: '#ef4444' }}>Error: {error}</p>}

      {!loading && !error && (
        <ul className={styles.list}>
          {recipes.length === 0 ? (
            <li style={{ padding: '16px', color: '#64748b' }}>No recipes yet.</li>
          ) : (
            recipes.map((recipe) => {
              const isOpen = expandedId === recipe.id
              const isEditing = editingId === recipe.id
              return (
                <li key={recipe.id} className={styles.recipeRow}>
                  <div className={styles.recipeHeader} onClick={() => toggleExpand(recipe.id)}>
                    {!isOpen && <span className={styles.recipeName}>{recipe.name}</span>}
                    <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
                  </div>

                  {isOpen && (
                    <div className={styles.recipeDetail}>
                      {isEditing && editDraft ? (
                        <div className={styles.editForm}>

                          {/* ── Basic fields ── */}
                          <div>
                            <p className={styles.fieldLabel}>Name</p>
                            <input
                              className={styles.input}
                              value={editDraft.name}
                              onChange={(e) => setEditDraft((d) => d ? { ...d, name: e.target.value } : d)}
                            />
                          </div>
                          <div>
                            <p className={styles.fieldLabel}>Description</p>
                            <textarea
                              className={styles.textarea}
                              value={editDraft.description}
                              onChange={(e) => setEditDraft((d) => d ? { ...d, description: e.target.value } : d)}
                            />
                          </div>
                          <div>
                            <p className={styles.fieldLabel}>Rating</p>
                            <div className={styles.starsEditable}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={(editDraft.rating ?? 0) >= star ? styles.starEditFilled : styles.starEditEmpty}
                                  onClick={() => setEditDraft((d) => d ? { ...d, rating: star } : d)}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* ── Collections row ── */}
                          <div className={styles.editCollectionsRow}>

                            {/* Nutrition */}
                            <div className={styles.editCollection} style={{ flex: 1 }}>
                              <p className={styles.fieldLabel}>Nutrition</p>
                              {editDraft.nutritionalFactors.map((nf) => (
                                <div key={nf._key} className={styles.editItem}>
                                  <div className={styles.editItemHeader}>
                                    <button className={styles.btnRemove} onClick={() => removeNutrition(nf._key)}>✕</button>
                                  </div>
                                  <label className={styles.editFieldLabel}>Factor name</label>
                                  <input
                                    className={styles.input}
                                    value={nf.factorName}
                                    onChange={(e) => updateNutrition(nf._key, 'factorName', e.target.value)}
                                  />
                                  <label className={styles.editFieldLabel}>Amount</label>
                                  <input
                                    className={styles.input}
                                    value={nf.amount}
                                    onChange={(e) => updateNutrition(nf._key, 'amount', e.target.value)}
                                  />
                                  <label className={styles.editFieldLabel}>Unit</label>
                                  <input
                                    className={styles.input}
                                    value={nf.unit}
                                    onChange={(e) => updateNutrition(nf._key, 'unit', e.target.value)}
                                  />
                                </div>
                              ))}
                              <button className={styles.btnAdd} onClick={addNutrition}>+ Add</button>
                            </div>

                            {/* Ingredients */}
                            <div className={styles.editCollection} style={{ flex: 2 }}>
                              <p className={styles.fieldLabel}>Ingredients</p>
                              {editDraft.ingredients.map((ing) => (
                                <div key={ing._key} className={styles.editItem}>
                                  <div className={styles.editItemHeader}>
                                    <button className={styles.btnRemove} onClick={() => removeIngredient(ing._key)}>✕</button>
                                  </div>
                                  <label className={styles.editFieldLabel}>Ingredient name</label>
                                  <input
                                    className={styles.input}
                                    value={ing.ingredientName}
                                    onChange={(e) => updateIngredient(ing._key, 'ingredientName', e.target.value)}
                                  />
                                  <label className={styles.editFieldLabel}>Quantity</label>
                                  <input
                                    className={styles.input}
                                    value={ing.quantity}
                                    onChange={(e) => updateIngredient(ing._key, 'quantity', e.target.value)}
                                  />
                                  <label className={styles.editFieldLabel}>Unit</label>
                                  <input
                                    className={styles.input}
                                    value={ing.unit}
                                    onChange={(e) => updateIngredient(ing._key, 'unit', e.target.value)}
                                  />
                                  <label className={styles.editFieldLabel}>Notes</label>
                                  <input
                                    className={styles.input}
                                    value={ing.notes}
                                    onChange={(e) => updateIngredient(ing._key, 'notes', e.target.value)}
                                  />
                                </div>
                              ))}
                              <button className={styles.btnAdd} onClick={addIngredient}>+ Add</button>
                            </div>

                            {/* Directions */}
                            <div className={styles.editCollection} style={{ flex: 2 }}>
                              <p className={styles.fieldLabel}>Directions</p>
                              {editDraft.directions.map((dir, index) => (
                                <div key={dir._key} className={styles.editItem}>
                                  <div className={styles.editItemRow}>
                                    <span className={styles.stepNumber}>{index + 1}.</span>
                                    <textarea
                                      className={`${styles.textarea} ${styles.textareaInline}`}
                                      placeholder="Describe this step…"
                                      value={dir.description}
                                      onChange={(e) => updateDirection(dir._key, e.target.value)}
                                    />
                                    <button className={styles.btnRemove} onClick={() => removeDirection(dir._key)}>✕</button>
                                  </div>
                                </div>
                              ))}
                              <button className={styles.btnAdd} onClick={addDirection}>+ Add Step</button>
                            </div>

                          </div>

                          {/* ── Save / Cancel ── */}
                          <div className={styles.editActions}>
                            <button className={styles.btnSave} onClick={() => saveEdit(recipe)}>Save</button>
                            <button className={styles.btnCancel} onClick={cancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.detailActions}>
                            <button className={styles.selectBtn}>✓ Select Recipe</button>
                            <button className={styles.btn} onClick={() => startEdit(recipe)}>✏️ Edit Recipe</button>
                            <button className={styles.btnDelete} onClick={() => handleDelete(recipe)}>🗑️ Delete</button>
                          </div>

                          <div className={styles.titleRow}>
                            <h2 className={styles.recipeTitle}>{recipe.name}</h2>
                            <div className={styles.stars}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={(recipe.rating ?? 0) >= star ? styles.starFilled : styles.starEmpty}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className={styles.infoRow}>
                            <div className={styles.descriptionBox}>
                              <p className={styles.sectionTitle}>Description</p>
                              <p className={styles.descriptionText}>
                                {recipe.description ?? <span className={styles.noIngredients}>No description yet.</span>}
                              </p>
                            </div>
                            {recipe.pictureUrl ? (
                              <img src={recipe.pictureUrl} alt={recipe.name} className={styles.picture} />
                            ) : (
                              <div className={styles.picturePlaceholder}>🍽️</div>
                            )}
                          </div>

                          <div className={styles.bottomRow}>
                            <div className={styles.bottomPanel} style={{ flex: 1 }}>
                              <p className={styles.sectionTitle}>Nutrition</p>
                              {recipe.nutritionalFactors.length === 0 ? (
                                <p className={styles.noIngredients}>No data.</p>
                              ) : (
                                <ul className={styles.nfList}>
                                  {recipe.nutritionalFactors.map((nf) => (
                                    <li key={nf.id} className={styles.nfCard}>
                                      <div className={styles.nfLeft}>
                                        <span className={styles.nfIcon}>{getNutritionIcon(nf.nutritionalFactor.name)}</span>
                                        <span className={styles.nfLabel}>{nf.nutritionalFactor.name}</span>
                                      </div>
                                      <div className={styles.nfDivider} />
                                      <div className={styles.nfRight}>
                                        <span className={styles.nfAmount}>{nf.amount}</span>
                                        <span className={styles.nfUnit}>{nf.unit}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className={styles.bottomPanel} style={{ flex: 2 }}>
                              <p className={styles.sectionTitle}>Ingredients</p>
                              {recipe.ingredients.length === 0 ? (
                                <p className={styles.noIngredients}>No ingredients listed.</p>
                              ) : (
                                <ul className={styles.ingredientList}>
                                  {recipe.ingredients.map((ri) => (
                                    <li key={ri.id} className={styles.ingredientItem}>
                                      {formatIngredient(ri)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className={styles.bottomPanel} style={{ flex: 2 }}>
                              <p className={styles.sectionTitle}>Directions</p>
                              {recipe.directions.length === 0 ? (
                                <p className={styles.noIngredients}>No directions yet.</p>
                              ) : (
                                <ol className={styles.directionList}>
                                  {[...recipe.directions]
                                    .sort((a, b) => a.stepNumber - b.stepNumber)
                                    .map((dir) => (
                                      <li key={dir.id} className={styles.directionItem}>
                                        {dir.description}
                                      </li>
                                    ))}
                                </ol>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}

export default RecipesPage
