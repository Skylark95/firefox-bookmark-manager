import { useRef, useState } from 'react'
import { copyToClipboard } from '../utils/clipboard'
import { PROMPT_TEXT } from '../constants'
import type { SortOrder } from '../types'

interface Props {
  categories: string[];
  allTags: string[];
  activeCategory: string | null;
  activeTags: string[];
  searchQuery: string;
  sortOrder: SortOrder;
  totalCount: number;
  filteredCount: number;
  currentView: 'active' | 'archived';
  onCategoryChange: (category: string | null) => void;
  onTagClick: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (order: SortOrder) => void;
  onClearTags: () => void;
  onReset: () => void;
  onFilesSelected: (files: File[]) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function Sidebar({
  categories, allTags,
  activeCategory, activeTags, searchQuery, sortOrder, totalCount, filteredCount, currentView,
  onCategoryChange, onTagClick, onSearchChange, onSortChange, onClearTags, onReset,
  onFilesSelected,
  isDark, onToggleDark,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [promptCopied, setPromptCopied] = useState(false)

  async function handleCopyPrompt() {
    await copyToClipboard(PROMPT_TEXT)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Bookmark Manager</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentView === 'archived'
              ? `${filteredCount} archived`
              : `Showing ${filteredCount} of ${totalCount}`}
          </p>
        </div>
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
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Search */}
        <div>
          <input
            type="search"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search bookmarks…"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Sort</h3>
          <select
            value={sortOrder}
            onChange={e => onSortChange(e.target.value as SortOrder)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-slate-100
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                       min-h-[44px]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">A – Z title</option>
          </select>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Category</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm min-h-[44px] transition-colors
                ${activeCategory === null
                  ? 'bg-brand-100 text-brand-700 font-medium dark:bg-slate-600 dark:text-brand-500'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              All categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm min-h-[44px] transition-colors
                  ${activeCategory === cat
                    ? 'bg-brand-100 text-brand-700 font-medium dark:bg-slate-600 dark:text-brand-500'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tags</h3>
            {activeTags.length > 0 && (
              <button
                onClick={onClearTags}
                className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                  ${activeTags.includes(tag)
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500'
                  }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0)
              onFilesSelected(Array.from(e.target.files))
            e.target.value = ''
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300
                     border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
        >
          Load new file
        </button>
        <button
          onClick={handleCopyPrompt}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300
                     border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
        >
          {promptCopied ? '✓ Copied!' : 'Copy Prompt'}
        </button>
        <button
          onClick={onReset}
          className="w-full text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
        >
          Reset data
        </button>
      </div>
    </div>
  )
}
