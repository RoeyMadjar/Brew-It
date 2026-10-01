# Brew It --- ChatGPT Project Context

## Purpose of this file

This file is a handoff document for continuing work on the **Brew It**
portfolio project in a new ChatGPT conversation.

It describes the project's current state, technical decisions, UX
decisions, learning goals, and planned next steps. It is intended to
give ChatGPT enough context to continue from the same point without
requiring the user to re-explain the project.

This is **not** a production specification and is not a Claude Code
instruction file.

------------------------------------------------------------------------

# 1. Project Overview

**Project name:** Brew It

**Type:** Portfolio project / personal coffee recipe journal

**Core idea:**\
Brew It lets a coffee hobbyist save brewing recipes, record the details
of each brew, rate the result, write tasting notes, and create new
versions of recipes as they experiment.

The project is intended to demonstrate real frontend development skills
rather than be a complete production SaaS product.

The user wants to be able to share the app with close people for
testing/use. It is acceptable for the current version to store data
locally in the browser and not support multiple users.

## Main UX goal

The app should feel:

-   simple
-   intuitive
-   easy to use
-   visually clean
-   useful for a coffee hobbyist who repeatedly changes brewing recipes

The user prefers **in-card expansion** for viewing recipe details rather
than navigating to a separate recipe details page.

------------------------------------------------------------------------

# 2. Tech Stack

Current stack:

-   React
-   JavaScript
-   Vite
-   CSS
-   Browser `localStorage`
-   Git / GitHub

The user is **not using TypeScript** for this project.

Routing was experimented with and deliberately removed.
`react-router-dom` was uninstalled.

AI integration is planned for later, but it is not currently
implemented.

------------------------------------------------------------------------

# 3. User's Learning Goals

This project is also a learning project.

The user wants to understand the code and concepts rather than blindly
accept generated code.

Preferred working style:

-   Explain concepts before making significant changes.
-   Keep implementation steps relatively small.
-   Avoid huge code dumps.
-   Explain why a solution works.
-   Use Claude Code as a pair programmer/mentor, not as an autonomous
    developer.
-   The user prefers Claude Code in manual/permission mode rather than
    automatic editing.
-   Keep Git history clean and use commits as meaningful checkpoints.

The user already has a good foundation in JavaScript and React, but is
still learning how to structure a larger application.

Topics the project is helping them learn include:

-   React state management
-   componentization
-   forms
-   derived values
-   localStorage
-   API fundamentals
-   loading/error states
-   Git/GitHub
-   refactoring
-   UX decisions
-   later, AI integration and a small backend endpoint

The user has learned routing conceptually, even though routing is not
part of the final Brew It UX.

------------------------------------------------------------------------

# 4. Current Data Model

A recipe represents the stable identity of a coffee recipe.

A recipe contains:

-   `id`
-   `name`
-   `bean`
-   `method`
-   `versions`

Each version contains:

-   `id`
-   `createdAt`
-   `doseGrams`
-   `waterGrams`
-   `grindSize`
-   `waterTempC`
-   `brewTimeSeconds`
-   `yieldGrams`
-   `rating`
-   `tastingNotes`

Example:

``` js
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
    }
  ]
}
```

## Important data-model decisions

### Recipe identity

These belong to the recipe itself:

-   name
-   bean
-   method

### Version-specific information

These belong to an individual version:

-   dose
-   water
-   grind size
-   temperature
-   brew time
-   yield
-   rating
-   tasting notes
-   creation date

### Ratio

Ratio is **derived**, not stored.

For example:

``` js
const ratio = waterGrams / doseGrams;
```

Displayed as something like:

``` text
1:16.7
```

This prevents the stored ratio from becoming inconsistent with
dose/water.

------------------------------------------------------------------------

# 5. Versioning Concept

Versioning is one of the central ideas of Brew It.

The user frequently changes coffee recipes while experimenting. They do
**not** want an old recipe to disappear when they make a change.

Therefore:

