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
  onCategoryChange: (category: string | null) => void;
  onTagClick: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (order: SortOrder) => void;
  onClearTags: () => void;
  onReset: () => void;
}

export default function Sidebar({
  categories, allTags,
  activeCategory, activeTags, searchQuery, sortOrder, totalCount, filteredCount,
  onCategoryChange, onTagClick, onSearchChange, onSortChange, onClearTags, onReset,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200">
        <h1 className="text-base font-bold text-slate-800">Bookmark Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Showing {filteredCount} of {totalCount}
        </p>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Sort</h3>
          <select
            value={sortOrder}
            onChange={e => onSortChange(e.target.value as SortOrder)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white
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
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm min-h-[44px] transition-colors
                ${activeCategory === null
                  ? 'bg-brand-100 text-brand-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
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
                    ? 'bg-brand-100 text-brand-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tags</h3>
            {activeTags.length > 0 && (
              <button
                onClick={onClearTags}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
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
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Load New File */}
      <div className="px-4 py-4 border-t border-slate-200">
        <button
          onClick={onReset}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600
                     border border-slate-300 hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          Load new file
        </button>
      </div>
    </div>
  )
}
