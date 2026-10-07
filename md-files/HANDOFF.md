# Brew It — Session Handoff

Last updated: 2026-10-07 · HEAD: `2d8f496` · Branch: `main` (solo project, commits go straight to `main`)

**This file is the single source of truth for the project.** If anything else (old notes, earlier chats) disagrees with it, this file wins. Read it first, then `src/App.jsx`.

---

## 1. Project & how the owner works

**Brew It** is a coffee recipe journal with versioning: the owner's first portfolio project as a junior frontend dev. A coffee hobbyist saves recipes, records each brew (dose, water, grind, temp, time, yield, rating, notes), and creates **new versions** while experimenting without losing old ones.

- **Feel:** simple, intuitive, visually clean. Shareable with close people for testing; browser-only data and no multi-user are fine for now.
- **Stack:** React 19, JavaScript (no TypeScript), Vite 8, plain CSS, `localStorage`, ESLint. No routing, no backend (yet), no UI or state libraries.
- **Product philosophy:** stay a focused portfolio project. Don't add auth, databases, complex backend, social/multi-user features, state libraries or agent systems. Add complexity only for a concrete reason, never because it's "more professional".
- **Learning goals:** React state, componentization, forms, derived values, localStorage, refactoring, UX decisions, Git, then API fundamentals (loading/error states) and AI behind a small backend.

Workflow and answer style: see CLAUDE.md in the project root.

---

## 2. Architecture (`src/`)

| File | What it does |
|---|---|
| `main.jsx` | Mounts `<App />` in `StrictMode` (template style: single quotes, no semicolons; left as is) |
| `index.css` | Global font, text `#3b2f2f`, background `#faf7f2`, `overflow-anchor: none` on `body` (see §5) |
| `App.jsx` | All state and handlers, localStorage load/save, `sampleRecipes`, `emptyForm`, card + Version History rendering |
| `App.css` | All app styles (cards, forms, grid, highlight, edit mode) |
| `components/RecipeForm.jsx` | Separate-box controlled form, now used only by Create, New Version and Edit Version (history). Props: `title`, `submitLabel`, `initialValues`, `onSave`, `onCancel`, `showRecipeFields` (name/bean/method), `showBrewTimeUnit` (sec/min `<select>`). Returns raw **string** values |
| `components/RecipeEditForm.jsx` | Inline edit mode: a `<form>` laid out like the expanded card, reusing the `version-grid` / `version-notes` / `card-actions` CSS. Props: `initialValues`, `onSave`, `onCancel`, `subtitle` (formatted date, plain text), `showRecipeFields` (default `true`). String values; live read-only ratio via `formatRatio(formToVersionFields(formData))` |
| `components/VersionSummary.jsx` | `{ version, compareTo? }` → 4-column grid: Dose, Yield, Brew time, Rating |
| `components/VersionDetails.jsx` | `{ version, compareTo? }` → `VersionSummary` (row 1) + Grind size, Water, Ratio, Temperature (row 2) + Tasting notes |
| `components/VersionField.jsx` | One grid cell: `<dt>` label + `<dd>` with `ComparedValue` |
| `components/ComparedValue.jsx` | `{ version, compareTo, isChanged, format }` → plain text, or `<mark>` value + "now X" when changed |
| `utils/format.js` | `formatDate`, `secondsToMinutes`, `formatBrewTime`, `formatGrams`, `formatTemp`, `formatRating`, `formatRatio` |
| `utils/compare.js` | `getChangedFields(version, current)` → `{ doseGrams, waterGrams, ratio, grindSize, waterTempC, brewTime, yieldGrams, rating }` booleans |
| `utils/versionForm.js` | `formToVersionFields(formData)` (form → saved fields, no id/createdAt) and `versionToFormValues(version)` (saved → form strings) |

**State in `App`:** `recipes` (lazy init `useState(loadRecipes)`), `activeForm`, `expandedRecipeId`, `expandedVersionId`.
**Handlers:** `blockIfEditing` (the one-edit guard, §4), `openForm` (guard + `setActiveForm`), `handleStartRecipeEdit`, `handleCancelRecipeEdit`, `handleDelete`, `handleDeleteVersion`, `handleCreateRecipe`, `handleSaveNewVersion`, `handleSaveRecipeEdit`, `handleSaveVersionEdit`.

---

## 3. Data model (persisted in `localStorage["brew-it-recipes"]`)

