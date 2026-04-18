import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import BookmarkGrid from './BookmarkGrid'
import type { Bookmark, SortOrder } from '../types'

interface Props {
  filteredBookmarks: Bookmark[];
  totalCount: number;
  categories: string[];
  allTags: string[];
  activeCategory: string | null;
  activeTags: string[];
  searchQuery: string;
  sortOrder: SortOrder;
  onCategoryChange: (category: string | null) => void;
  onTagClick: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (order: SortOrder) => void;
  onClearTags: () => void;
  onReset: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function DashboardView({
  filteredBookmarks, totalCount,
  categories, allTags,
  activeCategory, activeTags, searchQuery, sortOrder,
  onCategoryChange, onTagClick, onSearchChange, onSortChange, onClearTags, onReset,
  isDark, onToggleDark,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [drawerOpen])

  const sidebarProps = {
    categories, allTags,
    activeCategory, activeTags, searchQuery, sortOrder,
    totalCount,
    filteredCount: filteredBookmarks.length,
    onCategoryChange, onTagClick, onSearchChange, onSortChange, onClearTags, onReset,
    isDark, onToggleDark,
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">

      {/* Mobile sticky top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open filters"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <input
          type="search"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search bookmarks…"
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
          {filteredBookmarks.length}/{totalCount}
        </span>
        <button
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg
                     text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700
                     transition-colors shrink-0"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </header>

      <div className="lg:flex lg:h-screen">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 overflow-hidden">
          <Sidebar {...sidebarProps} />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:overflow-y-auto">
          <BookmarkGrid
            bookmarks={filteredBookmarks}
            onTagClick={onTagClick}
            onCategoryChange={onCategoryChange}
          />
        </main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-xl flex flex-col">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar {...sidebarProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
