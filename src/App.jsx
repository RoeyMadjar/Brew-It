import { useEffect, useState } from "react";
import RecipeEditForm from "./components/RecipeEditForm.jsx";
import RecipeForm from "./components/RecipeForm.jsx";
import VersionDetails from "./components/VersionDetails.jsx";
import VersionSummary from "./components/VersionSummary.jsx";
import { formatDate } from "./utils/format.js";
import {
  formToVersionFields,
  versionToFormValues,
} from "./utils/versionForm.js";
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
  // Only one form is open at a time: null, or { type, recipeId?, versionId? }.
  const [activeForm, setActiveForm] = useState(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [expandedVersionId, setExpandedVersionId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  // Only one edit at a time: while one is open, other actions just remind
  // the user to finish it. Returns true when the action should stop.
  function blockIfEditing() {
    if (
      activeForm?.type !== "editRecipe" &&
      activeForm?.type !== "editVersion"
    ) {
      return false;
    }
    const editedRecipe = recipes.find(
      (recipe) => recipe.id === activeForm.recipeId,
    );
    window.alert(`Save changes in ${editedRecipe.name}?`);
    return true;
  }

  function openForm(form) {
    if (blockIfEditing()) {
      return;
    }
    setActiveForm(form);
  }

  // Edit always shows the expanded card; wasExpanded lets Cancel undo that.
  function handleStartRecipeEdit(recipeId, isExpanded) {
    if (blockIfEditing()) {
      return;
    }
    setActiveForm({ type: "editRecipe", recipeId, wasExpanded: isExpanded });
    setExpandedRecipeId(recipeId);
  }

  // Only collapse if this card is still the expanded one (another card may
  // have been opened while editing).
  function handleCancelRecipeEdit(recipeId) {
    if (!activeForm.wasExpanded && expandedRecipeId === recipeId) {
      setExpandedRecipeId(null);
    }
    setActiveForm(null);
  }

  function handleDelete(idToDelete) {
    if (blockIfEditing()) {
      return;
    }
    if (!window.confirm("Delete this recipe? This can't be undone.")) {
      return;
    }

    setRecipes(recipes.filter((recipe) => recipe.id !== idToDelete));
  }

  function handleDeleteVersion(recipeId, versionId) {
    if (blockIfEditing()) {
      return;
    }
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
          ...formToVersionFields(formData),
        },
      ],
    };

    setRecipes([...recipes, newRecipe]);
    setActiveForm(null);
  }

  function handleSaveNewVersion(recipeId, formData) {
    const newVersion = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...formToVersionFields(formData),
    };

    setRecipes(
      recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        return { ...recipe, versions: [...recipe.versions, newVersion] };
      }),
    );
    setActiveForm(null);
  }

  // Edits never add versions: map keeps the same versions in the same order,
  // and spreading the old version first keeps its id and createdAt.
  function handleSaveRecipeEdit(recipeId, formData) {
    setRecipes(
      recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        const lastIndex = recipe.versions.length - 1;
        return {
          ...recipe,
          name: formData.name,
          bean: formData.bean,
          method: formData.method,
          versions: recipe.versions.map((version, index) =>
            index === lastIndex
              ? { ...version, ...formToVersionFields(formData) }
              : version,
          ),
        };
      }),
    );
    setActiveForm(null);
    setExpandedRecipeId(recipeId);
  }

  function handleSaveVersionEdit(recipeId, versionId, formData) {
    setRecipes(
      recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        return {
          ...recipe,
          versions: recipe.versions.map((version) =>
            version.id === versionId
              ? { ...version, ...formToVersionFields(formData) }
              : version,
          ),
        };
      }),
    );
    setActiveForm(null);
  }

  return (
    <main className="app">
      <h1>Brew It</h1>
      <p>
        Your personal journal for saving and perfecting coffee brewing recipes.
      </p>

      {activeForm?.type === "create" ? (
        <RecipeForm
          title="Create Recipe"
          submitLabel="Save Recipe"
          initialValues={emptyForm}
          onSave={handleCreateRecipe}
          onCancel={() => setActiveForm(null)}
          showBrewTimeUnit
        />
      ) : (
        <button type="button" onClick={() => openForm({ type: "create" })}>
          + Create Recipe
        </button>
      )}

      <section className="recipe-list">
        {recipes.map((recipe) => {
          const latestVersion = recipe.versions[recipe.versions.length - 1];
          const previousVersions = recipe.versions.slice(0, -1).reverse();
          const isExpanded = expandedRecipeId === recipe.id;
          const isNewVersionOpen =
            activeForm?.type === "newVersion" &&
            activeForm.recipeId === recipe.id;
          const isEditRecipeOpen =
            activeForm?.type === "editRecipe" &&
            activeForm.recipeId === recipe.id;

          return (
            <article
              key={recipe.id}
              className={
                isEditRecipeOpen ? "recipe-card editing" : "recipe-card"
              }
            >
              {/* Edit mode replaces everything above Version History. */}
              {isEditRecipeOpen ? (
                <RecipeEditForm
                  key="editRecipe"
                  initialValues={{
                    name: recipe.name,
                    bean: recipe.bean,
                    method: recipe.method,
                    ...versionToFormValues(latestVersion),
                  }}
                  onSave={(formData) =>
                    handleSaveRecipeEdit(recipe.id, formData)
                  }
                  onCancel={() => handleCancelRecipeEdit(recipe.id)}
                  subtitle={formatDate(latestVersion.createdAt)}
                />
              ) : (
                <>
                  <h2>{recipe.name}</h2>
                  <p className="version-date">
                    {formatDate(latestVersion.createdAt)}
                  </p>
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
                  {isNewVersionOpen ? (
                    <RecipeForm
                      key="newVersion"
                      title="New Version"
                      submitLabel="Save Version"
                      initialValues={versionToFormValues(latestVersion)}
                      onSave={(formData) =>
                        handleSaveNewVersion(recipe.id, formData)
                      }
                      onCancel={() => setActiveForm(null)}
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
                        onClick={() =>
                          openForm({ type: "newVersion", recipeId: recipe.id })
                        }
                      >
                        New Version
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleStartRecipeEdit(recipe.id, isExpanded)
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(recipe.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
              <details className="version-history">
                <summary>Version History ({previousVersions.length})</summary>
                {previousVersions.map((version, index) => {
                  const versionNumber = previousVersions.length - index;
                  const isVersionExpanded = expandedVersionId === version.id;
                  const isEditVersionOpen =
                    activeForm?.type === "editVersion" &&
                    activeForm.versionId === version.id;

                  return (
                    <div key={version.id} className="version-entry">
                      <h3>Version {versionNumber}</h3>
                      <p className="version-date">
                        {formatDate(version.createdAt)}
                      </p>
                      {isVersionExpanded ? (
                        <VersionDetails
                          version={version}
                          compareTo={latestVersion}
                        />
                      ) : (
                        <VersionSummary
                          version={version}
                          compareTo={latestVersion}
                        />
                      )}
                      {isEditVersionOpen ? (
                        <RecipeForm
                          key={version.id}
                          title={`Edit Version ${versionNumber}`}
                          submitLabel="Save Changes"
                          initialValues={versionToFormValues(version)}
                          onSave={(formData) =>
                            handleSaveVersionEdit(
                              recipe.id,
                              version.id,
                              formData,
                            )
                          }
                          onCancel={() => setActiveForm(null)}
                          showRecipeFields={false}
                          showBrewTimeUnit
                        />
                      ) : (
                        <div className="version-actions">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedVersionId(
                                isVersionExpanded ? null : version.id,
                              )
                            }
                          >
                            {isVersionExpanded
                              ? "Hide Version"
                              : "View Version"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openForm({
                                type: "editVersion",
                                recipeId: recipe.id,
                                versionId: version.id,
                              })
                            }
                          >
                            Edit
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
                      )}
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