```js
Recipe:  { id, name, bean, method, versions: [Version, ...] }   // latest = LAST item
Version: { id, createdAt /* ISO */, doseGrams, waterGrams, grindSize /* string */,
           waterTempC, brewTimeSeconds, brewTimeUnit, yieldGrams, rating, tastingNotes }
```
- **Name/bean/method belong to the recipe**; everything else (including date, rating, notes) belongs to a version.
- `brewTimeSeconds` is **always seconds**. `brewTimeUnit` (`"seconds"` | `"minutes"`) is only a display preference; **missing = seconds** (older data and `sampleRecipes` have none).
- Ratio is **derived** (`formatRatio`), never stored, so it can't get out of sync.
- Form values are **strings** while editing (keeps inputs predictable). `versionToFormValues` / `formToVersionFields` convert in both directions.
- Changing the shape affects saved data in testers' browsers. Plan a fallback in the code (like `?? "seconds"`) for any new field.
- `sampleRecipes` loads only when the storage key is **missing**. Deleting everything saves `[]`, so the samples don't come back (intended). Corrupt JSON falls back to the samples.

---

## 4. Implemented features

- **Create Recipe:** hidden behind `+ Create Recipe`; has the sec/min selector.
- **New Version:** in-card form prefilled from the latest version. Keeps the latest version's unit (label "(min)"/"(sec)"), no selector yet.
- **Edit current recipe (inline edit mode):** Edit expands the card (`RecipeEditForm` replaces everything above Version History) and adds an amber card border. Name, bean, method and every grid value become inputs (brew time = number + sec/min `<select>`, notes = textarea); ratio stays read-only and updates live; the date stays plain text. Save Changes / Cancel sit in one row where the 4 buttons were. Save keeps the card expanded. Cancel restores the previous state via `wasExpanded` in `activeForm` (collapses only if the card wasn't expanded before and is still the expanded one). Version History stays outside the form and usable.
- **Edit old version:** still `RecipeForm` (version fields only, with selector). Both edits never create a version, never reorder, and keep `id` and `createdAt` (`{ ...version, ...formToVersionFields(formData) }` inside `map`).
- **Delete recipe** and **delete old version**, both with `window.confirm`. The current version can't be deleted on its own.
- **`activeForm`**: `null | {type:"create"} | {type:"newVersion",recipeId} | {type:"editRecipe",recipeId,wasExpanded} | {type:"editVersion",recipeId,versionId}`. One variable, so only one form can be open in the whole app.
- **One edit at a time:** while `activeForm.type` is `"editRecipe"` or `"editVersion"`, `blockIfEditing()` stops Edit (card), Edit (history), New Version, Delete (card and history) and `+ Create Recipe`: it shows `window.alert(\`Save / Cancel changes in ${editedRecipe.name} first.\`)` (the saved name) and does nothing else. Buttons are never disabled. View/Hide buttons and the history `<details>` aren't guarded.
- **Card:** name (h2), date as a muted subtitle, Bean, Method, 4-column summary, buttons View/Hide Recipe · New Version · Edit · Delete.
- **Expanded card:** `VersionDetails`. Row 1 *is* `VersionSummary`, so expanding only **adds** info; then row 2 and tasting notes (full width).
- **Version History:** `<details>` on every card (collapsed or expanded), with the previous versions newest first (`slice(0, -1).reverse()`). Each entry shows "Version N", date, summary or details, and View/Hide Version · Edit · Delete. Only one version is expanded app-wide (`expandedVersionId`).
- **Comparison highlighting:** see §5.

---

## 5. Established decisions

- **Versions:** New Version = a deliberate new experiment (history preserved). Edit = correct a recorded value (no new entry). `createdAt` is immutable.
- **Comparison:** every old version is compared to the **current** version only, never to its predecessor. *Why:* an old version's change from its predecessor no longer matters; what matters is "which old values match what I brew now?"
  - The current recipe is never highlighted.
  - Only **different** values are marked: amber `<mark className="changed-value">` (`#fde9b8`, bold), with a muted `.now-value` "now X" line under it (`#6f6461`). The "now X" text is the non-colour indicator.
  - Compared: dose, water, ratio, grind, temperature, brew time, yield, rating. **Not** compared: date, tasting notes.
  - Brew time is compared in **seconds** (180s = 3min). Ratio is compared as formatted text (`1:16.7`). Grind ignores case and surrounding spaces.
  - This **replaces** an older "green = same / red = different" idea. Don't reintroduce it.
- **Units, no space:** `17g`, `93°C`, `27s`, `3min`, `7.5/10`, `1:16.7`. All display formatting goes through `utils/format.js`; no unit strings in components. Form labels stay "Dose (g)" etc.
- **Rating:** 1–10 in 0.5 steps.
- **Layout:** in-card expansion, not a details page. Routing (`react-router-dom`, `/recipes/:id`) was tried and removed; don't reintroduce it unless the owner changes this. Grid columns are `repeat(4, minmax(0, 6rem))` (2 columns at ≤480px) so columns line up across the card and every history entry.
- **Version numbers are positional** (`previousVersions.length - index`), so they shift after deleting a version. Accepted for now.
- **Code structure:** pure helpers live in `src/utils/`, not in `App.jsx`. Importing from `App.jsx` would create circular imports and break the react-refresh lint rule.
- **`RecipeForm` + `key`:** the form's `useState(initialValues)` reads only on mount. Forms that share a spot get a `key` (`"newVersion"` / `"editRecipe"`; `version.id` in history) so switching always mounts a fresh form.
- **One-edit guard:** an alert, not disabled buttons (disabled buttons were confusing). One helper (`blockIfEditing`) so every button follows the same rule.
- **Editing vs display:** `VersionSummary` / `VersionDetails` / `VersionField` stay display-only (they handle comparison highlighting); all inline editing lives in `RecipeEditForm`.
- **`overflow-anchor: none`** on `body` (`index.css`): stops the browser's scroll anchoring from jumping the page when a card's content is swapped and grows (e.g. entering edit mode).
- **AI architecture (planned):** the API key **never** goes in the client. A small serverless function receives recipe data and calls the AI. The AI only suggests; the user applies changes via New Version. It must not make the project unnecessarily complex.

---

## 6. Known small edge cases (accepted, not bugs)

- Closing the `<details>` while editing a history version hides the form, but it stays open in `activeForm`.
- The guard only covers edit forms, so an open Create / New Version form can still be silently replaced (unsaved input lost).

---

## 7. Next steps (in order)

a. **Step 2: same inline edit mode for history versions:** reuse `RecipeEditForm` without name/bean/method, auto-expand via `expandedVersionId` with the same `wasExpanded` Cancel rule, same guard.
b. **Small UI fixes:** hide number-input spinner arrows in all forms; shorten the edit-form label to "Temp (°C)".
c. **Create Recipe form UI improvement:** discuss with the owner.
d. **Deploy:** the owner's first time, so walk through it step by step (likely Vercel or Netlify with auto-deploy from GitHub). No routing, so no special config is expected.
e. **"Ask AI about this recipe":** small serverless function holds the key; AI only suggests; the user applies via New Version; proper loading and error states (also the API-fundamentals learning goal).
f. **Design pass.**
g. **"Create recipe with AI".**

Later, unscheduled: search/filtering; replace `README.md` + portfolio presentation.

---

## 8. Known gaps (not decided yet; likely to come up in a–c)

- No form validation: empty number fields save as `0` (`Number("") === 0`), and a blank recipe can be created.
- `localStorage.setItem` in the save effect isn't wrapped in try/catch.
- The duplicate live-ratio formula now exists only in `RecipeForm` (`RecipeEditForm` uses `formatRatio`).
- The forms say "sec"/"min" while the cards show "s"/"min".
- `README.md` is still the Vite template.
- No test framework. Prettier isn't a dependency and there's no project Prettier config; the owner formats with VS Code's Prettier (v3, `trailingComma: "all"`, matching the code). Claude checks with `npx prettier --check` on changed files. `main.jsx` isn't Prettier-formatted, on purpose (`index.css` now is).

---

## 9. Gotchas & commands

```bash
npm run dev      # http://localhost:5173
npm run lint     # must pass clean
npm run build    # also catches import errors
```
- **Reset data:** DevTools → Application → Local Storage → `brew-it-recipes`, or run `localStorage.removeItem("brew-it-recipes")` and reload.
- `Array.prototype.reverse()` **mutates**: always `slice()` first. Never mutate state; use `map`/`filter`/spread.
- `onClick={() => fn(id)}`, never `onClick={fn(id)}` (that runs during render).
- Buttons always get an explicit `type="button"` / `type="submit"`.
- Adding state you don't use yet fails lint (`no-unused-vars`). Add it in the same step that uses it.
- Vertical margins collapse: the two `.version-grid`s in `VersionDetails` rely on this for an 8px gap equal to the row gap.
- `.recipe-card p { margin: 4px 0 }` also hits content inside cards. Use a more specific selector (as `.recipe-card .version-date` does).
- `StrictMode` runs effects twice in dev. This is harmless for the save effect.
- Swapping a card's content for something taller (like edit mode) can make the browser's scroll anchoring jump the page. `overflow-anchor: none` on `body` in `index.css` prevents this; keep it.

---

## 10. Note for the reviewer

- Run git with `--no-optional-locks` (a leftover `.git/index.lock` blocked git once).
- Review trigger phrase: **"review the uncommitted changes"**.