-   **New Version** = intentionally record a new brewing experiment.
-   **Edit** = correct/change an existing recipe or version.
-   Creating a new version must preserve all previous versions.
-   Editing an existing version must not create a new version.
-   A version's creation date should remain immutable when that version
    is edited.

For example:

``` text
Recipe
├── Version 1
├── Version 2
└── Version 3 (current)
```

The current/latest version is:

``` js
const latestVersion = recipe.versions[recipe.versions.length - 1];
```

Creating a new version adds it to the end:

``` js
{
  ...recipe,
  versions: [...recipe.versions, newVersion]
}
```

------------------------------------------------------------------------

# 6. Current Version History Logic

Previous versions are currently calculated with:

``` js
const previousVersions = recipe.versions.slice(0, -1).reverse();
```

This means:

-   remove the current/latest version
-   reverse the remaining versions
-   show the most recent previous version first

Version numbers are currently displayed based on their position in the
history.

Dates are stored as ISO strings and formatted using:

``` js
function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
```

------------------------------------------------------------------------

# 7. Planned Version Comparison Feature

This is an important future feature and should be preserved.

The user wants historical versions to visually show which values match
or differ from the **current/latest version**.

## Critical comparison rule

Every historical version must be compared **directly against the
current/latest version**.

Do NOT compare:

-   Version 2 → Version 1
-   Version 3 → Version 2

Instead:

-   Version 1 → Current Version
-   Version 2 → Current Version
-   Version 3 is the current version and therefore does not need
    comparison against itself.

### Why?

The user's reasoning is that if Version 3 exists, Version 2 was already
superseded.

What matters when looking back through history is:

> "Which values from an older version are the same as the recipe I am
> using now?"

For example:

``` text
Version 1:
Dose: 15g
Water: 250g
Temperature: 93°C

Version 2:
Dose: 16g
Water: 250g
Temperature: 91°C

Version 3 (current):
Dose: 17g
Water: 250g
Temperature: 93°C
```

When viewing history:

Version 1: - Dose → different from current - Water → same as current -
Temperature → same as current

Version 2: - Dose → different from current - Water → same as current -
Temperature → different from current

The fact that Version 2 changed something compared with Version 1 is not
what the user wants to highlight.

## Visual design

The user likes the idea of:

-   light green for values that match the current version
-   light red for values that differ from the current version

However, **color should not be the only indicator**.

The eventual implementation should also include another subtle
indicator, such as:

-   [x] / matching
-   ≠ / changed
-   or a short text label

This improves accessibility and makes the meaning obvious.

## Important

Do not implement this feature until the exact Version History UI has
been decided. The comparison behavior itself is already decided.

------------------------------------------------------------------------

# 8. Current UI Structure

The main page currently contains:

-   Brew It title
-   short tagline
-   Create Recipe button/form
-   list of recipe cards

Recipe cards are collapsed by default.

A collapsed card currently shows approximately:

``` text
Recipe Name
Bean: ...
Method: ...
Rating: ... / 5

[ View Recipe ] [ New Version ] [ Edit ] [ Delete ]
```

When expanded, it shows the latest version's details.

The intended expanded structure is approximately:

``` text
Recipe Name
Bean: ...
Method: ...
Rating: ...

Date: ...
Dose: ...
Water: ...
Ratio: ...
Grind size: ...
Temperature: ...
Brew time: ...
Yield: ...
Tasting notes: ...

[ Hide Recipe ] [ New Version ] [ Edit ] [ Delete ]
```

Only one recipe is currently tracked by `expandedRecipeId`.

------------------------------------------------------------------------

# 9. Current Recipe Card Behavior

The current state uses:

``` js
const [expandedRecipeId, setExpandedRecipeId] = useState(null);
```

The card determines whether it is expanded with:

``` js
const isExpanded = expandedRecipeId === recipe.id;
```

Clicking View Recipe toggles it:

``` js
setExpandedRecipeId(isExpanded ? null : recipe.id);
```

This in-card expansion was chosen intentionally instead of routing to a
details page.

