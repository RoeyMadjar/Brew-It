import { useEffect, useState } from "react";
import About from "./components/About.jsx";
import Landing from "./components/Landing.jsx";
import RecipeEditForm from "./components/RecipeEditForm.jsx";
import VersionDetails from "./components/VersionDetails.jsx";
import VersionSummary from "./components/VersionSummary.jsx";
import { formatDate } from "./utils/format.js";
import { getRecipeCreatedAt } from "./utils/recipe.js";
import {
  formToVersionFields,
  versionToFormValues,
} from "./utils/versionForm.js";
import "./App.css";

const sampleRecipes = [
  {
    id: "recipe-1",
    name: "Morning Coffee",
    bean: "San Rafael",
    method: "Espresso",
    versions: [
      {
        id: "version-1",
        createdAt: "2026-09-20T08:00:00.000Z",
        doseGrams: 16,
        waterGrams: 40,
        grindSize: "fine",
        waterTempC: 93,
        brewTimeSeconds: 28,
        yieldGrams: 40,
        rating: 8,
        tastingNotes: "Balanced, bitter notes, a bit sour, nice finish.",
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
  // Only one form is open at a time: null, or
  // { type, recipeId?, versionId?, wasExpanded? }.
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
      activeForm?.type !== "create" &&
      activeForm?.type !== "editRecipe" &&
      activeForm?.type !== "editVersion" &&
      activeForm?.type !== "newVersion"
    ) {
      return false;
    }
    // Create has no recipeId yet, so it's handled before the lookup.
    if (activeForm.type === "create") {
      window.alert("Save / Cancel the new recipe first.");
      return true;
    }
    const editedRecipe = recipes.find(
      (recipe) => recipe.id === activeForm.recipeId,
    );
    if (activeForm.type === "newVersion") {
      window.alert(
        `Save / Cancel the new version of ${editedRecipe.name} first.`,
      );
      return true;
    }
    if (activeForm.type === "editRecipe") {
      window.alert(`Save / Cancel changes in ${editedRecipe.name} first.`);
      return true;
    }
    // Version numbers count from the oldest version (Version 1).
    const versionNumber =
      editedRecipe.versions.findIndex(
        (version) => version.id === activeForm.versionId,
      ) + 1;
    window.alert(
      `Save / Cancel changes in Version ${versionNumber} of ${editedRecipe.name} recipe first.`,
    );
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

  // New Version also shows the expanded card; Cancel uses the same rule.
  function handleStartNewVersion(recipeId, isExpanded) {
    if (blockIfEditing()) {
      return;
    }
    setActiveForm({ type: "newVersion", recipeId, wasExpanded: isExpanded });
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

  // Same pattern as the recipe edit, using expandedVersionId.
  function handleStartVersionEdit(recipeId, versionId, isVersionExpanded) {
    if (blockIfEditing()) {
      return;
    }
    setActiveForm({
      type: "editVersion",
      recipeId,
      versionId,
      wasExpanded: isVersionExpanded,
    });
    setExpandedVersionId(versionId);
  }

  function handleCancelVersionEdit(versionId) {
    if (!activeForm.wasExpanded && expandedVersionId === versionId) {
      setExpandedVersionId(null);
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
    const createdAt = new Date().toISOString();
    const newRecipe = {
      id: crypto.randomUUID(),
      createdAt,
      name: formData.name,
      bean: formData.bean,
      method: formData.method,
      versions: [
        {
          id: crypto.randomUUID(),
          createdAt,
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
    setExpandedRecipeId(recipeId);
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
    setExpandedVersionId(versionId);
  }

  // Newest first. Sort a copy so the recipes state is never mutated;
  // ISO dates compare correctly as plain strings.
  const sortedRecipes = recipes
    .slice()
    .sort((a, b) => getRecipeCreatedAt(b).localeCompare(getRecipeCreatedAt(a)));

  return (
    <main className="app">
      <Landing />

      <section id="recipes">
        <h2>Your recipes</h2>

        {activeForm?.type !== "create" && (
          <button type="button" onClick={() => openForm({ type: "create" })}>
            Create Recipe
          </button>
        )}

        <section className="recipe-list">
          {activeForm?.type === "create" && (
            <article className="recipe-card editing">
              <RecipeEditForm
                key="create"
                initialValues={emptyForm}
                onSave={handleCreateRecipe}
                onCancel={() => setActiveForm(null)}
                subtitle={formatDate(new Date().toISOString())}
                submitLabel="Save Recipe"
              />
            </article>
          )}
          {sortedRecipes.map((recipe) => {
            const latestVersion = recipe.versions[recipe.versions.length - 1];
            const previousVersions = recipe.versions.slice(0, -1).reverse();
            const isExpanded = expandedRecipeId === recipe.id;
            const isNewVersionOpen =
              activeForm?.type === "newVersion" &&
              activeForm.recipeId === recipe.id;
            const isEditRecipeOpen =
              activeForm?.type === "editRecipe" &&
              activeForm.recipeId === recipe.id;
            const isEditingVersionHere =
              activeForm?.type === "editVersion" &&
              activeForm.recipeId === recipe.id;

            return (
              <article
                key={recipe.id}
                className={
                  isEditRecipeOpen || isNewVersionOpen
                    ? "recipe-card editing"
                    : "recipe-card"
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
                      {isNewVersionOpen
                        ? "New version"
                        : formatDate(latestVersion.createdAt)}
                    </p>
                    <p>
                      <strong>Bean:</strong> {recipe.bean}
                    </p>
                    <p>
                      <strong>Method:</strong> {recipe.method}
                    </p>
                    {isNewVersionOpen ? (
                      <RecipeEditForm
                        key="newVersion"
                        initialValues={versionToFormValues(latestVersion)}
                        onSave={(formData) =>
                          handleSaveNewVersion(recipe.id, formData)
                        }
                        onCancel={() => handleCancelRecipeEdit(recipe.id)}
                        showRecipeFields={false}
                        submitLabel="Save Version"
                      />
                    ) : (
                      <>
                        {isExpanded ? (
                          <VersionDetails version={latestVersion} />
                        ) : (
                          <VersionSummary version={latestVersion} />
                        )}
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
                              handleStartNewVersion(recipe.id, isExpanded)
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
                      </>
                    )}
                  </>
                )}
                <details className="version-history">
                  {/* preventDefault stops <details> from closing while one of
                      its versions is being edited. */}
                  <summary
                    onClick={(event) => {
                      if (isEditingVersionHere) {
                        event.preventDefault();
                        blockIfEditing();
                      }
                    }}
                  >
                    Version History ({previousVersions.length})
                  </summary>
                  {previousVersions.map((version, index) => {
                    const versionNumber = previousVersions.length - index;
                    const isVersionExpanded = expandedVersionId === version.id;
                    const isEditVersionOpen =
                      isEditingVersionHere &&
                      activeForm.versionId === version.id;

                    return (
                      <div
                        key={version.id}
                        className={
                          isEditVersionOpen
                            ? "version-entry editing"
                            : "version-entry"
                        }
                      >
                        <h3>Version {versionNumber}</h3>
                        <p className="version-date">
                          {formatDate(version.createdAt)}
                        </p>
                        {isEditVersionOpen ? (
                          <RecipeEditForm
                            initialValues={versionToFormValues(version)}
                            onSave={(formData) =>
                              handleSaveVersionEdit(
                                recipe.id,
                                version.id,
                                formData,
                              )
                            }
                            onCancel={() => handleCancelVersionEdit(version.id)}
                            showRecipeFields={false}
                          />
                        ) : (
                          <>
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
                                  handleStartVersionEdit(
                                    recipe.id,
                                    version.id,
                                    isVersionExpanded,
                                  )
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
                          </>
                        )}
                      </div>
                    );
                  })}
                </details>
              </article>
            );
          })}
        </section>
      </section>

      <About />
    </main>
  );
}

export default App;
