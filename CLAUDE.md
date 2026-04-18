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

To run a single test file: `bunx vitest run src/utils/__tests__/filterBookmarks.test.ts`

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

- `Bookmark` — the core data shape (`id`, `title`, `url`, `lastUsed`, `category`, `tags`)
- `SortOrder` — `'newest' | 'oldest' | 'alpha'`
- `FilterState` — `{ activeCategory, activeTags, searchQuery, sortOrder }`

### Data flow

1. User uploads a processed `.json` file via `UploadView`
2. `validateSchema()` in `src/utils/validateSchema.ts` checks the array at runtime using an `asserts data is Bookmark[]` type guard — after the call TypeScript narrows the type
3. On success, `App.handleDataLoaded()` writes to `localStorage` (`offline_bookmarks`) and flips `isLoaded`
4. Filter state (`activeCategory`, `activeTags`, `searchQuery`, `sortOrder`) is persisted separately under `offline_bookmarks_filters`
5. `filteredBookmarks`, `categories`, and `allTags` are all derived via `useMemo` — never stored in state

### Required data schema

The app expects a JSON array where each item matches the `Bookmark` interface in `src/types.ts`:
```
{ id: string, title: string, url: string, lastUsed: number (Unix seconds), category: string, tags: string[] }
```

The raw Firefox export (from the About Sync extension) does **not** match this schema — it must be transformed via an LLM using the prompt displayed in `UploadView`.

### localStorage keys

| Key | Contents |
|-----|----------|
| `offline_bookmarks` | Full bookmark array (target schema) |
| `offline_bookmarks_filters` | `{ activeCategory, activeTags, searchQuery, sortOrder }` |

### Pure utility functions (`src/utils/`)

Business logic is extracted to pure functions for testability:

- `validateSchema(data: unknown)` — `asserts data is Bookmark[]`; throws on invalid input
- `filterBookmarks(bookmarks, filters)` — filters and sorts; called from `App.tsx` useMemo
- `formatDate(unixSeconds)` — formats Unix timestamp to `"Jan 15, 2020"` style
- `getHostname(url)` — extracts hostname with fallback to full URL on parse error

Tests live in `src/utils/__tests__/`.

### Filtering logic

1. `activeCategory` — exact match on `category` field
2. `activeTags` — bookmark must contain **all** active tags (AND logic)
3. `searchQuery` — split on whitespace; every term must appear in `title` OR `url` (case-insensitive)
4. Sort applied after filter: `newest` (lastUsed desc), `oldest` (asc), `alpha` (title localeCompare)

### Component responsibilities

- **`DashboardView`** — layout only; owns `drawerOpen` (mobile drawer state); passes all filter props to `Sidebar` via a spread object
- **`Sidebar`** — search input, sort select, category buttons, tag cloud, "Load new file" button; sort `onChange` casts `e.target.value as SortOrder`
- **`BookmarkGrid`** — renders cards or empty state
- **`BookmarkCard`** — clicking category badge calls `onCategoryChange`; clicking tag badge calls `onTagClick`; copy URL button with clipboard fallback

### TypeScript notes

- `tsconfig.json` uses `strict: true` with `noUnusedLocals` and `noUnusedParameters`
- `src/vite-env.d.ts` provides `/// <reference types="vite/client" />` for CSS import declarations
- localStorage reads use explicit casts (`as Bookmark[]`, `as FilterState | null`) since we control what was written
- `vite.config.js` sets `base: './'` so all asset paths are relative — required for GitHub Pages subdirectory hosting
