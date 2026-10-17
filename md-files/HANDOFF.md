# Brew It — Session Handoff

Last updated: 2026-10-17 · HEAD: `9352e83` · Branch: `main` (solo project, commits go straight to `main`)

**This file is the single source of truth for the project.** If anything else (old notes, earlier chats) disagrees with it, this file wins. Read it first, then `src/App.jsx`.

---

## 1. Project & how the owner works

**Brew It** is a coffee recipe journal with versioning: the owner's first portfolio project as a junior frontend dev. A coffee hobbyist saves recipes, records each brew (dose, water, grind, temp, time, yield, rating, notes), and creates **new versions** while experimenting without losing old ones.

- **Feel:** simple, intuitive, visually clean. Shareable with close people for testing; browser-only data and no multi-user are fine for now.
- **Stack:** React 19, JavaScript (no TypeScript), Vite 8, plain CSS, `localStorage`, ESLint. No routing, no UI or state libraries. One Vercel serverless function (`api/`) calls the Anthropic API (Claude Haiku 5.5) with plain `fetch`, no SDK.
- **Live:** https://brewit-journal.vercel.app (includes Ask AI) · **Repo (public):** https://github.com/RoeyMadjar/Brew-It
- **Product philosophy:** stay a focused portfolio project. Don't add auth, databases, complex backend, social/multi-user features, state libraries or agent systems. Add complexity only for a concrete reason, never because it's "more professional".
- **Learning goals:** React state, componentization, forms, derived values, localStorage, refactoring, UX decisions, Git, API fundamentals (loading/error states) and AI behind a small backend (both done with Ask AI).

Workflow and answer style: see CLAUDE.md in the project root.

---

## 2. Architecture (`src/`, `api/`)

