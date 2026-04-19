import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import UploadView from './components/UploadView'
import DashboardView from './components/DashboardView'
import { filterBookmarks } from './utils/filterBookmarks'
import type { Bookmark, SortOrder, FilterState } from './types'

const STORAGE_KEY = 'offline_bookmarks'
const FILTERS_KEY = 'offline_bookmarks_filters'

function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = readStorage('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    writeStorage('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleDark = useCallback(() => setIsDark(prev => !prev), [])
  return [isDark, toggleDark]
}

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function writeStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch {}
}

function removeStorage(key: string): void {
  try { localStorage.removeItem(key) } catch {}
}

interface ToastState {
  message: string;
  onUndo: () => void;
}

export default function App() {
  const [isDark, toggleDark] = useDarkMode()
  const [bookmarks, setBookmarks]             = useState<Bookmark[]>([])
  const [isLoaded, setIsLoaded]               = useState(false)
  const [activeCategory, setActiveCategory]   = useState<string | null>(null)
  const [activeTags, setActiveTags]           = useState<string[]>([])
  const [searchQuery, setSearchQuery]         = useState('')
  const [sortOrder, setSortOrder]             = useState<SortOrder>('newest')
  const [currentView, setCurrentView]         = useState<'active' | 'archived'>('active')
  const [toast, setToast]                     = useState<ToastState | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const toastTimerRef                         = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const raw = readStorage(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Bookmark[]
        // Migration: ensure all bookmarks have the archived field
        const migrated = parsed.map(bm => ({ archived: false as boolean, ...bm }))
        setBookmarks(migrated)

        const savedFilters = JSON.parse(readStorage(FILTERS_KEY) ?? 'null') as FilterState | null
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

  useEffect(() => {
    if (!isLoaded) return
    writeStorage(STORAGE_KEY, JSON.stringify(bookmarks))
  }, [bookmarks, isLoaded])

  function handleDataLoaded(validatedData: Bookmark[]): void {
    const withArchived = validatedData.map(bm => ({ archived: false as boolean, ...bm }))
    writeStorage(STORAGE_KEY, JSON.stringify(withArchived))
    setBookmarks(withArchived)
    setIsLoaded(true)
  }

  function handleReset(): void {
    removeStorage(STORAGE_KEY)
    removeStorage(FILTERS_KEY)
    setBookmarks([])
    setIsLoaded(false)
    setActiveCategory(null)
    setActiveTags([])
    setSearchQuery('')
    setSortOrder('newest')
    setCurrentView('active')
    dismissToast()
  }

  function showToast(message: string, onUndo: () => void): void {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, onUndo })
    toastTimerRef.current = setTimeout(() => setToast(null), 5000)
  }

  function dismissToast(): void {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(null)
  }

  function handleArchive(id: string): void {
    setBookmarks(prev => prev.map(bm => bm.id === id ? { ...bm, archived: true } : bm))
    showToast('Bookmark archived', () => {
      setBookmarks(prev => prev.map(bm => bm.id === id ? { ...bm, archived: false } : bm))
      dismissToast()
    })
  }

  function handleRestore(id: string): void {
    setBookmarks(prev => prev.map(bm => bm.id === id ? { ...bm, archived: false } : bm))
  }

  function handleDelete(id: string): void {
    setConfirmDeleteId(id)
  }

  function handleDeleteConfirm(): void {
    if (!confirmDeleteId) return
    setBookmarks(prev => prev.filter(bm => bm.id !== confirmDeleteId))
    setConfirmDeleteId(null)
  }

  function handleDeleteCancel(): void {
    setConfirmDeleteId(null)
  }

  const handleTagClick = useCallback((tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }, [])

  const handleClearTags = useCallback(() => setActiveTags([]), [])

  const handleCategoryChange = useCallback((cat: string | null) => {
    setActiveCategory(prev => prev === cat ? null : cat)
  }, [])

  const viewBookmarks = useMemo(
    () => bookmarks.filter(b => currentView === 'archived' ? b.archived : !b.archived),
    [bookmarks, currentView]
  )

  const filteredBookmarks = useMemo(
    () => filterBookmarks(viewBookmarks, { activeCategory, activeTags, searchQuery, sortOrder }),
    [viewBookmarks, activeCategory, activeTags, searchQuery, sortOrder]
  )

  const categories = useMemo(
    () => [...new Set(viewBookmarks.map(b => b.category))].sort(),
    [viewBookmarks]
  )

  const allTags = useMemo(
    () => [...new Set(viewBookmarks.flatMap(b => b.tags))].sort(),
    [viewBookmarks]
  )

  const activeCount = useMemo(
    () => bookmarks.filter(b => !b.archived).length,
    [bookmarks]
  )

  const archivedCount = useMemo(
    () => bookmarks.filter(b => b.archived).length,
    [bookmarks]
  )

  if (!isLoaded) {
    return <UploadView onDataLoaded={handleDataLoaded} isDark={isDark} onToggleDark={toggleDark} />
  }

  return (
    <DashboardView
      filteredBookmarks={filteredBookmarks}
      totalCount={activeCount}
      archivedCount={archivedCount}
      categories={categories}
      allTags={allTags}
      activeCategory={activeCategory}
      activeTags={activeTags}
      searchQuery={searchQuery}
      sortOrder={sortOrder}
      currentView={currentView}
      toast={toast}
      confirmDeleteId={confirmDeleteId}
      onCategoryChange={handleCategoryChange}
      onTagClick={handleTagClick}
      onSearchChange={setSearchQuery}
      onSortChange={setSortOrder}
      onClearTags={handleClearTags}
      onReset={handleReset}
      onViewChange={setCurrentView}
      onArchive={handleArchive}
      onDelete={handleDelete}
      onRestore={handleRestore}
      onToastDismiss={dismissToast}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
      isDark={isDark}
      onToggleDark={toggleDark}
    />
  )
}
