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

function versionToFormValues(version) {
  return {
    doseGrams: String(version.doseGrams),
    waterGrams: String(version.waterGrams),
    grindSize: version.grindSize,
    waterTempC: String(version.waterTempC),
    brewTimeSeconds: String(version.brewTimeSeconds),
    yieldGrams: String(version.yieldGrams),
    rating: String(version.rating),
    tastingNotes: version.tastingNotes,
  };
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function App() {
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [newVersionRecipeId, setNewVersionRecipeId] = useState(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

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
    setIsCreateFormOpen(false);
  }

  function handleSaveNewVersion(recipeId, formData) {
    const newVersion = {
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
    };

    setRecipes(
      recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        return { ...recipe, versions: [...recipe.versions, newVersion] };
      }),
    );
    setNewVersionRecipeId(null);
  }

  return (
    <main className="app">
      <h1>Brew It</h1>
      <p>
        Your personal journal for saving and perfecting coffee brewing recipes.
      </p>

      {isCreateFormOpen ? (
        <RecipeForm
          title="Create Recipe"
          submitLabel="Save Recipe"
          initialValues={emptyForm}
          onSave={handleCreateRecipe}
          onCancel={() => setIsCreateFormOpen(false)}
        />
      ) : (
        <button type="button" onClick={() => setIsCreateFormOpen(true)}>
          + Create Recipe
        </button>
      )}

      <section className="recipe-list">
        {recipes.map((recipe) => {
          const latestVersion = recipe.versions[recipe.versions.length - 1];
          const previousVersions = recipe.versions.slice(0, -1).reverse();

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
              {newVersionRecipeId === recipe.id ? (
                <RecipeForm
                  title="New Version"
                  submitLabel="Save Version"
                  initialValues={versionToFormValues(latestVersion)}
                  onSave={(formData) =>
                    handleSaveNewVersion(recipe.id, formData)
                  }
                  onCancel={() => setNewVersionRecipeId(null)}
                  showRecipeFields={false}
                />
              ) : (
                <div className="card-actions">
                  <button
                    type="button"
                    onClick={() => setNewVersionRecipeId(recipe.id)}
                  >
                    New Version
                  </button>
                  <button type="button" onClick={() => handleDelete(recipe.id)}>
                    Delete
                  </button>
                </div>
              )}
              <details className="version-history">
                <summary>Version History ({previousVersions.length})</summary>
                {previousVersions.map((version, index) => (
                  <div key={version.id} className="version-entry">
                    <h3>Version {previousVersions.length - index}</h3>
                    <p>
                      <strong>Date:</strong> {formatDate(version.createdAt)}
                    </p>
                    <p>
                      <strong>Dose:</strong> {version.doseGrams} g
                    </p>
                    <p>
                      <strong>Water:</strong> {version.waterGrams} g
                    </p>
                    <p>
                      <strong>Grind size:</strong> {version.grindSize}
                    </p>
                    <p>
                      <strong>Temperature:</strong> {version.waterTempC} °C
                    </p>
                    <p>
                      <strong>Brew time:</strong> {version.brewTimeSeconds}{" "}
                      seconds
                    </p>
                    <p>
                      <strong>Yield:</strong> {version.yieldGrams} g
                    </p>
                    <p>
                      <strong>Rating:</strong> {version.rating} / 5
                    </p>
                    <p>
                      <strong>Tasting notes:</strong> {version.tastingNotes}
                    </p>
                  </div>
                ))}
              </details>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default App;
