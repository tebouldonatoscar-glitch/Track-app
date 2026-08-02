# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

NutriScan: a personal nutrition-tracking PWA. Scan a barcode (Open Food Facts), browse a
built-in generic-foods database, describe/photograph a meal or a nutrition label for an AI
estimate, compose multi-ingredient recipes, and track history/goals/trends — all 100% client-side.
No backend: `next.config.js` sets `output: "export"`, and storage is IndexedDB + localStorage only.
See README.md for the full feature list and the GitHub Pages deployment rationale.

## Commands

```bash
npm run dev              # http://localhost:3000
npm run build             # static export -> out/
npm run lint
npm test                  # vitest run (all unit tests)
npx vitest run tests/unit/<file>.test.ts   # a single test file
npm run test:watch        # vitest watch mode
npm run test:e2e          # playwright e2e (mocks the camera feed and the OFF API)
```

Path alias: `@/*` → `src/*` (configured in both `tsconfig.json` and `vitest.config.ts`).

## Architecture

### Product resolution order

Anything that loads a product by barcode/id (`src/app/product/page.tsx`) tries, in order:
1. `findBuiltinFood(id)` — `src/lib/data/genericFoods.ts`, ids prefixed `builtin-`
2. `getManualProduct(barcode)` — IndexedDB `manualProducts` store, for products added via `/add`,
   `/add/drink`, or `/add/label` (ids prefixed `generic-` when there's no real barcode)
3. `fetchProductByBarcode(barcode)` — live Open Food Facts API call

A product added through `/add/drink` or `/add/label` is just a `manualProducts` entry like any
other manual product; it flows through the exact same product page, quantity input, and history
logging as a scanned one.

### Two independent scoring systems — don't conflate them

- **`computeHomemadeScore`** (`src/lib/scoring/homemadeScore.ts`) anchors on the product's
  Nutri-Score grade (base 55/100 when unknown), then applies NOVA/sugar/additive penalties and a
  fiber bonus. Used on the product detail page (`/product`) where Nutri-Score/NOVA data usually
  exists (scanned or user-entered).
- **`computeMacroScore`** (`src/lib/scoring/macroScore.ts`) never touches Nutri-Score/NOVA — every
  point comes from raw per-100g energy/sugar/saturated fat/salt/fiber/protein. Used wherever
  Nutri-Score is reliably absent and would be misleading as an anchor: `/foods` (generic foods),
  `/recipes` (composed dishes have no Nutri-Score of their own).

Both return the same `HomemadeScore` shape (`score`, `label`, `reasons`) and share the label→color
mapping in `src/lib/scoring/scoreDisplay.ts` (`SCORE_LABEL_TEXT/_COLOR`, `SCORE_BAR_COLOR`) — reuse
those maps rather than redefining them per page.

### Recipes

A `Recipe` (`src/lib/types/product.ts`) is a name + servings count + a list of
`RecipeIngredient` (barcode, quantity in grams, a **snapshot** of that ingredient's per-100g
nutrients — so a recipe keeps working even if the source product later changes). Ingredients are
currently sourced only from `BUILTIN_FOODS`, not from scanned/manual products or Open Food Facts.
`src/lib/recipes/calculate.ts` derives everything else from that list: total macros, per-serving
macros, macros for an arbitrary number of servings logged, and a per-100g nutrient density
(`recipeNutrientsPer100g`) so a recipe can be run through `computeMacroScore` like any other food.

### Storage (`src/lib/storage/db.ts`)

Single IndexedDB database (`nutriscan-db`), opened lazily and memoized via `idb`. Stores: `history`
(indexed by timestamp), `favorites`, `manualProducts`, `settings` (goals, keyed manually), `recipes`.
**To add a store or index, bump `DB_VERSION` and add the creation inside the `upgrade()` callback**
guarded by `objectStoreNames.contains(...)` — `idb` replays `upgrade` across every version jump, so
existing guards must stay intact. Small ad-hoc settings (Gemini API key/model) live in
`localStorage` instead (`src/lib/storage/aiSettings.ts`), not IndexedDB.

### AI features share one low-level Gemini caller

`src/lib/ai/callGemini.ts` (`callGeminiGenerateContent`) owns the fetch call, JSON schema request
shape, and HTTP status → error code mapping (403→`invalid_key`, 429→`rate_limited`, 400 sniffs the
error body to distinguish a bad key from an unrelated bad request, etc.). Two features build on it,
each with its own prompt/schema/parser but sharing that plumbing:
- `geminiEstimate.ts` + `parseGeminiResponse.ts`: estimates **total** macros for a described/
  photographed *meal* (used by `/describe`).
- `geminiLabelScan.ts` + `parseGeminiLabelResponse.ts`: reads a photographed nutrition-facts panel
  and returns **per-100g/100ml** values, normalizing serving-based labels itself (used by
  `/add/label`, reachable from `/add` and from the product-not-found screen with the scanned
  barcode carried over via `?barcode=`).

Both parsers are deliberately defensive (only `energyKcal` is required; everything else defaults to
0/null rather than throwing) since the model can ignore the JSON schema. The Gemini API key is
entered once by the user and stored in `localStorage`; it is never sent anywhere but Google's API.

### Static export + GitHub Pages base path

`next.config.js` conditionally sets `basePath`/`assetPrefix` to `/Track-app` based on
`NEXT_PUBLIC_USE_PAGES_BASE_PATH`, **not** the ambient `GITHUB_ACTIONS` env var — that variable is
`"true"` in every CI job (lint, unit tests, e2e), not just the Pages build step, so keying off it
broke the e2e job's dev server routing. Only set this flag for the actual static-export build step.

### Testing conventions

`tests/unit/` covers pure logic only (scoring, macro math, parsers, id generation) via Vitest +
jsdom — there are no component/page-level unit tests in this repo (no React Testing Library
dependency). Page behavior is instead covered by Playwright specs in `e2e/`, which mock the camera
feed and the Open Food Facts API rather than hitting real services.