------------------------------------------------------------------------

# 10. Recipe Form

A reusable `RecipeForm` component has been extracted.

Current props include:

``` js
function RecipeForm({
  title,
  submitLabel,
  initialValues,
  onSave,
  onCancel,
  showRecipeFields = true,
})
```

The form handles:

-   name
-   bean
-   method
-   dose
-   water
-   grind size
-   temperature
-   brew time
-   yield
-   rating
-   tasting notes

When creating a new version, the recipe identity fields are hidden
using:

``` js
showRecipeFields={false}
```

The new version form is initialized from the current/latest version.

Numeric form values are kept as strings while editing and converted to
numbers when saved.

This was intentionally done to avoid controlled/uncontrolled input
issues and to make form state predictable.

------------------------------------------------------------------------

# 11. Current Create Recipe Behavior

The Create Recipe form is hidden by default.

The page shows:

``` text
+ Create Recipe
```

When clicked, the form opens.

After saving:

-   a new recipe receives a random UUID
-   the first version also receives a random UUID
-   `createdAt` is set to the current ISO timestamp
-   numeric values are converted using `Number()`
-   the recipe is added to the recipes array
-   the Create Recipe form closes

------------------------------------------------------------------------

# 12. Current New Version Behavior

Clicking New Version opens a `RecipeForm` inside the relevant card.

The form is pre-populated using the latest version.

The user can change the values and save.

A new version is then appended to:

``` js
recipe.versions
```

The previous versions remain untouched.

The New Version form closes after saving.

------------------------------------------------------------------------

# 13. Edit Button Decision

The **Edit button should remain visible and enabled in the UI even
before its functionality is implemented.**

Do not remove it just because the implementation is not ready.

The eventual Edit functionality has specific requirements.

## Editing the current/latest recipe

Edit should allow changing **every parameter**, including:

Recipe identity:

-   name
-   bean
-   method

Latest version:

-   dose
-   water
-   grind size
-   temperature
-   brew time
-   yield
-   rating
-   tasting notes

## Editing a historical version

Every version in Version History should eventually have its own Edit
action.

It should allow editing every parameter of that version except:

-   `createdAt`

The date represents when that version was created and should remain
immutable.

## Edit vs New Version

This distinction is important:

### Edit

Used when the user wants to:

-   correct a mistake
-   fix a typo
-   correct an incorrect temperature
-   change an existing recorded value

Editing updates the existing object/version.

It does **not** create a new history entry.

### New Version

Used when the user wants to:

-   intentionally try a different recipe
-   record another brewing experiment
-   preserve the current recipe and create a new iteration

New Version creates a new version and preserves history.

------------------------------------------------------------------------

# 14. Rating Decision

Rating is intended to be:

-   minimum: 1
-   maximum: 10
-   increments: 0.5

The input should eventually use:

``` jsx
min="1"
max="10"
step="0.5"
```

The UI should display ratings as:

``` text
7.5 / 10
```

rather than:

``` text
7.5 / 5
```

------------------------------------------------------------------------

# 15. Date Decision

The current/latest version's creation date should be visible when the
recipe is expanded.

The date belongs to the version, not the recipe.

The displayed date should come from:

``` js
latestVersion.createdAt
```

Historical versions also display their own creation dates.

------------------------------------------------------------------------

# 16. Ratio in Version History

The ratio should be displayed in Version History entries as well.

It should continue to be calculated from:

``` js
waterGrams / doseGrams
```

and should not be stored as a separate field.

Example:

``` text
Dose: 15 g
Water: 250 g
Ratio: 1:16.7
```

------------------------------------------------------------------------

# 17. Current Version History UI --- Still Undecided

The exact compact design for Version History has **not** been finalized.

The user wants version history to be expandable/collapsible so that many
versions do not make the recipe card excessively long.

A possible summary discussed was:

``` text
Version 2
Date: ...
Dose: ...
Water: ...
Ratio: ...
Rating: ...

[ View Version ]
```

But this is only an idea, not a final decision.

