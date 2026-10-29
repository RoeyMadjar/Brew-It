# Brew It — Session Handoff

Last updated: 2026-10-29 · HEAD: `9150873` · Branch: `design-v1` (the design v1 restyle; not merged into `main` yet. Solo project: otherwise commits go straight to `main`)

**This file is the single source of truth for the project.** If anything else (old notes, earlier chats) disagrees with it, this file wins. Read it first, then `src/App.jsx`.

---

## 1. Project & how the owner works

**Brew It** is a coffee recipe journal with versioning: the owner's first portfolio project as a junior frontend dev. A coffee hobbyist saves recipes, records each brew (dose, grind, temp, time, yield, rating, notes), and creates **new versions** while experimenting without losing old ones.

- **Feel:** simple, intuitive, visually clean. Shareable with close people for testing; browser-only data and no multi-user are fine for now.
- **Stack:** React 19, JavaScript (no TypeScript), Vite 8, plain CSS, `localStorage`, ESLint. No routing, no UI or state libraries. One Vercel serverless function (`api/`) calls the Anthropic API (Claude Haiku 5.5) with plain `fetch`, no SDK.
- **Design:** "Brew It v1 – final design". The snapshot lives in `design/` (read `design/README.md`; markup reference in `design/reference/Main.dc.html`, `RecipeForm.dc.html`, `AskAi.dc.html`). Its CSS is copied into `src/styles/`, fonts into `public/fonts/`, `logo.png` into `public/`. Markup and class names follow the reference files.
- **Live:** https://brewit-journal.vercel.app (includes Ask AI) · **Repo (public):** https://github.com/RoeyMadjar/Brew-It
- **Product philosophy:** stay a focused portfolio project. Don't add auth, databases, complex backend, social/multi-user features, state libraries or agent systems. Add complexity only for a concrete reason, never because it's "more professional".
- **Learning goals:** React state, componentization, forms, derived values, localStorage, refactoring, UX decisions, Git, API fundamentals (loading/error states) and AI behind a small backend (both done with Ask AI).

Workflow and answer style: see CLAUDE.md in the project root.

---

## 2. Architecture (`src/`, `api/`)

