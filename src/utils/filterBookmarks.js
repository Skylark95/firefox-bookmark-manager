export function filterBookmarks(bookmarks, { activeCategory, activeTags, searchQuery, sortOrder }) {
  const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
  return bookmarks
    .filter(bm => {
      if (activeCategory && bm.category !== activeCategory) return false
      if (activeTags.length > 0 && !activeTags.every(t => bm.tags.includes(t))) return false
      if (terms.length > 0) {
        const haystack = (bm.title + ' ' + bm.url).toLowerCase()
        if (!terms.every(term => haystack.includes(term))) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.lastUsed - a.lastUsed
      if (sortOrder === 'oldest') return a.lastUsed - b.lastUsed
      return a.title.localeCompare(b.title)
    })
}
