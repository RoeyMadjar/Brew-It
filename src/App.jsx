import { useState } from 'react'
import './App.css'

const sampleRecipes = [
  {
    id: 'recipe-1',
    name: 'Morning V60',
    coffee: 'Ethiopia Yirgacheffe',
    method: 'V60',
    doseGrams: 15,
    waterGrams: 250,
    grindSize: 'medium-fine',
    waterTempC: 93,
    brewTimeSeconds: 180,
    yieldGrams: 220,
    rating: 4,
    tastingNotes: 'Bright and floral, slightly sour. Try a finer grind next time.',
  },
  {
    id: 'recipe-2',
    name: 'Strong AeroPress',
    coffee: 'Colombia Huila',
    method: 'AeroPress',
    doseGrams: 18,
    waterGrams: 220,
    grindSize: 'medium',
    waterTempC: 88,
    brewTimeSeconds: 120,
    yieldGrams: 190,
    rating: 5,
    tastingNotes: 'Chocolatey and full-bodied. Keep this one.',
  },
]

const emptyForm = {
  name: '',
  coffee: '',
  method: '',
  doseGrams: '',
  waterGrams: '',
  grindSize: '',
  waterTempC: '',
  brewTimeSeconds: '',
  yieldGrams: '',
  rating: '',
  tastingNotes: '',
}

function App() {
  const [recipes, setRecipes] = useState(sampleRecipes)
  const [formData, setFormData] = useState(emptyForm)

  function handleDelete(idToDelete) {
    setRecipes(recipes.filter((recipe) => recipe.id !== idToDelete))
  }

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newRecipe = {
      id: crypto.randomUUID(),
      name: formData.name,
      coffee: formData.coffee,
      method: formData.method,
      doseGrams: Number(formData.doseGrams),
      waterGrams: Number(formData.waterGrams),
      grindSize: formData.grindSize,
      waterTempC: Number(formData.waterTempC),
      brewTimeSeconds: Number(formData.brewTimeSeconds),
      yieldGrams: Number(formData.yieldGrams),
      rating: Number(formData.rating),
      tastingNotes: formData.tastingNotes,
    }

    setRecipes([...recipes, newRecipe])
    setFormData(emptyForm)
  }

  return (
    <main className="app">
      <h1>Brew It</h1>
      <p>Your personal journal for saving and perfecting coffee brewing recipes.</p>

      <form className="recipe-form" onSubmit={handleSubmit}>
        <h2>Create Recipe</h2>

        <label>
          Name
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </label>

        <label>
          Coffee
          <input type="text" name="coffee" value={formData.coffee} onChange={handleChange} />
        </label>

        <label>
          Method
          <input type="text" name="method" value={formData.method} onChange={handleChange} />
        </label>

        <label>
          Dose (g)
          <input type="number" name="doseGrams" value={formData.doseGrams} onChange={handleChange} />
        </label>

        <label>
          Water (g)
          <input type="number" name="waterGrams" value={formData.waterGrams} onChange={handleChange} />
        </label>

        <label>
          Grind size
          <input type="text" name="grindSize" value={formData.grindSize} onChange={handleChange} />
        </label>

        <label>
          Temperature (°C)
          <input type="number" name="waterTempC" value={formData.waterTempC} onChange={handleChange} />
        </label>

        <label>
          Brew time (seconds)
          <input type="number" name="brewTimeSeconds" value={formData.brewTimeSeconds} onChange={handleChange} />
        </label>

        <label>
          Yield (g)
          <input type="number" name="yieldGrams" value={formData.yieldGrams} onChange={handleChange} />
        </label>

        <label>
          Rating (1–5)
          <input type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} />
        </label>

        <label>
          Tasting notes
          <textarea name="tastingNotes" value={formData.tastingNotes} onChange={handleChange} />
        </label>

        <button type="submit">Save Recipe</button>
      </form>

      <section className="recipe-list">
        {recipes.map((recipe) => (
          <article key={recipe.id} className="recipe-card">
            <h2>{recipe.name}</h2>
            <p><strong>Coffee:</strong> {recipe.coffee}</p>
            <p><strong>Method:</strong> {recipe.method}</p>
            <p><strong>Dose:</strong> {recipe.doseGrams} g</p>
            <p><strong>Water:</strong> {recipe.waterGrams} g</p>
            <p><strong>Grind size:</strong> {recipe.grindSize}</p>
            <p><strong>Temperature:</strong> {recipe.waterTempC} °C</p>
            <p><strong>Brew time:</strong> {recipe.brewTimeSeconds} seconds</p>
            <p><strong>Yield:</strong> {recipe.yieldGrams} g</p>
            <p><strong>Rating:</strong> {recipe.rating} / 5</p>
            <p><strong>Tasting notes:</strong> {recipe.tastingNotes}</p>
            <button type="button" onClick={() => handleDelete(recipe.id)}>
              Delete
            </button>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