| File                            | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/ask.js`                    | Vercel serverless function. `POST /api/ask` with `{ recipe, question }` → `{ answer }` or `{ error }`. Web-standard handler (`export default { fetch(request) }`: Request in, Response out). Constants: `MODEL`, `MAX_TOKENS` 2500, `MAX_QUESTION_LENGTH` 500, `MAX_RECIPE_LENGTH` 20000, `SYSTEM_PROMPT` (§5; uses yield: the Units line, "dose, yield, temp…", pour amounts that add up to its yield; says that for filter methods (pour-over, French press, cold brew, moka) the yield is the water used). Status codes: 400 bad input, 405 not POST, 500 key missing, 502 Anthropic failed or returned no text. Keeps only `text` blocks of the response. `console.error` logs status + error type only (never the key)                                                                                                                                                                                                                                                                                                                                 |
| `main.jsx`                      | Mounts `<App />` in `StrictMode` (template style: single quotes, no semicolons; left as is). Imports the CSS in this order: `styles/ds/tokens.css`, `styles/ds/components/bundle.css`, `styles/fonts.css`, `styles/site.css`, `index.css`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `styles/`                       | Copied design CSS (§1): `ds/tokens.css` (colours, durations, easings), `ds/components/bundle.css` (`bi-*` components), `fonts.css`, `site.css` (the app's layout, card, form, Version History, Ask AI, About, animations). **Not Prettier-formatted** (kept as copied). Only additions: the autofill block in `site.css` (§5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `index.css`                     | `overflow-anchor: none` on `body` (§5), `overscroll-behavior-y: none` on `html` on desktop only (§5) and the rule hiding number-input spinner arrows. No hover rules (§5, "No sticky hover"). There is no `App.css`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `App.jsx`                       | All state and handlers, localStorage load/save, `sampleRecipes`, `emptyForm`. Renders `div.site#top` (+ `data-settling`) > `.bi-grain-page`, `<Header />`, `<main>`: `<Landing />`, `section.sec--recipes#recipes` (`rs-head` with h2 "Your recipes" + Create Recipe button, the Create card, `recipe-grid` of cards with Ask AI panel + Version History, "No recipes yet"), `<About />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `components/Header.jsx`         | Fixed `.head`: nav links "Your recipes" / "About", logo (link to `#top`), and the h1 "Brew It" that shrinks into the navbar on scroll. A `window` scroll/resize listener writes `--p` (progress 0 → 1) and `data-compact` straight to `.site` (no state: scroll fires too often)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `components/Landing.jsx`        | Display-only first screen (no props, no state): tagline "Your Personal Coffee Journal", buttons Your recipes (`#recipes`) · About (`#about`) · a disabled "Create with AI" with "Coming soon" under it (`aria-describedby`). `100svh` (site.css)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `components/MoreMenu.jsx`       | `{ isOpen, onToggle, onClose, children }`. The card's "More" button + `role="menu"`. Closes on outside click, Escape (focus back to More) and any item click (the menu `<div onClick={onClose}>` catches the bubbled click after the item's own handler, so confirms/alerts show with the menu still visible)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `components/About.jsx`          | Display-only `section.sec--about#about` (`data-ground="horizon"`): title, lead paragraph, 3 columns (versions, storage + what Ask AI sends to Anthropic's Claude, Ask AI / "Create with AI" coming soon), footer with credit ("Made with React and the Claude API") + GitHub · LinkedIn `bi-link`s (new tab, `rel="noopener noreferrer"`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `components/AskAi.jsx`          | Ask AI panel content. Props `{ recipe }`. State: `question`, `status` (`"idle"` \| `"loading"` \| `"error"` \| `"success"`), `answer`, `errorMessage`. Posts to `/api/ask`; see §4. The textarea grows via CSS `field-sizing: content`; without support (Firefox) `onChange` sets its height from `scrollHeight`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `components/RecipeEditForm.jsx` | The **only** form, used by all four: Create, Edit Recipe, New Version, Edit Version. `form.rf.rf--recipe` when `showRecipeFields`, else `rf--version`. Rows: Dose · Yield · Brew time, then Grind · Ratio · Temp · Rating, then Tasting notes. Props: `initialValues`, `onSave`, `onCancel`, `subtitle` (plain text under the name, optional), `showRecipeFields` (name/bean/method, default `true`), `submitLabel` (default `"Save Changes"`). String values; live read-only ratio via `formatRatio(formToVersionFields(formData))`; name input placeholder "Recipe's name"; brew time = number + sec/min `<select>`; `onWheel` blurs a focused number input so scrolling moves the page, not the value. The name input is `name="recipeTitle"` (`handleChange` maps it back to `name`); name, Bean, Method and Grind size have `autoComplete="off"` (§5). Validation (§4): `required` attributes; `handleChange` calls `setCustomValidity` on every `type="text"` input so whitespace-only fails; `handleSubmit` trims every string value before `onSave` |
| `components/VersionSummary.jsx` | `{ version, compareTo? }` → `dl.rc__summary`: Dose, Yield, Brew time, Rating                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `components/VersionDetails.jsx` | `{ version, compareTo? }` → row 2 only (`dl.rc__details`: Grind size, Ratio, `Temp<span className="lbl-rest">erature</span>`) + Tasting notes (`dl.rc__notes`). Callers render `VersionSummary` + a `.collapse` around `VersionDetails`, so expanding only adds info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `components/VersionField.jsx`   | One `bi-datafield` cell: `<dt>` label + `<dd>` with `ComparedValue`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `components/ComparedValue.jsx`  | `{ version, compareTo, isChanged, format }` → plain `span.bi-datafield__value`, or `bi-changed` (visually-hidden "Changed: " + value + "now **X**") when changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `utils/format.js`               | `formatDate`, `secondsToMinutes`, `formatBrewTime`, `formatGrams`, `formatTemp`, `formatRating`, `formatRatio`. All value formatters return "—" for `null` (`formatRatio` also for missing/0 dose or yield)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `utils/compare.js`              | `getChangedFields(version, current)` → `{ doseGrams, ratio, grindSize, waterTempC, brewTime, yieldGrams, rating }` booleans                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `utils/versionForm.js`          | `formToVersionFields(formData)` (form → saved fields, no id/createdAt) and `versionToFormValues(version)` (saved → form strings). Helpers: `toNumberOrNull` (`""` → `null`, else `Number`) and `toFormString` (`null` → `""`). Empty brew time → `null`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `utils/recipe.js`               | `getRecipeCreatedAt(recipe)` → `recipe.createdAt ?? recipe.versions[0].createdAt` (sort key, §3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `utils/motion.js`               | Timers matching the CSS animations: `DELETE_MS` 340 (`--duration-delete` 320), `FORM_LEAVE_MS` 170 (`--duration-fast` 160), `CREATE_CLOSE_MS` 280 and `AI_CLOSE_MS` 300 (`.collapse` closes in `--duration-base` 260), `SAVE_GROW_MS` 520, `NEW_CARD_MS` 2200 (`rc-saved` runs 2000ms). `prefersReducedMotion()`, `motionDelay(ms)` (0 with reduced motion), `afterNextFrame(cb)` (two `requestAnimationFrame`s)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

`eslint.config.js` (project root) gives `api/**/*.js` Node globals (`process`).
`public/favicon.ico` is the icon; `public/logo.png` is the navbar logo.

**State in `App`:**

- Data and forms: `recipes` (lazy init `useState(loadRecipes)`), `activeForm`, `expandedRecipeId`, `expandedVersionId`. `sortedRecipes` is derived at render (§3).
- Panels: `askAiRecipeId` (the one mounted Ask AI panel, or `null`) + `isAskAiShown` (its `data-open`) + `askAiTimerRef` (pending close timer); `openHistoryIds` (`{ [recipeId]: true }`, several Version Histories can be open); `openMenuId` (the one open More menu).
- Animations: `removingRecipeId` / `removingVersionId` (playing the delete animation, `is-removing`); `isSettling` (one frame after a delete, `data-settling` on `.site` turns transitions off so the items below don't replay animations); `isFormLeaving` (Cancel fade, `form-slot is-leaving`); `isCreateShown` (Create card `data-open`); `newRecipeId` + refs `createWrapperRef`, `newCardRef`, `savedFormHeightRef` (Save Recipe animation, run in a `useLayoutEffect`).

**Handlers:** `blockIfEditing` (the one-edit guard, §4), `handleStartCreate`, `closeCreate` (Create's Cancel), `closeFormAfterFade(afterClose)` (Cancel fade, used by the two below), `handleStartRecipeEdit`, `handleStartNewVersion`, `handleCancelRecipeEdit` (cancels both Edit Recipe and New Version), `handleStartVersionEdit`, `handleCancelVersionEdit`, `handleDelete`, `handleDeleteVersion`, `handleToggleAskAi`, `handleToggleHistory`, `handleCreateRecipe`, `handleSaveNewVersion`, `handleSaveRecipeEdit`, `handleSaveVersionEdit`.

---

## 3. Data model (persisted in `localStorage["brew-it-recipes"]`)

```js
Recipe:  { id, createdAt? /* ISO */, name, bean, method, versions: [Version, ...] }   // latest = LAST item
Version: { id, createdAt /* ISO */, doseGrams, grindSize /* string */,
           waterTempC, brewTimeSeconds, brewTimeUnit, yieldGrams, rating, tastingNotes }
```

- **Name/bean/method belong to the recipe**; everything else (including date, rating, notes) belongs to a version.
- `recipe.createdAt` is set only on recipes created from now on (same timestamp as their first version). **Missing = `versions[0].createdAt`** via `getRecipeCreatedAt` (older data and `sampleRecipes` have none). Storing it keeps the order stable if a recipe's oldest version is deleted.
- **Display order:** newest first by creation date. `sortedRecipes = recipes.slice().sort(...)` at render (ISO strings compared with `localeCompare`); the stored array order is unchanged (new recipes are still appended).
- `brewTimeSeconds` is **always seconds**. `brewTimeUnit` (`"seconds"` | `"minutes"`) is only a display preference; **missing = seconds** (older data and `sampleRecipes` have none).
- `waterTempC`, `brewTimeSeconds`, `yieldGrams`, `rating` can be **`null`** (optional field left empty), shown as "—". Old saved `0` values stay `0` (no migration). `doseGrams` is required, so always a number.
- Ratio = `yieldGrams / doseGrams`, **derived** (`formatRatio`), never stored, so it can't get out of sync.
- Old saved data may still have `waterGrams`; it's ignored (no migration, no testers' data).
- Form values are **strings** while editing (keeps inputs predictable). `versionToFormValues` / `formToVersionFields` convert in both directions.
- Changing the shape affects saved data in testers' browsers. Plan a fallback in the code (like `?? "seconds"`) for any new field.
- `sampleRecipes`: one recipe, "Morning Coffee" (San Rafael, Espresso; 16g → 40g (ratio 1:2.5), fine, 93°C, 28s, 8/10). Loads only when the storage key is **missing**. Deleting everything saves `[]`, so the samples don't come back (intended). Corrupt JSON falls back to the samples.

---

## 4. Implemented features

All four forms are inline `RecipeEditForm`s. The card (`article.rc.is-editing`) or history row (`vrow.is-editing`) shows the editing look. Name/bean/method forms (Create, Edit Recipe) are `rf--recipe` (warm inputs); version-only forms (New Version, Edit Version) are `rf--version` (cool inputs).

- **Create Recipe:** the "Create Recipe" button in the section heading (hidden while open) opens a new card at the **top** of the list: empty form, name placeholder "Recipe's name", today's date as subtitle (display only; `createdAt` is set on save), "Save Recipe" / "Cancel". The card mounts closed and opens a frame later (`.collapse`, `afterNextFrame`). Cancel collapses it, then removes it after `CREATE_CLOSE_MS`. Save swaps the form for the new card **in one render** (no collapse): the card grows from the form's measured height to its own (`useLayoutEffect`, before paint) and gets `is-new` for `NEW_CARD_MS` (border fade `rc-saved`). The effect only reacts to the wrapper's own `height` `transitionend` (child transitions bubble).
- **Edit current recipe:** Edit (More menu) expands the card; the form replaces everything above the Ask AI panel and Version History. Name, bean, method and every grid value become inputs; ratio stays read-only and updates live; the date stays plain text. Save Changes / Cancel sit where the actions were. Save keeps the card expanded.
- **New Version:** (More menu) expands the card. Name (h3), the subtitle "New version" and Bean / Method stay plain text; beside/below them the form (no recipe fields) prefilled from the latest version (including its unit), "Save Version" / "Cancel". The actions row is hidden. Save appends a new version (new id + `createdAt`) and keeps the card expanded on the new current version.
- **Edit old version:** in the history row, "Version N" and the date stay plain text; the form (no recipe fields) replaces the details and the row's actions. Auto-expands the version; Save keeps it expanded.
- **Save closes forms instantly; Cancel fades them out** (`form-slot is-leaving` for `FORM_LEAVE_MS`, then `activeForm` is cleared). The fade wraps Edit Recipe, New Version and Edit Version; Create collapses instead.
- **Cancel rule (Edit Recipe, New Version, Edit Version):** `wasExpanded` in `activeForm` remembers the state before opening; Cancel collapses only if it wasn't expanded before **and** it's still the expanded card/version (checked when Cancel is clicked, applied after the fade).
- Edits never create a version, never reorder, and keep `id` and `createdAt` (`{ ...version, ...formToVersionFields(formData) }` inside `map`).
- **Delete recipe**, **delete current version** and **delete old version**, all with `window.confirm`, all through `blockIfEditing()`. Confirm texts (all end with "This can't be undone."):
  - Recipe: `Delete "{name}" and all its {N} versions?` / `Delete "{name}" and its only version?`
  - Current: `Delete the current version of "{name}"?`
  - Old: `Delete Version {N} of "{name}"?` (N counted from the oldest)
- **Delete animations:** a deleted recipe card and a deleted old version slide out (`bi-removable is-removing`), then leave state after `DELETE_MS` (functional `setRecipes`), then one frame of `isSettling`. Deleting the **current** version is instant (no animation, as in the design prototype).
- **Deleting the current version:** the newest history version becomes current; the card's expanded state is kept; `expandedVersionId` resets if it was that version (functional update, since old-version deletes run after a timer). `handleDeleteVersion` handles both current and old versions (`isCurrent`).
- **`activeForm`**: `null | {type:"create"} | {type:"newVersion",recipeId,wasExpanded} | {type:"editRecipe",recipeId,wasExpanded} | {type:"editVersion",recipeId,versionId,wasExpanded}`. One variable, so only one form can be open in the whole app.
- **One form at a time:** while any form is open, `blockIfEditing()` stops Create Recipe, Edit (card and history), New Version and Delete (card and history) with a `window.alert` and does nothing else. Buttons are never disabled. While a delete, a Cancel fade or the Create open/close is animating, it returns `true` **silently** (no alert). Alert texts (the saved recipe name):
  - create: "Save / Cancel the new recipe first."
  - newVersion: "Save / Cancel the new version of {name} first."
  - editRecipe: "Save / Cancel changes in {name} first."
  - editVersion: "Save / Cancel changes in Version {N} of {name} recipe first." (N counted from the oldest version, matching the history numbers)
- **Version History toggle:** while one of _its_ versions is being edited, clicking it calls `blockIfEditing()` (alert) and doesn't toggle (`handleToggleHistory`). Other recipes' histories and View/Hide buttons aren't guarded.
- **Page:** fixed navbar (`Header`): links Your recipes · About, logo back to top; the big "Brew It" title shrinks into the navbar while scrolling. Landing → Your recipes → About.
- **Card:** `div.rc-wrap.bi-removable` > `article.rc`: name (h3), date as a muted subtitle, "Bean:" / "Method:", summary (Dose, Yield, Brew time, Rating). Actions: View/Hide Recipe · Ask AI/Hide AI · More (New Version · Edit · Delete Version · separator · Delete Recipe in danger style). Delete Version (current) is hidden when the recipe has only 1 version. No recipes and no open form → "No recipes yet".
- **Ask AI:** the "Ask AI" button (`aria-controls="ai-{id}"`; glows while open) toggles a panel between the card content and Version History. Open: mount closed, open a frame later. Close: collapse, then unmount after `AI_CLOSE_MS`; a ref'd timer is cleared when a panel opens, so an old timer can't close it. One panel open app-wide; it stays open while Edit or New Version is open. The panel (`section.bi-inset--ai.ai-panel`, head "Ask AI"):
  - "Your question" textarea (3 rows to start, grows with its text up to `60svh`, max 500 characters, required, placeholder "How can I make it less bitter?") and an Ask button.
  - While loading: the button is disabled, `aria-busy`, and says "Asking the AI…"; the textarea stays editable; a `bi-visually-hidden` `aria-live="polite"` region announces "Asking the AI…".
  - Success: the answer (line breaks kept, `white-space: pre-line`) and the muted note "AI suggestion. Try it as a New Version." with the spark.
  - Error (`bi-error` box with "!" icon and "Error" label, `role="alert"`): the server's `{ error }` message, or "Couldn't reach the AI. Check your connection and try again." for a network failure or a non-JSON response. Pressing Ask again retries. Details go to `console.error`.
  - A new question clears the old answer/error first.
- **Landing "Create with AI"** is still a disabled button with "Coming soon".
- **Expanded card:** `VersionSummary` stays; `VersionDetails` (row 2 + tasting notes) opens below it in a `.collapse`, so expanding only **adds** info.
- **Version History:** `section.bi-inset.rc__vh` on every card, closed by default, with a toggle button "Version History (N)" + chevron. Several can be open (`openHistoryIds`). Its body is `inert` while closed (the collapsed rows are only visually hidden; this keeps Tab out). Previous versions newest first (`slice(0, -1).reverse()`). Each row (`vrow`) shows "Version N" (h4), date, summary + `.collapse` details, and View/Hide Version · Edit · Delete Version (quiet small buttons). Only one version is expanded app-wide (`expandedVersionId`).
- **Animations and reduced motion:** all the design's animations are in (delete, Cancel fade, Create open/close, Save grow, `.collapse`, Ask AI, Version History). With reduced motion the CSS durations collapse and `motionDelay` waits 0. The `is-new` border fade still plays (§6).
- **Number inputs:** spinner arrows hidden in all forms (`index.css`); wheel blurs the input (see §2). Edit-form temperature label is "Temp (°C)".
- **No browser suggestions / autofill look:** see §5.
- **Comparison highlighting:** see §5.
- **Validation** (all four forms, native browser validation):
  - Required: name, bean, method, dose, grind size. Optional: temp, brew time, yield, rating, tasting notes.
  - Whitespace-only text is blocked ("Please fill out this field." via `setCustomValidity`); every string is trimmed on save.
  - `step="any"` on dose, yield, temp (decimals like 16.5 work); `min="0"` on dose.
  - Empty optional numbers save as `null` and show as "—".
- **One-page layout:** Landing → Your recipes → About, one long scrolling page. The landing links jump to `#recipes` / `#about` (smooth scroll unless reduced motion is on).
- **Deployed on Vercel** (Hobby), project name `brew-it`, domain `brewit-journal.vercel.app`. Every push to `main` auto-deploys. Default Vite settings (`npm run build` → `dist`).

---

## 5. Established decisions

- **Versions:** New Version = a deliberate new experiment (history preserved). Edit = correct a recorded value (no new entry). `createdAt` is immutable.
- **Comparison:** every old version is compared to the **current** version only, never to its predecessor. _Why:_ an old version's change from its predecessor no longer matters; what matters is "which old values match what I brew now?"
  - The current recipe is never highlighted.
  - Only **different** values are marked: `bi-changed` (design colours `--changed` / `--changed-bg`), with a visually-hidden "Changed: " and a muted "now **X**" line under it. The "now X" text is the non-colour indicator.
  - Compared: dose, ratio, grind, temperature, brew time, yield, rating. **Not** compared: date, tasting notes.
  - Brew time is compared in **seconds** (180s = 3min). Ratio is compared as formatted text (`1:16.7`). Grind ignores case and surrounding spaces.
  - This **replaces** an older "green = same / red = different" idea. Don't reintroduce it.
- **Units, no space:** `17g`, `93°C`, `27s`, `3min`, `7.5/10`, `1:16.7`. All display formatting goes through `utils/format.js`; no unit strings in components. Form labels stay "Dose (g)" etc. The design's `bi-unit` span (a gap before the unit) was declined.
- **Rating:** 1–10 in 0.5 steps.
- **Layout:** one long scrolling page with anchor links (`#top`, `#recipes`, `#about`); recipes use in-card expansion, not a details page. Routing (`react-router-dom`, `/recipes/:id`) was tried and removed; don't reintroduce it unless the owner changes this. Cards use `recipe-grid data-layout="list"` (every card full width; the design's `data-wide` was skipped).
- **Version numbers are positional** (`previousVersions.length - index`), so they shift after deleting a version. Accepted for now.
- **Recipe order is derived** (sorted copy at render), not stored, so it can't get out of sync and state is never mutated.
- **Code structure:** pure helpers live in `src/utils/`, not in `App.jsx`. Importing from `App.jsx` would create circular imports and break the react-refresh lint rule.
- **Forms + `key`:** the form's `useState(initialValues)` reads only on mount. Forms get a `key` (`"create"` / `"newVersion"` / `"editRecipe"`) so switching always mounts a fresh form; history forms are inside entries keyed by `version.id`.
- **One-form guard:** an alert, not disabled buttons (disabled buttons were confusing). One helper (`blockIfEditing`) so every button follows the same rule.
- **Editing vs display:** `VersionSummary` / `VersionDetails` / `VersionField` stay display-only (they handle comparison highlighting); all editing lives in `RecipeEditForm`.
- **Recipe-level vs version-level forms:** told apart only by input colour (`rf--recipe` / `rf--version` from `showRecipeFields`), no extra props.
- **Design restyle decisions:**
  - **Texts follow the design** (owner's call): tagline "Your Personal Coffee Journal", "Bean:" / "Method:", landing buttons Your recipes · About · Create with AI, "No recipes yet", "Version History (N)", the design's About copy.
  - **The "Brew It" h1 lives in the navbar** (`Header.jsx`), not the landing.
  - **More menu** for New Version / Edit / Delete Version / Delete Recipe (the 6-button row was crowded on phones). It closes on Escape (not in the prototype); no arrow-key navigation yet (small a11y gap, accepted).
  - **Delete current version has no animation** (same as the prototype).
  - **Timers in `utils/motion.js` must match the CSS durations;** if one changes, change both.
  - **"No sticky hover" block** (end of `site.css`) must be the **last** hover rule loaded. `index.css` loads after it, so it must not contain hover rules.
  - **`.site` must not get a React `style` prop or `data-compact`:** `Header` writes them to the DOM directly and React would overwrite them.
  - **Don't Prettier-format `src/styles/`** (copied design CSS). Prettier the app's `.jsx` and `index.css` as usual.
  - **Autofill:** a block in `site.css` (before "No sticky hover") keeps autofilled `.bi-input`s in the design's colours (`--ink` text, browser fill delayed with a very long transition, `:autofill` transparent).
  - **No browser suggestions:** `autoComplete="off"` on recipe name, Bean, Method and Grind size; the name input is `name="recipeTitle"` because browsers treat `name` as a person's name. `handleChange` is the only place reading values by input name. A future search input should also get `autoComplete="off"`.
  - **Version History uses `inert` while closed** (the `<details>` it replaced hid its rows from Tab; the design's collapse doesn't).
- **`overflow-anchor: none`** on `body` (`index.css`): stops the browser's scroll anchoring from jumping the page when a card's content is swapped and grows (e.g. entering edit mode).
- **No overscroll bounce on desktop:** `overscroll-behavior-y: none` on `html` inside `@media (hover: hover) and (pointer: fine)` (`index.css`). The trackpad's rubber-band bounce slid the page under the fixed "Brew It" title at the top. CSS can't limit it to one edge, so the bottom stops bouncing too. Phones keep the bounce (and Android's pull-to-refresh). Safari respects it on the page from version 16.
- **AI architecture:** the API key **never** goes in the client; `api/ask.js` holds it and calls the AI. The AI only suggests; the user applies changes via New Version.
- **AI placement:** "Ask AI" = a button on each recipe (the question is about one recipe). "Create with AI" (planned) = one chat section on the page. AI-made recipes are never saved automatically: the user reviews and clicks Save.
- **Ask AI decisions:**
  - **Anthropic Claude Haiku 5.5:** cheap, stable, hard monthly spend limit. Gemini's free tier was rejected (uses data for training, limits can change).
  - **Plain `fetch`, no SDK:** no new dependency; learning goal.
  - **Sends the whole recipe with all versions:** the AI sees what was already tried.
  - **Free-text question, one question → one answer:** no chat history; answers aren't saved.
  - **Thinking: adaptive at effort `"low"`** (no `thinking` field). Disabled thinking gave logic mistakes (reversed temperature advice). Low thinking ≈ $0.001/question; worth it because recruiters may test the site. `MAX_TOKENS` 2500 because thinking tokens count toward it (600 caused empty answers → 502).
  - **System prompt:** never invent the user's data, but general coffee knowledge is allowed; format by question type (tweak: cause + at most 2 changes; how-to: ≤ ~6 numbered steps); under ~120 words; plain text; never mention version ids; extraction direction rule (sour/thin/fast drawdown → finer/hotter; bitter/harsh/slow → coarser/cooler); off-topic → politely decline.
  - **No per-user question limit:** no accounts, would need a database. Cost control = Anthropic monthly spend limit ($5) + question/recipe/answer caps.
  - **Panel rendered outside the edit/display ternary** (keyed by `recipe.id`), so it stays mounted and keeps the answer while New Version or Edit is open: you read the suggestion while filling the form. Not guarded by `blockIfEditing` (it changes no data).
  - **One `status` variable instead of booleans:** impossible combos (loading + error) can't happen. Same idea as `activeForm`.
  - **Ask button disabled only while loading:** prevents duplicate requests. Differs on purpose from the one-form guard's alerts.
  - **Loading text lives on the button;** a visually-hidden `aria-live` region announces it to screen readers (`display: none` would hide it from them too). Errors use `role="alert"`.
  - **Closing the panel mid-request:** ignored, no AbortController; React ignores state updates after unmount (the panel unmounts `AI_CLOSE_MS` after closing).
- **Unfinished features:** a disabled button with "Coming soon", never a button that does nothing.
- **Empty optional numbers are `null`, not `0`:** `0` looks like a real measurement (e.g. "0/10").
- **No Water input:** filter brewers know the water poured (= yield for this app), espresso brewers know the yield, not the water; one field keeps the form simple and gives every method a ratio. Accepted trade-off: grounds absorb water, so the true beverage weight is less than the water for filter.
- **Whitespace check covers every `type="text"` input**, because all of them are required. A future optional text input needs this check changed (e.g. check `event.target.required`).
- **Smooth scrolling:** kept for now (now from `bundle.css`, only without reduced motion); revisit if long recipe lists make it feel like too much.
- **Deploys:** committing locally doesn't change the live site; pushing to `main` does.
- **AI API key:** lives in Vercel → Settings → Environment Variables (and the local `.env`), never in the code (§9).

---

## 6. Known small edge cases (accepted, not bugs)

- Edit Recipe's name input also shows the "Recipe's name" placeholder if the name is cleared.
- A dose of `0` is still allowed (`min="0"`); the ratio then shows "—".
- An old version can show "250g" with "now —" when the current version's field is empty.
- Empty tasting notes show as blank, not "—".
- Open Version Histories aren't saved: a reload closes them all.
- The `is-new` border fade after Save Recipe (`rc-saved`, fixed 2000ms) still plays with reduced motion; only the height grow and content fade-in are off.
- Deleting a recipe with its Ask AI panel open leaves a stale `askAiRecipeId` (harmless: no card shows it). The prototype clears it.
- Chrome may still offer autofill on a field it's sure about, despite `autoComplete="off"`.
- Each site address has its own localStorage (`localhost` and `brewit-journal.vercel.app` are separate), so testers start with the sample recipe.
- AI answers can still be wrong; the note says "AI suggestion".
- All server failures (including the spend limit being reached) show the same message; the real reason is only in the logs.
- A long answer could be cut off at `MAX_TOKENS` (unlikely with the word limit).
- Anyone can call `/api/ask` directly; the spend limit caps the cost.
- The question textarea grows up to `60svh`; longer questions scroll inside it.
- Deleting the current version assumes ≥2 versions (safe: the button is hidden with 1).

---

## 7. Next steps (in order)

The design pass (navbar, landing, card, More menu, forms, Version History, Ask AI, About, animations) is done on `design-v1`.

a. **Owner browser-tests the restyle**, then merges `design-v1` into `main` (which deploys it). Open test list:

- Navbar shrink; links/logo jump; typing long text in Ask AI doesn't snap the title back.
- Card expand/collapse; recipe delete animation; "No recipes yet".
- More menu: outside click, Escape, one open at a time, last card's menu over About.
- Forms: Create open/close, Cancel fades, validation, wheel blur; no browser suggestions; autofill colours.
- Save Recipe: no collapse, card grows in place, border fades ~2s.
- Version History: several open, Tab skips closed rows, guard while editing a version, old-version delete animation, current-version delete instant.
- Ask AI: open/close animation and glow, switching panels, textarea growth (Chrome + Firefox), loading/answer/error.
- About layout (3 columns on desktop, 1 on phones), links.
- Every animation with reduced motion on.

b. **"Create with AI":** one chat section; replaces "Coming soon".

Later, unscheduled: search/filtering (design has it; postponed; give its input `autoComplete="off"`); replace `README.md` + portfolio presentation.

---

## 8. Known gaps (not decided yet)

- `localStorage.setItem` in the save effect isn't wrapped in try/catch.
- The forms say "sec"/"min" while the cards show "s"/"min".
- The page can jump when a card changes size near the bottom of the page (`overflow-anchor: none`); not re-checked after the redesign.
- More menu has no arrow-key navigation.
- `README.md` is still the Vite template.
- No test framework. Prettier isn't a dependency and there's no project Prettier config; the owner formats with VS Code's Prettier (v3, `trailingComma: "all"`, matching the code). Claude checks with `npx prettier --check` on changed files. `main.jsx` and `src/styles/` aren't Prettier-formatted, on purpose (`index.css` is).

---

## 9. Gotchas & commands

```bash
npm run dev      # http://localhost:5173 (no /api)
vercel dev       # http://localhost:3000 (app + /api, needed for AI)
npm run lint     # must pass clean
npm run build    # also catches import errors
```

- **AI features need `vercel dev`;** `npm run dev` has no `/api` (404). Restart `vercel dev` after changing env files.
- **Local key:** `ANTHROPIC_API_KEY` in `.env` (`vercel dev` did NOT load it from `.env.local`). `.env*` and `.vercel` are gitignored. Don't run `vercel env pull` (it rewrites `.env.local`).
- **Live key:** Vercel → Settings → Environment Variables, Sensitive, Production + Preview. A new or changed variable needs a new deployment (Redeploy).
- **Function logs:** Vercel project → Logs.
- **Spend limit:** Anthropic Console → Settings → Billing → Spend limits. The Usage page shows tokens and cost per day.
- **Testing the API:** `curl` in a second terminal while `vercel dev` runs.
- **Reset data:** DevTools → Application → Local Storage → `brew-it-recipes`, or run `localStorage.removeItem("brew-it-recipes")` and reload.
- `Array.prototype.reverse()` and `sort()` **mutate**: always `slice()` first. Never mutate state; use `map`/`filter`/spread.
- `onClick={() => fn(id)}`, never `onClick={fn(id)}` (that runs during render).
- Buttons always get an explicit `type="button"` / `type="submit"`.
- Adding state you don't use yet fails lint (`no-unused-vars`). Add it in the same step that uses it.
- `StrictMode` runs effects twice in dev. This is harmless for the save effect.
- Swapping a card's content for something taller (like edit mode) can make the browser's scroll anchoring jump the page. `overflow-anchor: none` on `body` in `index.css` prevents this; keep it.
- **A CSS transition only plays when `data-open` changes on an element that already exists.** That's why Create and Ask AI mount closed and open with `afterNextFrame`.
- `transitionend` bubbles from children: check `event.target` and `propertyName` (as the Save Recipe effect does).
- Scroll events inside an input or textarea don't bubble to `window`, so `Header`'s listener ignores them (typing long text can't snap the title back).
- `.collapse` and `.bi-inset__body` hide content with `grid-template-rows: 0fr` + `overflow: hidden`: it's still focusable. Use `inert` (as Version History does) or unmount it.
- **Git on the owner's Mac** is Apple's (`/usr/bin/git`). Homebrew's Git was removed because it was broken (missing libcurl symbol; Homebrew has no fixed build for this Mac, "Tier 3"). Don't reinstall Git with Homebrew.

---

## 10. Note for the reviewer

- Run git with `--no-optional-locks` (a leftover `.git/index.lock` blocked git once).
- Never open or print `.env` / `.env.local` (they hold the API key); check variable names only.
- Review trigger phrase: **"review the uncommitted changes"**.
- The reviewer (Claude in the desktop app) answers in simple, user-friendly language and writes the prompts for Claude Code.
- The reviewer never edits files. It only writes prompts for Claude Code (for a fresh session: tell it to read HANDOFF.md first) and gives a commit message for every suggested commit.
- The reviewer's shell runs on Linux, so `npm run build` and Prettier can't run there (Mac `node_modules`); `npm run lint` can. Claude Code runs on the Mac and runs `npx prettier --check` on changed files.
- CLAUDE.md: no plan mode; every edit is approved one at a time.
- CLAUDE.md says Claude never commits. The owner made an exception only for the design restyle (one commit per component on `design-v1`); it doesn't carry over to other work.
