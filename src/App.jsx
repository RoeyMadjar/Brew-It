import { useEffect, useState } from "react";
import RecipeForm from "./components/RecipeForm.jsx";
import VersionDetails from "./components/VersionDetails.jsx";
import VersionSummary from "./components/VersionSummary.jsx";
import { secondsToMinutes } from "./utils/format.js";
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
        rating: 8,
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
  brewTime: "",
  brewTimeUnit: "seconds",
  yieldGrams: "",
  rating: "",
  tastingNotes: "",
};

function formToBrewTimeSeconds(formData) {
  const multiplier = formData.brewTimeUnit === "minutes" ? 60 : 1;
  return Math.round(Number(formData.brewTime) * multiplier);
}

function versionToFormValues(version) {
  const brewTimeUnit = version.brewTimeUnit ?? "seconds";

  return {
    doseGrams: String(version.doseGrams),
    waterGrams: String(version.waterGrams),
    grindSize: version.grindSize,
    waterTempC: String(version.waterTempC),
    brewTime:
      brewTimeUnit === "minutes"
        ? String(secondsToMinutes(version.brewTimeSeconds))
        : String(version.brewTimeSeconds),
    brewTimeUnit,
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

const STORAGE_KEY = "brew-it-recipes";

function loadRecipes() {
  try {
    const savedRecipes = localStorage.getItem(STORAGE_KEY);
    if (savedRecipes === null) {
      return sampleRecipes;
    }
    return JSON.parse(savedRecipes);
  } catch {
    return sampleRecipes;
  }
}

function App() {
  const [recipes, setRecipes] = useState(loadRecipes);
  const [newVersionRecipeId, setNewVersionRecipeId] = useState(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [expandedVersionId, setExpandedVersionId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  function handleDelete(idToDelete) {
    if (!window.confirm("Delete this recipe? This can't be undone.")) {
      return;
    }

    setRecipes(recipes.filter((recipe) => recipe.id !== idToDelete));
  }

  function handleDeleteVersion(recipeId, versionId) {
    if (!window.confirm("Delete this version? This can't be undone.")) {
      return;
    }

    setRecipes(
      recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        return {
          ...recipe,
          versions: recipe.versions.filter(
            (version) => version.id !== versionId,
          ),
        };
      }),
    );

    if (expandedVersionId === versionId) {
      setExpandedVersionId(null);
    }
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
          brewTimeSeconds: formToBrewTimeSeconds(formData),
          brewTimeUnit: formData.brewTimeUnit,
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
      brewTimeSeconds: formToBrewTimeSeconds(formData),
      brewTimeUnit: formData.brewTimeUnit,
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
          showBrewTimeUnit
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
          const isExpanded = expandedRecipeId === recipe.id;

          return (
            <article key={recipe.id} className="recipe-card">
              <h2>{recipe.name}</h2>
              <p>{formatDate(latestVersion.createdAt)}</p>
              <p>
                <strong>Bean:</strong> {recipe.bean}
              </p>
              <p>
                <strong>Method:</strong> {recipe.method}
              </p>
              {isExpanded ? (
                <VersionDetails version={latestVersion} />
              ) : (
                <VersionSummary version={latestVersion} />
              )}
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
                    onClick={() =>
                      setExpandedRecipeId(isExpanded ? null : recipe.id)
                    }
                  >
                    {isExpanded ? "Hide Recipe" : "View Recipe"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVersionRecipeId(recipe.id)}
                  >
                    New Version
                  </button>
                  <button type="button">Edit</button>
                  <button type="button" onClick={() => handleDelete(recipe.id)}>
                    Delete
                  </button>
                </div>
              )}
              <details className="version-history">
                <summary>Version History ({previousVersions.length})</summary>
                {previousVersions.map((version, index) => {
                  const isVersionExpanded = expandedVersionId === version.id;

                  return (
                    <div key={version.id} className="version-entry">
                      <h3>Version {previousVersions.length - index}</h3>
                      <p>{formatDate(version.createdAt)}</p>
                      {isVersionExpanded ? (
                        <VersionDetails version={version} />
                      ) : (
                        <VersionSummary version={version} />
                      )}
                      <div className="version-actions">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedVersionId(
                              isVersionExpanded ? null : version.id,
                            )
                          }
                        >
                          {isVersionExpanded ? "Hide Version" : "View Version"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteVersion(recipe.id, version.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </details>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default App;
