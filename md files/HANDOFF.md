# Brew It — Session Handoff

Last updated: 2026-10-01 · HEAD: `a878c29 Recipe card redesign` · Branch: `main`

Read this first, then `src/App.jsx` (the whole app logic lives there). A longer product-decision log written outside Claude Code lives in `md files/BREW-IT-CHATGPT-CONTEXT.md` (untracked); this file agrees with it.

---

## 1. Project overview

**Brew It** is a personal coffee-brewing recipe journal. A user saves recipes, records the brew parameters and tasting notes, and creates **new versions** of a recipe as they experiment (change grind, temp, …) without losing earlier versions.

- **Purpose:** portfolio project + learning project. The owner is a junior frontend dev learning React. **Understanding the code matters more than speed.**
- **Stack:** React 19, JavaScript (no TypeScript), Vite 8, plain CSS, browser `localStorage`. ESLint 10. No other runtime dependencies.
- **Not in scope (deliberately):** routing, backend, database, auth, multi-user, state libraries, UI libraries. A backend is only planned later for a secure AI endpoint.

---

## 2. Architecture

```
index.html                 Single page; <div id="root">, loads /src/main.jsx. <title>Brew It</title>
src/main.jsx               createRoot + <StrictMode><App/></StrictMode>. (Still template style: single quotes, no semicolons.)
src/App.jsx                ALL app state, handlers, persistence, and the recipe list/card UI
src/components/RecipeForm.jsx  Reusable controlled form used for "Create Recipe" and "New Version"
src/App.css                Layout + card/form/history styles (only stylesheet with app-specific rules)
src/index.css              Global basics: font, text color #3b2f2f, background #faf7f2, body margin 0
public/favicon.svg         Only remaining template asset
eslint.config.js           Vite template config (recommended + react-hooks + react-refresh)
README.md                  Still the unmodified Vite template README (to replace later)
md files/                  Untracked: ChatGPT context doc
dist/                      Build output (gitignored)
```

### `src/App.jsx` contents, top to bottom
| Item | Purpose |
|---|---|
| `sampleRecipes` | One sample recipe ("Morning V60") used only when localStorage has nothing saved |
| `emptyForm` | All 11 form fields as `""` — initial values for Create |
| `versionToFormValues(version)` | Version (numbers) → form values (strings) for the New Version form |
| `formatDate(isoString)` | `toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })` |
| `STORAGE_KEY = "brew-it-recipes"` | localStorage key |
| `loadRecipes()` | Reads + `JSON.parse`s storage; returns `sampleRecipes` if missing or on any error (try/catch) |
| State in `App` | `recipes` (lazy-init `useState(loadRecipes)`), `newVersionRecipeId`, `isCreateFormOpen`, `expandedRecipeId` |
| `useEffect` on `[recipes]` | `localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))` |
| `handleDelete(id)` | `filter` out the recipe |
| `handleCreateRecipe(formData)` | Builds recipe + first version (UUIDs, `createdAt`, `Number()` conversions), appends, closes form |
| `handleSaveNewVersion(recipeId, formData)` | Builds version, appends via nested immutable update, closes form |
| JSX | Header → `+ Create Recipe` button / Create form → `.recipe-list` of `<article className="recipe-card">` |

### Data model (persisted shape — changing it affects saved user data)
```js
{
  id, name, bean, method,          // recipe identity (string id: "recipe-1" or crypto.randomUUID())
  versions: [                      // oldest first; LAST item = current/latest
    { id, createdAt /* ISO string */, doseGrams, waterGrams, grindSize /* string */,
      waterTempC, brewTimeSeconds, yieldGrams, rating, tastingNotes }
  ]
}
```
Numbers are stored as numbers. **Ratio is never stored** (derived from `waterGrams / doseGrams`).

### Recipe card (inside `recipes.map` in `App.jsx`)
Per-card derived values: `latestVersion`, `previousVersions = recipe.versions.slice(0, -1).reverse()`, `isExpanded`, `ratio` (`"—"` if not computable).
- Always shown: name, bean, method, rating.
- `isExpanded &&`: dose, water, ratio, grind, temp, brew time, yield, tasting notes.
- If `newVersionRecipeId === recipe.id`: in-card `<RecipeForm showRecipeFields={false} …>`; else `.card-actions` row: **View/Hide Recipe**, **New Version**, **Edit** (`disabled`, no handler), **Delete**.
- `<details className="version-history">` with `<summary>Version History ({previousVersions.length})</summary>`; entries labelled `Version {previousVersions.length - index}` with date + all fields (no ratio yet).

