# Brew It · design v1

Snapshot of the "Brew It Website" design canvas, version 240 ("Brew It v1 – final design").
This folder is the reference the app is built from. Don't edit it by hand; when the design changes, replace it with a new snapshot.

## What's here

| Path | What it is | Used by the app? |
|---|---|---|
| `styles/ds/tokens.css` | Design-system tokens (colours, spacing, radii, type, motion) as CSS custom properties | Yes, load 1st |
| `styles/ds/components/bundle.css` | Design-system components (`bi-*` classes: buttons, inputs, inset panels…). Also imports the Google Fonts (Archivo, Instrument Sans, IBM Plex Mono) | Yes, load 2nd |
| `styles/fonts.css` | `@font-face` for Chillax 600 + 700 | Yes, load 3rd |
| `styles/site.css` | The whole site layer: layout, cards, forms, Version History, Ask AI, search, navbar shrink, mobile rules | Yes, load last |
| `styles/ds/tokens.json` | Source of the tokens (for reference) | No |
| `fonts/` | Chillax-Semibold / Chillax-Bold (.woff2 + .woff) | Copy to `public/fonts/` |
| `images/logo.png` | The cups logo used in the navbar | Copy to `public/` or `src/assets/` |
| `reference/Main.dc.html` | The full interactive prototype: markup (which classes go where) + behaviour (state, scroll-driven title, delete animation, search filter) | Reference only |
| `reference/RecipeForm.dc.html` | Create / Edit / New Version / Edit Version form | Reference only |
| `reference/AskAi.dc.html` | Ask AI panel | Reference only |

The `reference/*.dc.html` files are canvas components, not React. Read them for markup and logic; they won't run on their own.

## Load order

```
tokens.css → components/bundle.css → fonts.css → site.css
```

`site.css` must load last, and its final "No sticky hover" block must stay at the end of the file.

## Behaviour to carry over (not visible in the CSS alone)

- **Cards:** give each card and each Version History row `key={id}`, so deleting one doesn't make the next replay its open animation.
- **Scroll handler** (title → compact navbar): only react to the page's own scroll. Ignore scroll events from inside inputs and textareas, or typing long text snaps the navbar back to the big title.
- **Ask AI button:** the glow is on while the panel is open (`aria-expanded="true"`), and also on hover on desktop with a mouse.
- **Search:** case-insensitive partial match on name, bean or method. Hidden when there are no recipes. Moves under the Create Recipe form while that form is open. "No recipes" when nothing matches.
