import { useState, useEffect, useMemo, useCallback } from 'react'
import UploadView from './components/UploadView'
import DashboardView from './components/DashboardView'
import { filterBookmarks } from './utils/filterBookmarks'

const STORAGE_KEY = 'offline_bookmarks'
const FILTERS_KEY = 'offline_bookmarks_filters'

function readStorage(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, value) } catch {}
}

function removeStorage(key) {
  try { localStorage.removeItem(key) } catch {}
}

export default function App() {
  const [bookmarks, setBookmarks]             = useState([])
  const [isLoaded, setIsLoaded]               = useState(false)
  const [activeCategory, setActiveCategory]   = useState(null)
  const [activeTags, setActiveTags]           = useState([])
  const [searchQuery, setSearchQuery]         = useState('')
  const [sortOrder, setSortOrder]             = useState('newest')

  useEffect(() => {
    const raw = readStorage(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setBookmarks(parsed)

        const savedFilters = JSON.parse(readStorage(FILTERS_KEY) || 'null')
        if (savedFilters) {
          setActiveCategory(savedFilters.activeCategory ?? null)
          setActiveTags(savedFilters.activeTags ?? [])
          setSearchQuery(savedFilters.searchQuery ?? '')
          setSortOrder(savedFilters.sortOrder ?? 'newest')
        }

        setIsLoaded(true)
      } catch {
        removeStorage(STORAGE_KEY)
        removeStorage(FILTERS_KEY)
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    writeStorage(FILTERS_KEY, JSON.stringify({ activeCategory, activeTags, searchQuery, sortOrder }))
  }, [activeCategory, activeTags, searchQuery, sortOrder, isLoaded])

  function handleDataLoaded(validatedData) {
    writeStorage(STORAGE_KEY, JSON.stringify(validatedData))
    setBookmarks(validatedData)
    setIsLoaded(true)
  }

  function handleReset() {
    removeStorage(STORAGE_KEY)
    removeStorage(FILTERS_KEY)
    setBookmarks([])
    setIsLoaded(false)
    setActiveCategory(null)
    setActiveTags([])
    setSearchQuery('')
    setSortOrder('newest')
  }

  const handleTagClick = useCallback((tag) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }, [])

  const handleClearTags = useCallback(() => setActiveTags([]), [])

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(prev => prev === cat ? null : cat)
  }, [])

  const filteredBookmarks = useMemo(
    () => filterBookmarks(bookmarks, { activeCategory, activeTags, searchQuery, sortOrder }),
    [bookmarks, activeCategory, activeTags, searchQuery, sortOrder]
  )

  const categories = useMemo(
    () => [...new Set(bookmarks.map(b => b.category))].sort(),
    [bookmarks]
  )

  const allTags = useMemo(
    () => [...new Set(bookmarks.flatMap(b => b.tags))].sort(),
    [bookmarks]
  )

  if (!isLoaded) {
    return <UploadView onDataLoaded={handleDataLoaded} />
  }

  return (
    <DashboardView
      filteredBookmarks={filteredBookmarks}
      totalCount={bookmarks.length}
      categories={categories}
      allTags={allTags}
      activeCategory={activeCategory}
      activeTags={activeTags}
      searchQuery={searchQuery}
      sortOrder={sortOrder}
      onCategoryChange={handleCategoryChange}
      onTagClick={handleTagClick}
      onSearchChange={setSearchQuery}
      onSortChange={setSortOrder}
      onClearTags={handleClearTags}
      onReset={handleReset}
    />
  )
}
