import { useState } from "react";
import RecipeForm from "./components/RecipeForm.jsx";
import "./App.css";

const sampleRecipes = [
  {
    id: "recipe-1",
    name: "Morning V60",
    bean: "Ethiopia Yirgacheffe",
    method: "V60",
    versions: [
      {
        id: "version-1",
        createdAt: "2026-09-20T08:00:00.000Z",
        doseGrams: 15,
        waterGrams: 250,
        grindSize: "medium-fine",
        waterTempC: 93,
        brewTimeSeconds: 180,
        yieldGrams: 220,
        rating: 4,
        tastingNotes:
          "Bright and floral, slightly sour. Try a finer grind next time.",
      },
    ],
  },
  {
    id: "recipe-2",
    name: "Strong AeroPress",
    bean: "Colombia Huila",
    method: "AeroPress",
    versions: [
      {
        id: "version-2",
        createdAt: "2026-09-21T09:30:00.000Z",
        doseGrams: 18,
        waterGrams: 220,
        grindSize: "medium",
        waterTempC: 88,
        brewTimeSeconds: 120,
        yieldGrams: 190,
        rating: 5,
        tastingNotes: "Chocolatey and full-bodied. Keep this one.",
      },
    ],
  },
];

const emptyForm = {
  name: "",
  bean: "",
  method: "",
  doseGrams: "",
  waterGrams: "",
  grindSize: "",
  waterTempC: "",
  brewTimeSeconds: "",
  yieldGrams: "",
  rating: "",
  tastingNotes: "",
};

function App() {
  const [recipes, setRecipes] = useState(sampleRecipes);

  function handleDelete(idToDelete) {
    setRecipes(recipes.filter((recipe) => recipe.id !== idToDelete));
  }

  function handleCreateRecipe(formData) {
    const newRecipe = {
      id: crypto.randomUUID(),
      name: formData.name,
      bean: formData.bean,
      method: formData.method,
      versions: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          doseGrams: Number(formData.doseGrams),
          waterGrams: Number(formData.waterGrams),
          grindSize: formData.grindSize,
          waterTempC: Number(formData.waterTempC),
          brewTimeSeconds: Number(formData.brewTimeSeconds),
          yieldGrams: Number(formData.yieldGrams),
          rating: Number(formData.rating),
          tastingNotes: formData.tastingNotes,
        },
      ],
    };

    setRecipes([...recipes, newRecipe]);
  }

  return (
    <main className="app">
      <h1>Brew It</h1>
      <p>
        Your personal journal for saving and perfecting coffee brewing recipes.
      </p>

      <RecipeForm
        title="Create Recipe"
        submitLabel="Save Recipe"
        initialValues={emptyForm}
        onSave={handleCreateRecipe}
      />

      <section className="recipe-list">
        {recipes.map((recipe) => {
          const latestVersion = recipe.versions[recipe.versions.length - 1];

          return (
            <article key={recipe.id} className="recipe-card">
              <h2>{recipe.name}</h2>
              <p>
                <strong>Bean:</strong> {recipe.bean}
              </p>
              <p>
                <strong>Method:</strong> {recipe.method}
              </p>
              <p>
                <strong>Dose:</strong> {latestVersion.doseGrams} g
              </p>
              <p>
                <strong>Water:</strong> {latestVersion.waterGrams} g
              </p>
              <p>
                <strong>Grind size:</strong> {latestVersion.grindSize}
              </p>
              <p>
                <strong>Temperature:</strong> {latestVersion.waterTempC} °C
              </p>
              <p>
                <strong>Brew time:</strong> {latestVersion.brewTimeSeconds}{" "}
                seconds
              </p>
              <p>
                <strong>Yield:</strong> {latestVersion.yieldGrams} g
              </p>
              <p>
                <strong>Rating:</strong> {latestVersion.rating} / 5
              </p>
              <p>
                <strong>Tasting notes:</strong> {latestVersion.tastingNotes}
              </p>
              <button type="button" onClick={() => handleDelete(recipe.id)}>
                Delete
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default App;