Do not assume this exact design has been approved.

The user wants to decide what information should be visible before
implementing the comparison UI.

------------------------------------------------------------------------

# 18. Local Storage

Brew It currently persists recipes using browser `localStorage`.

Storage key:

``` js
const STORAGE_KEY = "brew-it-recipes";
```

Loading:

``` js
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
```

State initialization:

``` js
const [recipes, setRecipes] = useState(loadRecipes);
```

Persistence:

``` js
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}, [recipes]);
```

This means deleting or creating recipes persists across refreshes in the
same browser.

For now, browser-specific/local data is acceptable because Brew It is a
portfolio project rather than a production multi-user application.

------------------------------------------------------------------------

# 19. Routing Decision

Routing was implemented temporarily using `react-router-dom`.

The project had:

-   `/`
-   `/recipes/:id`
-   a `RecipeDetails.jsx` component

After testing the UX, the user decided that navigating to another page
for recipe details was not natural for Brew It.

The preferred interaction is:

> Expand the recipe card directly on the current page.

Therefore:

-   routing was removed
-   `RecipeDetails.jsx` was deleted
-   `react-router-dom` was uninstalled

Do not reintroduce routing for recipe details unless the user explicitly
changes this decision.

The user still learned the concept of routing through this experiment,
so it was useful even though it is not part of the final project.

------------------------------------------------------------------------

# 20. Delete Behavior

Recipe deletion currently works with:

``` js
setRecipes(recipes.filter((recipe) => recipe.id !== idToDelete));
```

Because recipes are persisted in localStorage, the deletion also
persists after refresh.

There is currently no confirmation dialog.

------------------------------------------------------------------------

# 21. Current CSS / Visual Direction

Current CSS is intentionally simple.

The app uses:

-   centered content
-   max width around 640px
-   white recipe cards
-   subtle beige/brown-ish borders
-   rounded corners
-   clean form layout
-   simple buttons
-   left-aligned card content

Current main CSS:

``` css
.app {
  max-width: 640px;
  margin: 0 auto;
  padding: 64px 16px;
  text-align: center;
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
  text-align: left;
}

.recipe-card {
  padding: 16px 20px;
  border: 1px solid #e0d6c8;
  border-radius: 8px;
  background-color: #fff;
}

.recipe-card h2 {
  margin-top: 0;
}

.recipe-card p {
  margin: 4px 0;
}

.recipe-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
  padding: 16px 20px;
  border: 1px solid #e0d6c8;
  border-radius: 8px;
  background-color: #fff;
  text-align: left;
}

.recipe-form h2 {
  margin: 0;
}

.recipe-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recipe-form input,
.recipe-form textarea {
  font: inherit;
  padding: 6px 8px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.recipe-form .ratio {
  margin: 0;
}

.version-history {
  margin-top: 16px;
}

.version-entry {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0d6c8;
}

.version-entry h3 {
  margin: 0 0 4px;
}
```

The visual design can be improved later. Functionality and clear UX are
currently more important than elaborate styling.

------------------------------------------------------------------------

# 22. AI Feature --- Future

An AI feature is planned for later:

> "Ask AI about this brew"

The idea is to give the AI information about the recipe and user
feedback and have it provide useful coffee-related observations or
suggestions.

Important architecture point:

The AI API key should **not** be exposed in the React client.

When AI is implemented, the project will likely need a small
backend/server endpoint that receives the relevant recipe data and calls
the AI API securely.

This should happen later, after the core frontend functionality is
solid.

The AI feature should not cause the project to become unnecessarily
complex.

------------------------------------------------------------------------

# 23. Future API Learning

The user wants to learn API fundamentals through this project.

They know the basic concepts from courses but have not independently
built a larger API-driven project.

Eventually the project may include an API integration, with proper:

-   loading states
-   error states
-   request handling
-   user feedback

These are learning goals as well as product features.

------------------------------------------------------------------------

# 24. Planned Project Roadmap

The broad roadmap is:

### Completed / mostly completed

