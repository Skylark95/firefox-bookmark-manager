import BookmarkCard from './BookmarkCard'
import type { Bookmark } from '../types'

interface Props {
  bookmarks: Bookmark[];
  onTagClick: (tag: string) => void;
  onCategoryChange: (category: string) => void;
}

export default function BookmarkGrid({ bookmarks, onTagClick, onCategoryChange }: Props) {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 px-4">
        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-lg font-medium">No bookmarks match your filters</p>
        <p className="text-sm mt-1">Try adjusting your search or clearing active filters.</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {bookmarks.map(bookmark => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onTagClick={onTagClick}
            onCategoryChange={onCategoryChange}
          />
        ))}
      </div>
    </div>
  )
}