| File | What it does |
|---|---|
| `api/ask.js` | Vercel serverless function. `POST /api/ask` with `{ recipe, question }` → `{ answer }` or `{ error }`. Web-standard handler (`export default { fetch(request) }`: Request in, Response out). Constants: `MODEL`, `MAX_TOKENS` 2500, `MAX_QUESTION_LENGTH` 500, `MAX_RECIPE_LENGTH` 20000, `SYSTEM_PROMPT` (§5). Status codes: 400 bad input, 405 not POST, 500 key missing, 502 Anthropic failed or returned no text. Keeps only `text` blocks of the response. `console.error` logs status + error type only (never the key) |
| `main.jsx` | Mounts `<App />` in `StrictMode` (template style: single quotes, no semicolons; left as is) |
| `index.css` | Global font, text `#3b2f2f`, background `#faf7f2`, `overflow-anchor: none` on `body` (see §5), `scroll-behavior: smooth` on `html` inside `@media (prefers-reduced-motion: no-preference)` (reduced-motion users get instant jumps) |
| `App.jsx` | All state and handlers, localStorage load/save, `sampleRecipes`, `emptyForm`. Renders `<main className="app">`: `<Landing />`, then `<section id="recipes">` (h2 "Your recipes", Create Recipe button, the Create card, recipe cards + Version History), then `<About />` |
| `App.css` | All app styles (landing, `.button-link`, about, cards, edit forms, grid, highlight, edit mode, Version History frame, `.ask-ai*` panel, `.visually-hidden` utility) |
| `components/Landing.jsx` | Display-only first screen (no props, no state): h1 "Brew It", tagline "Your personal coffee journal", "Your recipes" (`#recipes`) and "About" (`#about`) links styled as buttons (`.button-link`), and a disabled "Create with AI" button with "Coming soon" under it (linked via `aria-describedby`). `min-height: calc(100vh - 64px)` (`.app` has 64px top padding), content centered |
| `components/About.jsx` | Display-only About section (`id="about"`, no props, no state): what the app does, versions, storage (browser-only; Ask AI sends that one recipe + question to Anthropic's Claude), Ask AI ("Create with AI" coming soon), author ("Made with React and the Claude API") + GitHub · LinkedIn links (new tab, `rel="noopener noreferrer"`) |
| `components/AskAi.jsx` | Ask AI panel. Props `{ recipe }`. State: `question`, `status` (`"idle"` \| `"loading"` \| `"error"` \| `"success"`), `answer`, `errorMessage`. Posts to `/api/ask`; see §4 |
| `components/RecipeEditForm.jsx` | The **only** form, used by all four: Create, Edit Recipe, New Version, Edit Version. A `<form>` laid out like the expanded card, reusing the `version-grid` / `version-notes` / `card-actions` CSS. Props: `initialValues`, `onSave`, `onCancel`, `subtitle` (plain text under the name, optional), `showRecipeFields` (name/bean/method, default `true`), `submitLabel` (default `"Save Changes"`). Adds the `recipe-level-form` class (darker inputs) when `showRecipeFields` is true. String values; live read-only ratio via `formatRatio(formToVersionFields(formData))`; name input placeholder "Recipe's name"; brew time = number + sec/min `<select>`; `onWheel` blurs a focused number input so scrolling moves the page, not the value. Validation (§4): `required` attributes; `handleChange` calls `setCustomValidity` on every `type="text"` input so whitespace-only fails; `handleSubmit` trims every string value before `onSave` |
| `components/VersionSummary.jsx` | `{ version, compareTo? }` → 4-column grid: Dose, Yield, Brew time, Rating |
| `components/VersionDetails.jsx` | `{ version, compareTo? }` → `VersionSummary` (row 1) + Grind size, Water, Ratio, Temperature (row 2) + Tasting notes |
| `components/VersionField.jsx` | One grid cell: `<dt>` label + `<dd>` with `ComparedValue` |
| `components/ComparedValue.jsx` | `{ version, compareTo, isChanged, format }` → plain text, or `<mark>` value + "now X" when changed |
| `utils/format.js` | `formatDate`, `secondsToMinutes`, `formatBrewTime`, `formatGrams`, `formatTemp`, `formatRating`, `formatRatio`. All value formatters return "—" for `null` (`formatRatio` also for missing/0 dose or water) |
| `utils/compare.js` | `getChangedFields(version, current)` → `{ doseGrams, waterGrams, ratio, grindSize, waterTempC, brewTime, yieldGrams, rating }` booleans |
| `utils/versionForm.js` | `formToVersionFields(formData)` (form → saved fields, no id/createdAt) and `versionToFormValues(version)` (saved → form strings). Helpers: `toNumberOrNull` (`""` → `null`, else `Number`) and `toFormString` (`null` → `""`). Empty brew time → `null` |
| `utils/recipe.js` | `getRecipeCreatedAt(recipe)` → `recipe.createdAt ?? recipe.versions[0].createdAt` (sort key, §3) |

`eslint.config.js` (project root) gives `api/**/*.js` Node globals (`process`).

**State in `App`:** `recipes` (lazy init `useState(loadRecipes)`), `activeForm`, `expandedRecipeId`, `expandedVersionId`, `askAiRecipeId` (the one open Ask AI panel, or `null`). `sortedRecipes` is derived at render (§3).
**Handlers:** `blockIfEditing` (the one-edit guard, §4), `openForm` (guard + `setActiveForm`, used by Create), `handleStartRecipeEdit`, `handleStartNewVersion`, `handleCancelRecipeEdit` (cancels both Edit Recipe and New Version), `handleStartVersionEdit`, `handleCancelVersionEdit`, `handleDelete`, `handleDeleteVersion`, `handleCreateRecipe`, `handleSaveNewVersion`, `handleSaveRecipeEdit`, `handleSaveVersionEdit`.

---

## 3. Data model (persisted in `localStorage["brew-it-recipes"]`)

```js
Recipe:  { id, createdAt? /* ISO */, name, bean, method, versions: [Version, ...] }   // latest = LAST item
Version: { id, createdAt /* ISO */, doseGrams, waterGrams, grindSize /* string */,
           waterTempC, brewTimeSeconds, brewTimeUnit, yieldGrams, rating, tastingNotes }
```
- **Name/bean/method belong to the recipe**; everything else (including date, rating, notes) belongs to a version.
- `recipe.createdAt` is set only on recipes created from now on (same timestamp as their first version). **Missing = `versions[0].createdAt`** via `getRecipeCreatedAt` (older data and `sampleRecipes` have none). Storing it keeps the order stable if a recipe's oldest version is deleted.
- **Display order:** newest first by creation date. `sortedRecipes = recipes.slice().sort(...)` at render (ISO strings compared with `localeCompare`); the stored array order is unchanged (new recipes are still appended).
- `brewTimeSeconds` is **always seconds**. `brewTimeUnit` (`"seconds"` | `"minutes"`) is only a display preference; **missing = seconds** (older data and `sampleRecipes` have none).
- `waterGrams`, `waterTempC`, `brewTimeSeconds`, `yieldGrams`, `rating` can be **`null`** (optional field left empty), shown as "—". Old saved `0` values stay `0` (no migration). `doseGrams` is required, so always a number.
- Ratio is **derived** (`formatRatio`), never stored, so it can't get out of sync.
- Form values are **strings** while editing (keeps inputs predictable). `versionToFormValues` / `formToVersionFields` convert in both directions.
- Changing the shape affects saved data in testers' browsers. Plan a fallback in the code (like `?? "seconds"`) for any new field.
- `sampleRecipes`: one recipe, "Morning Coffee" (San Rafael, Espresso; 16g → 40g, fine, 93°C, 28s, 8/10). Loads only when the storage key is **missing**. Deleting everything saves `[]`, so the samples don't come back (intended). Corrupt JSON falls back to the samples.

---

## 4. Implemented features

All four forms are inline `RecipeEditForm`s inside a card with the amber `editing` border. Name/bean/method forms (Create, Edit Recipe) have darker sand inputs (`#f3dfc1`); version-only forms (New Version, Edit Version) keep the pale `#fff8ec`.

- **Create Recipe:** the "Create Recipe" button (hidden while open) opens a new card at the **top** of the list: empty form, name placeholder "Recipe's name", today's date as subtitle (display only; `createdAt` is set on save), "Save Recipe" / "Cancel". Save adds the recipe and closes; Cancel closes.
- **Edit current recipe:** Edit expands the card; the form replaces everything above Version History. Name, bean, method and every grid value become inputs; ratio stays read-only and updates live; the date stays plain text. Save Changes / Cancel sit where the 4 buttons were. Save keeps the card expanded.
- **New Version:** expands the card. Name (h2), the subtitle "New version" and Bean / Method stay plain text; below them the form (no recipe fields) prefilled from the latest version (including its unit), "Save Version" / "Cancel". The 4 buttons are hidden. Save appends a new version (new id + `createdAt`) and keeps the card expanded on the new current version.
- **Edit old version:** in the history entry, "Version N" and the date stay plain text; the form (no recipe fields) replaces the details and the View · Edit · Delete row. Auto-expands the version; Save keeps it expanded. The entry gets the amber border on a white background.
- **Cancel rule (Edit Recipe, New Version, Edit Version):** `wasExpanded` in `activeForm` remembers the state before opening; Cancel collapses only if it wasn't expanded before **and** it's still the expanded card/version.
- Edits never create a version, never reorder, and keep `id` and `createdAt` (`{ ...version, ...formToVersionFields(formData) }` inside `map`).
- **Delete recipe** and **delete old version**, both with `window.confirm`. The current version can't be deleted on its own.
- **`activeForm`**: `null | {type:"create"} | {type:"newVersion",recipeId,wasExpanded} | {type:"editRecipe",recipeId,wasExpanded} | {type:"editVersion",recipeId,versionId,wasExpanded}`. One variable, so only one form can be open in the whole app.
- **One form at a time:** while any form is open, `blockIfEditing()` stops Create Recipe, Edit (card and history), New Version and Delete (card and history) with a `window.alert` and does nothing else. Buttons are never disabled. Alert texts (the saved recipe name):
  - create: "Save / Cancel the new recipe first."
  - newVersion: "Save / Cancel the new version of {name} first."
  - editRecipe: "Save / Cancel changes in {name} first."
  - editVersion: "Save / Cancel changes in Version {N} of {name} recipe first." (N counted from the oldest version, matching the history numbers)
- **Version History `<summary>`:** while one of *its* versions is being edited, clicking it shows the guard alert and `preventDefault()` keeps it open. Other recipes' histories and View/Hide buttons aren't guarded.
- **Card:** name (h2), date as a muted subtitle, Bean, Method, 4-column summary, buttons View/Hide Recipe · New Version · Ask AI/Hide AI · Edit · Delete.
- **Ask AI:** the "Ask AI" button toggles a panel between the card content and Version History (same tinted frame as the history). One panel open app-wide; it stays open while Edit or New Version is open. The panel:
  - "Your question" textarea (3 rows, max 500 characters, required, placeholder "How can I make it less bitter?") and an Ask button.
  - While loading: the button is disabled and says "Asking the AI…"; the textarea stays editable; a visually-hidden `aria-live="polite"` region announces "Asking the AI…".
  - Success: the answer (line breaks kept, `white-space: pre-line`) and the muted note "AI suggestion. Try it as a New Version."
  - Error (`role="alert"`, muted red `#a63a2f`, ~5.6:1 on `#f5efe6`): the server's `{ error }` message, or "Couldn't reach the AI. Check your connection and try again." for a network failure or a non-JSON response. Pressing Ask again retries. Details go to `console.error`.
  - A new question clears the old answer/error first.
- **Landing "Create with AI"** is still a disabled button with "Coming soon".
- **Expanded card:** `VersionDetails`. Row 1 *is* `VersionSummary`, so expanding only **adds** info; then row 2 and tasting notes (full width).
- **Version History:** `<details>` on every card in a tinted frame (`#f5efe6`, border, rounded), with the previous versions newest first (`slice(0, -1).reverse()`), separated by lines. Each entry shows "Version N", date, summary or details, and View/Hide Version · Edit · Delete. Only one version is expanded app-wide (`expandedVersionId`).
- **Number inputs:** spinner arrows hidden in all forms (CSS); wheel blurs the input (see §2). Edit-form temperature label is "Temp (°C)".
- **Comparison highlighting:** see §5.
- **Validation** (all four forms, native browser validation):
  - Required: name, bean, method, dose, grind size. Optional: water, temp, brew time, yield, rating, tasting notes.
  - Whitespace-only text is blocked ("Please fill out this field." via `setCustomValidity`); every string is trimmed on save.
  - `step="any"` on dose, water, yield, temp (decimals like 16.5 work); `min="0"` on dose.
  - Empty optional numbers save as `null` and show as "—".
- **One-page layout:** Landing → Your recipes → About, one long scrolling page. The landing links jump to `#recipes` / `#about` (smooth scroll unless reduced motion is on).
- **Deployed on Vercel** (Hobby), project name `brew-it`, domain `brewit-journal.vercel.app`. Every push to `main` auto-deploys. Default Vite settings (`npm run build` → `dist`).

---

## 5. Established decisions

- **Versions:** New Version = a deliberate new experiment (history preserved). Edit = correct a recorded value (no new entry). `createdAt` is immutable.
- **Comparison:** every old version is compared to the **current** version only, never to its predecessor. *Why:* an old version's change from its predecessor no longer matters; what matters is "which old values match what I brew now?"
  - The current recipe is never highlighted.
  - Only **different** values are marked: `<mark className="changed-value">` (`#ffd46b`, bold, ~9:1), with a muted `.now-value` "now X" line under it (`#6f6461`). The "now X" text is the non-colour indicator.
  - Compared: dose, water, ratio, grind, temperature, brew time, yield, rating. **Not** compared: date, tasting notes.
  - Brew time is compared in **seconds** (180s = 3min). Ratio is compared as formatted text (`1:16.7`). Grind ignores case and surrounding spaces.
  - This **replaces** an older "green = same / red = different" idea. Don't reintroduce it.
- **Units, no space:** `17g`, `93°C`, `27s`, `3min`, `7.5/10`, `1:16.7`. All display formatting goes through `utils/format.js`; no unit strings in components. Form labels stay "Dose (g)" etc.
- **Rating:** 1–10 in 0.5 steps.
- **Layout:** one long scrolling page with anchor links (`#recipes`, `#about`); recipes use in-card expansion, not a details page. Routing (`react-router-dom`, `/recipes/:id`) was tried and removed; don't reintroduce it unless the owner changes this. Grid columns are `repeat(4, minmax(0, 6rem))` (2 columns at ≤480px) so columns line up across the card and every history entry.
- **Version numbers are positional** (`previousVersions.length - index`), so they shift after deleting a version. Accepted for now.
- **Recipe order is derived** (sorted copy at render), not stored, so it can't get out of sync and state is never mutated.
- **Code structure:** pure helpers live in `src/utils/`, not in `App.jsx`. Importing from `App.jsx` would create circular imports and break the react-refresh lint rule.
- **Forms + `key`:** the form's `useState(initialValues)` reads only on mount. Forms get a `key` (`"create"` / `"newVersion"` / `"editRecipe"`) so switching always mounts a fresh form; history forms are inside entries keyed by `version.id`.
- **One-form guard:** an alert, not disabled buttons (disabled buttons were confusing). One helper (`blockIfEditing`) so every button follows the same rule.
- **Editing vs display:** `VersionSummary` / `VersionDetails` / `VersionField` stay display-only (they handle comparison highlighting); all editing lives in `RecipeEditForm`.
- **Recipe-level vs version-level forms:** told apart only by input colour (`recipe-level-form` class from `showRecipeFields`), no extra props.
- **`overflow-anchor: none`** on `body` (`index.css`): stops the browser's scroll anchoring from jumping the page when a card's content is swapped and grows (e.g. entering edit mode).
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
  - **Closing the panel mid-request:** ignored, no AbortController; React ignores state updates after unmount.
- **Unfinished features:** a disabled button with "Coming soon", never a button that does nothing.
- **Empty optional numbers are `null`, not `0`:** `0` looks like a real measurement (e.g. "0/10").
- **Whitespace check covers every `type="text"` input**, because all of them are required. A future optional text input needs this check changed (e.g. check `event.target.required`).
- **Smooth scrolling:** kept for now; revisit if long recipe lists make it feel like too much.
- **Deploys:** committing locally doesn't change the live site; pushing to `main` does.
- **AI API key:** lives in Vercel → Settings → Environment Variables (and the local `.env`), never in the code (§9).

---

## 6. Known small edge cases (accepted, not bugs)

- Edit Recipe's name input also shows the "Recipe's name" placeholder if the name is cleared.
- The browser's default grey placeholder on the darker `#f3dfc1` inputs is under 4.5:1 contrast.
- A dose of `0` is still allowed (`min="0"`); the ratio then shows "—".
- An old version can show "250g" with "now —" when the current version's field is empty.
- Empty tasting notes show as blank, not "—".
- `.button-link` copies Chrome's default button look; it may differ in Safari/Firefox.
- The landing's `calc(100vh - 64px)` can be slightly taller than the visible screen on phones (`100svh` would fix it).
- Each site address has its own localStorage (`localhost` and `brewit-journal.vercel.app` are separate), so testers start with the sample recipe.
- AI answers can still be wrong; the note says "AI suggestion".
- All server failures (including the spend limit being reached) show the same message; the real reason is only in the logs.
- A long answer could be cut off at `MAX_TOKENS` (unlikely with the word limit).
- Anyone can call `/api/ask` directly; the spend limit caps the cost.
- The question textarea is 3 rows; long questions scroll inside it.

---

## 7. Next steps (in order)

a. **Design pass**, including:
   - A sticky navigation bar (Brew It · Your recipes · About) that stays on screen, to jump anywhere and back to the top.
   - Recipe card names from `h2` to `h3` (they're now under the "Your recipes" `h2`).
   - Real styling for the landing and buttons.
   - `100svh` on the landing.
   - A question textarea that grows with its content.
   - Ask AI panel styling.
   - Replace the temporary favicon (`public/favicon.svg`).
b. **"Create with AI":** one chat section; replaces "Coming soon".

Later, unscheduled: search/filtering; replace `README.md` + portfolio presentation.

---

## 8. Known gaps (not decided yet)

- `localStorage.setItem` in the save effect isn't wrapped in try/catch.
- The forms say "sec"/"min" while the cards show "s"/"min".
- The page can jump when a card changes size near the bottom of the page (`overflow-anchor: none`); revisit after the redesign.
- `README.md` is still the Vite template.
- No test framework. Prettier isn't a dependency and there's no project Prettier config; the owner formats with VS Code's Prettier (v3, `trailingComma: "all"`, matching the code). Claude checks with `npx prettier --check` on changed files. `main.jsx` isn't Prettier-formatted, on purpose (`index.css` now is).

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
- Vertical margins collapse: the two `.version-grid`s in `VersionDetails` rely on this for an 8px gap equal to the row gap.
- `.recipe-card p { margin: 4px 0 }` also hits content inside cards. Use a more specific selector (as `.recipe-card .version-date` does).
- `StrictMode` runs effects twice in dev. This is harmless for the save effect.
- Swapping a card's content for something taller (like edit mode) can make the browser's scroll anchoring jump the page. `overflow-anchor: none` on `body` in `index.css` prevents this; keep it.
- Inside `<details>`, `preventDefault()` on the `<summary>` click cancels the native toggle (used by the Version History guard).
- **Git on the owner's Mac** is Apple's (`/usr/bin/git`). Homebrew's Git was removed because it was broken (missing libcurl symbol; Homebrew has no fixed build for this Mac, "Tier 3"). Don't reinstall Git with Homebrew.

---

## 10. Note for the reviewer

- Run git with `--no-optional-locks` (a leftover `.git/index.lock` blocked git once).
- Never open or print `.env` / `.env.local` (they hold the API key); check variable names only.
- Review trigger phrase: **"review the uncommitted changes"**.
- The reviewer (Claude in the desktop app) answers in simple, user-friendly language and writes the prompts for Claude Code.
- The reviewer's shell runs on Linux, so `npm run build` and Prettier can't run there (Mac `node_modules`); `npm run lint` can.