### `RecipeForm` props
`title`, `submitLabel`, `initialValues`, `onSave(formData)`, `onCancel` (optional → renders Cancel button), `showRecipeFields = true` (hides name/bean/method when false). Owns its own `formData` state; shows a live `Ratio: 1:16.7` line after Water (computed during render, not state). Returns raw **string** values via `onSave`; App does the `Number()` conversion.

---

## 3. Conventions

- **Style:** double quotes + semicolons (Prettier-formatted by the owner) in `App.jsx`, `RecipeForm.jsx`. Exception: `src/main.jsx` keeps template style. 2-space indent.
- **Naming:** units in field names (`doseGrams`, `waterTempC`, `brewTimeSeconds`); handlers `handleX`; callback props `onX`; booleans `isX`; "which item is open" state = `xRecipeId` holding an id or `null`.
- **State patterns:**
  - Never mutate state; always new arrays/objects (`filter`, `map`, spread). Nested update: `{ ...recipe, versions: [...recipe.versions, newVersion] }`.
  - One id-or-null state per "only one open at a time" UI (`expandedRecipeId`, `newVersionRecipeId`).
  - Derived values (ratio, latest version, previous versions) computed during render, never stored.
  - Shared data lives in `App` and goes down as props; children report back via callback props.
  - Forms are controlled; one `handleChange` using `[event.target.name]`. Form values are strings; convert with `Number()` on save, `String()` when loading into a form.
- **Display pattern:** `<p><strong>Label:</strong> {value} unit</p>`; units added in JSX, not data.
- **Buttons:** always explicit `type="button"` / `type="submit"`.
- **IDs:** `crypto.randomUUID()` (built in). React `key` = the item's `id`, never the index.
- **Libraries:** none beyond React. Native HTML preferred (`<details>/<summary>` for history instead of React state).

