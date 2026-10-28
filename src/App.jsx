import { useEffect, useState } from "react";
import About from "./components/About.jsx";
import AskAi from "./components/AskAi.jsx";
import Header from "./components/Header.jsx";
import Landing from "./components/Landing.jsx";
import MoreMenu from "./components/MoreMenu.jsx";
import RecipeEditForm from "./components/RecipeEditForm.jsx";
import VersionDetails from "./components/VersionDetails.jsx";
import VersionSummary from "./components/VersionSummary.jsx";
import { formatDate } from "./utils/format.js";
import {
  afterNextFrame,
  CREATE_CLOSE_MS,
  DELETE_MS,
  FORM_LEAVE_MS,
  motionDelay,
} from "./utils/motion.js";
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
  // Only one Ask AI panel is open in the whole app.
  const [askAiRecipeId, setAskAiRecipeId] = useState(null);
  // The recipe whose More menu is open (only one in the whole app).
  const [openMenuId, setOpenMenuId] = useState(null);
  // The recipe playing its delete animation (removed from state after it).
  const [removingRecipeId, setRemovingRecipeId] = useState(null);
  // True for one frame after a delete: turns transitions off (site.css).
  const [isSettling, setIsSettling] = useState(false);
  // True while a cancelled form fades out, before activeForm is cleared.
  const [isFormLeaving, setIsFormLeaving] = useState(false);
  // Drives the Create card's open/close animation (data-open). It's false
  // for the first frame after opening, so the opening can animate.
  const [isCreateShown, setIsCreateShown] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  // Only one edit at a time: while one is open, other actions just remind
  // the user to finish it. Returns true when the action should stop.
  function blockIfEditing() {
    // A delete or form-closing animation is playing: ignore clicks until
    // it's done.
    if (
      removingRecipeId !== null ||
      isFormLeaving ||
      (activeForm?.type === "create" && !isCreateShown)
    ) {
      return true;
    }
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

  // The Create card mounts closed, then opens a frame later: a transition
  // only plays when data-open changes on an element that already exists.
  function handleStartCreate() {
    if (blockIfEditing()) {
      return;
    }
    setActiveForm({ type: "create" });
    setIsCreateShown(false);
    afterNextFrame(() => setIsCreateShown(true));
  }

  // Save and Cancel both collapse the card first, then remove the form.
  function closeCreate() {
    setIsCreateShown(false);
    setTimeout(() => setActiveForm(null), motionDelay(CREATE_CLOSE_MS));
  }

  // Cancel fades the open form out (form-slot is-leaving), then closes it.
  function closeFormAfterFade(afterClose) {
    setIsFormLeaving(true);
    setTimeout(() => {
      afterClose();
      setActiveForm(null);
      setIsFormLeaving(false);
    }, motionDelay(FORM_LEAVE_MS));
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
    const shouldCollapse =
      !activeForm.wasExpanded && expandedRecipeId === recipeId;
    closeFormAfterFade(() => {
      if (shouldCollapse) {
        setExpandedRecipeId(null);
      }
    });
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
    const shouldCollapse =
      !activeForm.wasExpanded && expandedVersionId === versionId;
    closeFormAfterFade(() => {
      if (shouldCollapse) {
        setExpandedVersionId(null);
      }
    });
  }

  function handleDelete(idToDelete) {
    if (blockIfEditing()) {
      return;
    }
    const recipeToDelete = recipes.find((recipe) => recipe.id === idToDelete);
    const versionCount = recipeToDelete.versions.length;
    const message =
      versionCount === 1
        ? `Delete "${recipeToDelete.name}" and its only version? This can't be undone.`
        : `Delete "${recipeToDelete.name}" and all its ${versionCount} versions? This can't be undone.`;
    if (!window.confirm(message)) {
      return;
    }

    // The card animates out first (is-removing), then leaves state.
    setRemovingRecipeId(idToDelete);
    setTimeout(() => {
      setRecipes((currentRecipes) =>
        currentRecipes.filter((recipe) => recipe.id !== idToDelete),
      );
      setRemovingRecipeId(null);
      setIsSettling(true);
      afterNextFrame(() => setIsSettling(false));
    }, motionDelay(DELETE_MS));
  }

  function handleDeleteVersion(recipeId, versionId) {
    if (blockIfEditing()) {
      return;
    }
    const recipeToEdit = recipes.find((recipe) => recipe.id === recipeId);
    const versionIndex = recipeToEdit.versions.findIndex(
      (version) => version.id === versionId,
    );
    const lastIndex = recipeToEdit.versions.length - 1;
    const isCurrent = versionIndex === lastIndex;
    // Version numbers count from the oldest version (Version 1).
    const message = isCurrent
      ? `Delete the current version of "${recipeToEdit.name}"? This can't be undone.`
      : `Delete Version ${versionIndex + 1} of "${recipeToEdit.name}"? This can't be undone.`;
    if (!window.confirm(message)) {
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

    // Deleting the current version makes the newest history version current,
    // so it leaves the history and can't stay the expanded one.
    const newCurrentId = isCurrent
      ? recipeToEdit.versions[lastIndex - 1].id
      : null;
    if (expandedVersionId === versionId || expandedVersionId === newCurrentId) {
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
    closeCreate();
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
  const isEmpty = recipes.length === 0 && activeForm === null;
  const formSlotClass = isFormLeaving ? "form-slot is-leaving" : "form-slot";

  return (
    // id="top" is the target of the navbar's "back to top" links.
    <div className="site" id="top" data-settling={isSettling}>
      <div className="bi-grain-page" aria-hidden="true"></div>
      <Header />
      <main>
        <Landing />

        <section
          className="sec sec--recipes bi-grain"
          id="recipes"
          data-empty={isEmpty}
          aria-labelledby="recipes-title"
        >
          <div className="wrap">
            <header className="rs-head">
              <div className="bi-section-head__bar" aria-hidden="true"></div>
              <div className="rs-head__row">
                <h2 className="rs-head__title" id="recipes-title">
                  Your recipes
                </h2>
                {activeForm?.type !== "create" && (
                  <button
                    type="button"
                    className="bi-btn bi-btn--primary"
                    onClick={handleStartCreate}
                  >
                    Create Recipe
                  </button>
                )}
              </div>
            </header>

            <div className="recipe-grid" data-layout="list">
              {activeForm?.type === "create" && (
                <div
                  className="rc-wrap rc-wrap--create collapse"
                  data-open={isCreateShown}
                >
                  <div>
                    <article className="rc is-editing" aria-label="New recipe">
                      <RecipeEditForm
                        key="create"
                        initialValues={emptyForm}
                        onSave={handleCreateRecipe}
                        onCancel={closeCreate}
                        subtitle={formatDate(new Date().toISOString())}
                        submitLabel="Save Recipe"
                      />
                    </article>
                  </div>
                </div>
              )}
              {sortedRecipes.map((recipe) => {
                const latestVersion =
                  recipe.versions[recipe.versions.length - 1];
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
                const isAskAiOpen = askAiRecipeId === recipe.id;

                return (
                  // The key keeps each card's DOM tied to its recipe, so after a
                  // delete the next card doesn't replay its open animation.
                  <div
                    key={recipe.id}
                    className={
                      removingRecipeId === recipe.id
                        ? "rc-wrap bi-removable is-removing"
                        : "rc-wrap bi-removable"
                    }
                  >
                    <article
                      className={
                        isEditRecipeOpen || isNewVersionOpen
                          ? "rc is-editing"
                          : "rc"
                      }
                    >
                      {/* Edit mode replaces everything above Version History. */}
                      {isEditRecipeOpen ? (
                        <div className={formSlotClass}>
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
                        </div>
                      ) : (
                        <>
                          <div className="rc__body">
                            <div className="rc__id">
                              <div>
                                <h3 className="rc__title">{recipe.name}</h3>
                                <p className="rc__date">
                                  {isNewVersionOpen
                                    ? "New version"
                                    : formatDate(latestVersion.createdAt)}
                                </p>
                              </div>
                              <dl className="rc__meta">
                                <dt>Bean:</dt>
                                <dd>{recipe.bean}</dd>
                                <dt>Method:</dt>
                                <dd>{recipe.method}</dd>
                              </dl>
                            </div>
                            {isNewVersionOpen ? (
                              <div className={formSlotClass}>
                                <RecipeEditForm
                                  key="newVersion"
                                  initialValues={versionToFormValues(
                                    latestVersion,
                                  )}
                                  onSave={(formData) =>
                                    handleSaveNewVersion(recipe.id, formData)
                                  }
                                  onCancel={() =>
                                    handleCancelRecipeEdit(recipe.id)
                                  }
                                  showRecipeFields={false}
                                  submitLabel="Save Version"
                                />
                              </div>
                            ) : (
                              <div className="rc__data">
                                <VersionSummary version={latestVersion} />
                                {/* Always rendered: data-open animates it open
                                and closed (site.css .collapse). */}
                                <div
                                  className="collapse"
                                  data-open={isExpanded}
                                >
                                  <div>
                                    <VersionDetails version={latestVersion} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {!isNewVersionOpen && (
                            <div className="rc__actions">
                              <button
                                type="button"
                                className="bi-btn bi-btn--secondary bi-btn--sm"
                                aria-expanded={isExpanded}
                                onClick={() =>
                                  setExpandedRecipeId(
                                    isExpanded ? null : recipe.id,
                                  )
                                }
                              >
                                {isExpanded ? "Hide Recipe" : "View Recipe"}
                              </button>
                              <button
                                type="button"
                                className="bi-btn bi-btn--ai bi-btn--sm"
                                aria-expanded={isAskAiOpen}
                                onClick={() =>
                                  setAskAiRecipeId(
                                    isAskAiOpen ? null : recipe.id,
                                  )
                                }
                              >
                                <span
                                  className="bi-btn__spark"
                                  aria-hidden="true"
                                ></span>
                                {isAskAiOpen ? "Hide AI" : "Ask AI"}
                              </button>
                              <MoreMenu
                                isOpen={openMenuId === recipe.id}
                                onToggle={() =>
                                  setOpenMenuId(
                                    openMenuId === recipe.id ? null : recipe.id,
                                  )
                                }
                                onClose={() => setOpenMenuId(null)}
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="menu__item"
                                  onClick={() =>
                                    handleStartNewVersion(recipe.id, isExpanded)
                                  }
                                >
                                  New Version
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="menu__item"
                                  onClick={() =>
                                    handleStartRecipeEdit(recipe.id, isExpanded)
                                  }
                                >
                                  Edit
                                </button>
                                {recipe.versions.length > 1 && (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="menu__item"
                                    onClick={() =>
                                      handleDeleteVersion(
                                        recipe.id,
                                        latestVersion.id,
                                      )
                                    }
                                  >
                                    Delete Version
                                  </button>
                                )}
                                <div
                                  className="menu__sep"
                                  role="separator"
                                ></div>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="menu__item menu__item--danger"
                                  onClick={() => handleDelete(recipe.id)}
                                >
                                  Delete Recipe
                                </button>
                              </MoreMenu>
                            </div>
                          )}
                        </>
                      )}
                      {/* Outside the ternary above, so it stays mounted (and keeps
                    its answer) while Edit or New Version is open. */}
                      {isAskAiOpen && <AskAi key={recipe.id} recipe={recipe} />}
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
                          const isVersionExpanded =
                            expandedVersionId === version.id;
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
                                <div className={formSlotClass}>
                                  <RecipeEditForm
                                    initialValues={versionToFormValues(version)}
                                    onSave={(formData) =>
                                      handleSaveVersionEdit(
                                        recipe.id,
                                        version.id,
                                        formData,
                                      )
                                    }
                                    onCancel={() =>
                                      handleCancelVersionEdit(version.id)
                                    }
                                    showRecipeFields={false}
                                  />
                                </div>
                              ) : (
                                <>
                                  <VersionSummary
                                    version={version}
                                    compareTo={latestVersion}
                                  />
                                  <div
                                    className="collapse"
                                    data-open={isVersionExpanded}
                                  >
                                    <div>
                                      <VersionDetails
                                        version={version}
                                        compareTo={latestVersion}
                                      />
                                    </div>
                                  </div>
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
                                        handleDeleteVersion(
                                          recipe.id,
                                          version.id,
                                        )
                                      }
                                    >
                                      Delete Version
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </details>
                    </article>
                  </div>
                );
              })}
            </div>

            {isEmpty && <p className="empty-note">No recipes yet</p>}
          </div>
        </section>

        <About />
      </main>
    </div>
  );
}

export default App;