1.  Initial React/Vite project
2.  Brew It basic UI
3.  Recipe data model
4.  Recipe display
5.  Grind size
6.  Delete recipe
7.  Recipe creation form
8.  Create recipe functionality
9.  Version data model
10. Reusable RecipeForm component
11. New Version functionality
12. Version History
13. Calculated ratio
14. Collapsed/expanded recipe cards
15. localStorage persistence
16. Routing experiment and deliberate removal

### Current / next

17. Small current UI/data improvements:

-   show current version date
-   change rating to 1--10
-   use 0.5 rating increments
-   show ratio in Version History
-   keep Edit button visible even before functionality exists

18. Decide the compact Version History UI.

19. Implement Edit functionality.

20. Implement Version History comparison against the current version.

21. Search/filtering.

22. API integration + loading/error states.

23. AI "Ask about this brew".

24. Refactoring and UI polish.

25. Deployment.

26. Portfolio presentation.

The roadmap is flexible. It should change as the user learns and as UX
problems become apparent.

------------------------------------------------------------------------

# 25. Important Product Philosophy

Brew It should remain a **focused portfolio project**.

Avoid prematurely adding:

-   authentication
-   complex backend architecture
-   PostgreSQL
-   social features
-   multi-user systems
-   complicated permissions
-   unnecessary state-management libraries
-   complex agent systems

The goal is to demonstrate that the user can build a thoughtful,
functional frontend application.

If a more complex architecture becomes necessary later, introduce it for
a concrete reason rather than simply because it is "more professional."

------------------------------------------------------------------------

# 26. Git / Development Philosophy

The user wants to maintain a clean Git history.

Meaningful changes should ideally be:

1.  implemented
2.  tested
3.  committed

The user has learned:

-   working tree
-   staging
-   commits
-   branches
-   restoring changes
-   removing files
-   Git as a safety net when using Claude Code

Claude Code should not make large unrelated changes without the user
understanding them.

------------------------------------------------------------------------

# 27. Current Important UX Decisions --- Quick Reference

These decisions should be treated as established unless the user
explicitly changes them.

  Decision                   Current choice
  -------------------------- -------------------------------------------------------
  Recipe details             Expand in card
  Routing                    Removed
  Recipe history             Version-based
  New Version                Creates new historical version
  Edit                       Modifies existing recipe/version
  Edit button                Keep visible even before implementation
  Version date               Immutable creation date
  Current version date       Show when expanded
  Rating                     1--10
  Rating increments          0.5
  Ratio                      Derived from water/dose
  Ratio in history           Yes
  Historical comparison      Compare every old version to current
  Comparison colors          Light green = same, light red = different
  Comparison accessibility   Add non-color indicator
  History compact UI         Not decided yet
  Persistence                localStorage
  Authentication             Not currently needed
  AI                         Planned later
  Backend                    Only when needed for features such as secure AI calls

------------------------------------------------------------------------

# 28. How to Continue From Here

The immediate conversation should probably continue by:

1.  Confirming the current Git/project state if needed.
2.  Implementing the small current UI/data changes.
3.  Testing them.
4.  Designing the compact Version History UI together.
5.  Implementing Edit carefully.
6.  Implementing the historical-vs-current comparison.
7.  Continuing through search/filtering, API work, AI, refactoring, and
    deployment.

The user prefers to make these decisions collaboratively rather than
having the entire application redesigned at once.

------------------------------------------------------------------------

# 29. User's Preferred Explanation Style

When helping with Brew It:

-   explain in simple language
-   explain the underlying React/JavaScript idea
-   avoid unnecessary jargon
-   avoid giant code blocks when a small change is enough
-   explain why a change is being made
-   distinguish clearly between "this is how it works" and "this is a
    design choice"
-   don't assume the user wants a more complex solution just because it
    is technically possible
-   encourage the user to test changes
-   use the existing project structure unless there is a clear reason to
    refactor

The user is actively learning frontend development, so understanding the
implementation is part of the project's success.
