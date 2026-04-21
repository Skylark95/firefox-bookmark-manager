# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `bun` (not `npm`) for all package management and script execution.

```bash
bun run dev        # Start dev server at http://localhost:5173
bun run build      # Production build to dist/
bun run preview    # Preview the production build locally
bun install        # Install dependencies
bun run type-check # TypeScript type checking (tsc --noEmit)
bun run test       # Run test suite once (vitest)
bun run test:watch # Run tests in watch mode
```

To run a single test file: `bunx vitest run src/utils/__tests__/mergeBookmarks.test.ts`

No linter is configured.

## Deployment

Pushes to `main` deploy automatically via `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages). No manual deploy step needed. Requires GitHub Pages source set to **GitHub Actions** in repo settings.

## Architecture

This is a fully client-side React + Vite + Tailwind CSS app written in TypeScript — no backend, no router, no external API calls. All data lives in `localStorage`.

### Two-view structure

`App.tsx` owns all state and decides which view to render based on `isLoaded`:

- **`isLoaded = false`** → renders `<UploadView>` (file ingestion)
- **`isLoaded = true`** → renders `<DashboardView>` (bookmark browsing)

### Shared types (`src/types.ts`)

All domain types are defined here and imported across the codebase:

- `Bookmark` — the core data shape (`id`, `title`, `url`, `lastUsed`, `category`, `tags`, `archived?`)
- `SortOrder` — `'newest' | 'oldest' | 'alpha'`
- `FilterState` — `{ activeCategory, activeTags, searchQuery, sortOrder }`

### Data flow

**Initial load (UploadView):**
1. User uploads a processed `.json` file via `UploadView`
2. `validateSchema()` in `src/utils/validateSchema.ts` checks the array at runtime using an `asserts data is Bookmark[]` type guard — after the call TypeScript narrows the type
3. On success, `App.handleDataLoaded()` writes to `localStorage` (`offline_bookmarks`) and flips `isLoaded`

**Merge load (Sidebar "Load new file"):**
1. User selects one or more `.json` files from the Sidebar's multi-file picker
2. `App.handleFilesSelected()` reads all files concurrently via `Promise.allSettled`, validating each with `validateSchema()`
3. Valid bookmark arrays are flattened and passed to `mergeBookmarks(existing, incoming)` — deduplication is by `url`; most recent `lastUsed` wins; `archived` status and `id` are always preserved from the existing record
4. The merged array is written to `localStorage` and an `InfoToast` shows the stats (`Added X, updated Y, skipped Z`)

**Common to both paths:**
- Filter state (`activeCategory`, `activeTags`, `searchQuery`, `sortOrder`) is persisted separately under `offline_bookmarks_filters`
- `viewBookmarks` is derived first (active vs. archived), then `filteredBookmarks`, `categories`, and `allTags` are all derived from `viewBookmarks` via `useMemo` — never stored in state

### Required data schema

The app expects a JSON array where each item matches the `Bookmark` interface in `src/types.ts`:
```
{ id: string, title: string, url: string, lastUsed: number (Unix seconds), category: string, tags: string[] }
```

`archived` is optional — missing or `undefined` is treated as `false`. On load, all bookmarks are migrated to explicitly set `archived: false` if the field is absent.

The raw Firefox export (from the About Sync extension) does **not** match this schema — it must be transformed via an LLM using the prompt displayed in `UploadView`.

### localStorage keys

| Key | Contents |
|-----|----------|
| `offline_bookmarks` | Full bookmark array (target schema) |
| `offline_bookmarks_filters` | `{ activeCategory, activeTags, searchQuery, sortOrder }` |
| `theme` | `'dark'` or `'light'` — persisted by `useDarkMode` hook in `App.tsx` |

### Pure utility functions (`src/utils/`)

Business logic is extracted to pure functions for testability:

- `validateSchema(data: unknown)` — `asserts data is Bookmark[]`; throws on invalid input
- `filterBookmarks(bookmarks, filters)` — filters and sorts; called from `App.tsx` useMemo
- `mergeBookmarks(existing, incoming)` — merges two bookmark arrays, deduplicating by `url`; returns `{ merged, stats }` where stats tracks added/updated/skipped counts
- `formatDate(unixSeconds)` — formats Unix timestamp to `"Jan 15, 2020"` style
- `getHostname(url)` — extracts hostname with fallback to full URL on parse error

Tests live in `src/utils/__tests__/`.

### Filtering logic

1. `activeCategory` — exact match on `category` field
2. `activeTags` — bookmark must contain **all** active tags (AND logic)
3. `searchQuery` — split on whitespace; every term must appear in `title` OR `url` (case-insensitive)
4. Sort applied after filter: `newest` (lastUsed desc), `oldest` (asc), `alpha` (title localeCompare)

### Dark mode

Tailwind's `darkMode: 'class'` strategy is used — the `dark` class on `<html>` activates all `dark:` variants. The `useDarkMode` hook in `App.tsx` initialises from `localStorage` (`theme` key), falls back to `prefers-color-scheme`, and toggles the class via `document.documentElement.classList`. `isDark` and `onToggleDark` are threaded as props into both views and down into `Sidebar`. Toggle buttons (sun/moon SVG) appear in the `UploadView` header, the `DashboardView` mobile header, and the `Sidebar` desktop header. The `bg-slate-800` AI prompt block in `UploadView` is intentionally dark in both modes — do not add `dark:` overrides to it.

### Archive and delete

`App.tsx` owns `currentView: 'active' | 'archived'` (not persisted). `viewBookmarks` is pre-filtered from `bookmarks` by this view before being passed to `filterBookmarks`.

- **Archive** — sets `archived: true`, shows a 5-second undo toast (`UndoToast`). Undo restores the bookmark immediately.
- **Delete** — opens `ConfirmModal`; on confirm, removes the bookmark permanently from the array. No undo.
- **Restore** — sets `archived: false`, available only in the archived view.

The view toggle ("Bookmarks / Archived") appears above the grid in `DashboardView`. `Sidebar` categories and tags reflect only the bookmarks in the current view.

### Component responsibilities

- **`DashboardView`** — layout only; owns `drawerOpen` (mobile drawer state); renders the view toggle, `UndoToast`, `InfoToast`, and `ConfirmModal`; passes all filter props plus `isDark`/`onToggleDark` to `Sidebar` via a spread object
- **`Sidebar`** — search input, sort select, category buttons, tag cloud, dark mode toggle in header; footer has two actions: **"Load new file"** (hidden `<input type="file" multiple>` for merge imports) and **"Reset data"** (calls `onReset` to navigate back to UploadView and clear all data); header label switches between "Showing X of Y" and "X archived" based on `currentView`
- **`BookmarkGrid`** — renders cards or empty state; passes archive/delete/restore handlers to each card
- **`BookmarkCard`** — clicking category badge calls `onCategoryChange`; clicking tag badge calls `onTagClick`; copy URL button with clipboard fallback; always-visible Archive + Delete buttons (active view) or Restore + Delete buttons (archived view)
- **`UndoToast`** — fixed `bottom-6` center toast with 5s auto-dismiss and Undo button; timer managed in `App.tsx` via `useRef`
- **`InfoToast`** — fixed `bottom-20` center toast with 4s auto-dismiss; no Undo button; used for merge stats after file import
- **`ConfirmModal`** — centered overlay modal; dismisses on backdrop click or Cancel

### TypeScript notes

- `tsconfig.json` uses `strict: true` with `noUnusedLocals` and `noUnusedParameters`
- `src/vite-env.d.ts` provides `/// <reference types="vite/client" />` for CSS import declarations
- localStorage reads use explicit casts (`as Bookmark[]`, `as FilterState | null`) since we control what was written
- `vite.config.js` sets `base: './'` so all asset paths are relative — required for GitHub Pages subdirectory hosting
