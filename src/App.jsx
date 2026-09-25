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

function App() {
  const [recipes] = useState(sampleRecipes)

  return (
    <main className="app">
      <h1>Brew It</h1>
      <p>Your personal journal for saving and perfecting coffee brewing recipes.</p>

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
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
