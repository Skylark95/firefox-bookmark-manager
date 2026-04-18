# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `bun` (not `npm`) for all package management and script execution.

```bash
bun run dev        # Start dev server at http://localhost:5173
bun run build      # Production build to dist/
bun run preview    # Preview the production build locally
bun run deploy     # Build and deploy to GitHub Pages (requires gh-pages setup)
bun install        # Install dependencies
```

No test suite or linter is configured in V1.

## Architecture

This is a fully client-side React + Vite + Tailwind CSS app — no backend, no router, no external API calls. All data lives in `localStorage`.

### Two-view structure

`App.jsx` owns all state and decides which view to render based on `isLoaded`:

- **`isLoaded = false`** → renders `<UploadView>` (file ingestion)
- **`isLoaded = true`** → renders `<DashboardView>` (bookmark browsing)

### Data flow

1. User uploads a processed `.json` file via `UploadView`
2. `validateSchema()` in `UploadView.jsx` checks the array against the required schema
3. On success, `App.handleDataLoaded()` writes to `localStorage` (`offline_bookmarks`) and flips `isLoaded`
4. Filter state (`activeCategory`, `activeTags`, `searchQuery`, `sortOrder`) is persisted separately under `offline_bookmarks_filters`
5. `filteredBookmarks`, `categories`, and `allTags` are all derived via `useMemo` — never stored in state

### Required data schema

The app expects a JSON array where each item has:
```
{ id: string, title: string, url: string, lastUsed: number (Unix seconds), category: string, tags: string[] }
```

The raw Firefox export (from the About Sync extension) does **not** match this schema — it must be transformed via an LLM using the prompt displayed in `UploadView`.

### localStorage keys

| Key | Contents |
|-----|----------|
| `offline_bookmarks` | Full bookmark array (target schema) |
| `offline_bookmarks_filters` | `{ activeCategory, activeTags, searchQuery, sortOrder }` |

### Filtering logic (in `App.jsx` `useMemo`)

1. `activeCategory` — exact match on `category` field
2. `activeTags` — bookmark must contain **all** active tags
3. `searchQuery` — split on whitespace; every term must appear in `title` OR `url` (case-insensitive)
4. Sort applied after filter: `newest` (lastUsed desc), `oldest` (asc), `alpha` (title localeCompare)

### Component responsibilities

- **`DashboardView`** — layout only; owns `drawerOpen` (mobile drawer state); passes all filter props down
- **`Sidebar`** — search input, sort select, category buttons, tag cloud, "Load new file" button
- **`BookmarkGrid`** — renders cards or empty state
- **`BookmarkCard`** — clicking category badge calls `onCategoryChange`; clicking tag badge calls `onTagClick`; copy URL button with clipboard fallback

### Deployment

`vite.config.js` sets `base: './'` so all asset paths are relative — required for GitHub Pages subdirectory hosting.