### How to work with this owner
- **Explain the approach before editing**; when they say "wait for approval", stop and wait.
- Small, scoped steps. **Do not refactor unrelated code**, add features, or add libraries unless asked.
- Explain the underlying React/JS concept in plain language; they want to understand, not just receive code.
- Don't commit unless asked; they usually commit themselves after testing. Commits go straight to `main` (solo project).
- After edits run `npm run lint` and `npm run build`. Say clearly that browser testing was not done (Claude can't see the page) and give them manual test steps.

---

## 4. Decisions made (and why)

| Decision | Reasoning |
|---|---|
| Recipe = identity + `versions` array | Brewing is iterative; old attempts must be preserved. Rating/notes describe a specific brew, so they live on the version |
| Latest version = last array item | Simplest; no sorting |
| **New Version** appends; **Edit** (future) modifies in place | New Version = new experiment; Edit = fix a mistake, no new history entry. `createdAt` is immutable even when editing |
| In-card UX (forms + expanded details inside the card) | User shouldn't scroll to the top form / leave the page. Only one card expanded / one New Version form open at a time |
| Routing tried then **removed** (`react-router-dom` uninstalled, `RecipeDetails.jsx` deleted) | Separate details page felt unnatural. **Do not reintroduce routing** unless the owner changes this |
| Create form hidden behind `+ Create Recipe` | Cleaner page; form closes on save or Cancel |
| Ratio derived, never stored | Can't get out of sync with dose/water; display format can change freely |
| `RecipeForm` returns strings; App converts | Form stays generic (doesn't know about recipes/versions) |
| `useEffect` for persistence (not in handlers) | One place covers every change; handlers would save stale `recipes` |
| `try/catch` in `loadRecipes` | Corrupt JSON or blocked storage falls back to samples instead of a blank page |
| Version History shows **previous versions only**; count = previous count | Current version is already on the card |
| Duplicated display/conversion code left as-is | Owner chose to refactor later, after features work |
| Edit button: owner wants it **visible and enabled** before implemented | Currently `disabled` in code — see next steps |

Decided for the future (see `md files/…` §7, §13–16): rating 1–10 in 0.5 steps shown as `x / 10`; show current version's date when expanded; ratio in history entries; history entries compared against the **current** version (not the previous one) with light green = same / light red = different **plus** a non-color indicator (e.g. ✓ / ≠). Compact history UI design is **not decided** — ask before building.

---

## 5. Current state

**Done (all committed):** project setup, recipe display, delete, controlled create form, versions data model, `RecipeForm` extraction, in-card New Version, hidden Create form + Cancel, live ratio in form, version history (`<details>`), localStorage persistence, routing experiment + removal, collapsed/expandable cards.

**Working tree:** clean except untracked `md files/` and this `HANDOFF.md`.

**Verified:** `npm run lint` passes with no warnings; `npm run build` succeeds.

**Untested / unknown:** Claude never ran the app in a browser. The owner reported testing through Step 3 (New Version); later steps (history, localStorage, card redesign) were not confirmed tested in this session.

**Known gaps (not bugs we introduced, but real):**
- No validation: empty numeric fields save as `0` (`Number("") === 0`); a blank recipe can be created.
- Rating input is still `min="1" max="5"`, displays `/ 5`.
- Edit button is `disabled` and has no handler.
- History entries show no ratio; expanded card shows no date.
- No delete confirmation.
- `localStorage.setItem` in the effect is not wrapped in try/catch.
- `README.md` is still the Vite template.

---

## 6. Next steps (prioritized)

1. **Small UI/data changes** (owner's agreed next batch):
   - Remove `disabled` from the Edit button (keep it visible/enabled; no behavior yet).
   - Show `latestVersion.createdAt` (via `formatDate`) in the expanded card.
   - Rating 1–10, `step="0.5"`, display `/ 10` in card + history. ⚠️ Saved data contains 1–5 ratings (sample = 4) — ask the owner how to treat existing values before changing.
   - Add Ratio to each history entry (same formula/`"—"` fallback as the card).
2. **Design the compact Version History UI with the owner** (undecided; one idea was a summary row + "View Version").
3. **Edit** — (a) current recipe: edit name/bean/method + latest version fields in place; (b) each history version: edit all fields except `createdAt`. Likely: `editingRecipeId` state, `RecipeForm` with merged initial values, nested `map` to replace one version. Must not create a version.
4. **History comparison** against the current version (green/red + non-color indicator).
5. Search / filtering.
6. API integration with loading/error states (learning goal).
7. "Ask AI about this brew" — needs a small backend endpoint; never put an API key in the client.
8. Refactor/cleanup: `VersionDetails` component for the repeated field markup, shared ratio helper (duplicated in `App.jsx` and `RecipeForm.jsx`), shared form→version builder (duplicated in both handlers); then validation and UI polish.
9. Deploy (needs nothing special now that routing is gone), replace README, portfolio presentation.

---

## 7. Gotchas

**Commands**
```bash
npm install          # first time
npm run dev          # http://localhost:5173 (HMR)
npm run lint         # ESLint — must pass clean
npm run build        # production build to dist/ (also catches import errors)
npm run preview      # serve dist/
```
No test framework is installed; verification = lint + build + owner's manual browser testing.

**Inspect / reset saved data** (browser DevTools): Application → Local Storage → `brew-it-recipes`. Reset: `localStorage.removeItem("brew-it-recipes")` then reload. Corrupt-data test: `localStorage.setItem("brew-it-recipes", "not json")` → app falls back to samples.

**Traps we hit or designed around**
- `Array.prototype.reverse()` **mutates** — always `slice()` first (it's what `previousVersions` does). Never call it on state directly.
- `useState(initialValues)` in `RecipeForm` only reads `initialValues` on mount. Works because the form is conditionally rendered (fresh mount each open). If you ever keep a form mounted and change its `initialValues`, it won't update — remount it (e.g. a `key`) instead.
- `useState(loadRecipes)` — pass the function, **no parentheses**, or it re-reads storage every render.
- Don't save to localStorage inside handlers: after `setRecipes(...)`, `recipes` is still the old value until re-render.
- **Changing the data shape now affects existing saved data** in the owner's (and testers') browsers. Plan a migration or a fallback in `loadRecipes` for any shape change.
- Deleting every recipe saves `[]`; samples will **not** come back (`getItem` returns `"[]"`, not `null`). Intended.
- `onClick={() => handler(recipe.id)}` — never `onClick={handler(recipe.id)}` (runs during render → infinite re-renders).
- Buttons inside a `<form>` default to `type="submit"`; non-submit buttons need `type="button"`.
- ESLint (`no-unused-vars`) errors on unused destructured state, e.g. adding `const [x, setX] = useState()` before using `x`. Add state in the same step that uses it.
- Adjacent JSX elements on separate lines have no whitespace between them (that's why `.card-actions` uses flex `gap`).
- `StrictMode` runs effects twice in dev — harmless for the save effect.
- `.recipe-card p { margin: 4px 0 }` also applies to forms/history inside a card.
- Version numbers in history are positional (`previousVersions.length - index`). If deleting individual versions is ever added, numbers will shift — consider storing a number then.
- Rejected tool calls: the owner sometimes stops a command to redirect. Edits made before the stop remain on disk — check `git status`/`git diff` and tell them.
