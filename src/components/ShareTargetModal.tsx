import { useState, useEffect, useId } from 'react'
import type { Bookmark } from '../types'

interface Props {
  url: string;
  title: string;
  categories: string[];
  bookmarks: Bookmark[];
  onAdd: (data: { url: string; title: string; category: string; tags: string[] }) => void;
  onDismiss: () => void;
}

export default function ShareTargetModal({ url, title: initialTitle, categories, bookmarks, onAdd, onDismiss }: Props) {
  const [titleValue, setTitleValue]       = useState(initialTitle)
  const [categoryValue, setCategoryValue] = useState('')
  const [tagsValue, setTagsValue]         = useState('')
  const datalistId = useId()
  const isDuplicate = bookmarks.some(bm => bm.url === url)

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onDismiss])

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (isDuplicate) return
    onAdd({
      url,
      title: titleValue.trim() || url,
      category: categoryValue.trim() || 'Uncategorized',
      tags: tagsValue.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 ' +
    'text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ' +
    'px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
  const labelClass = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onDismiss} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-md w-full"
      >
        <h2 id="share-modal-title" className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">
          Add shared bookmark
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>URL</label>
            <input
              type="url"
              value={url}
              readOnly
              tabIndex={-1}
              className={`${inputClass} opacity-60 cursor-default select-all`}
            />
            {isDuplicate && (
              <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
                This URL is already saved as a bookmark.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="share-title" className={labelClass}>Title</label>
            <input
              id="share-title"
              type="text"
              value={titleValue}
              autoFocus
              onChange={e => setTitleValue(e.target.value)}
              placeholder="Bookmark title"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="share-category" className={labelClass}>Category</label>
            <input
              id="share-category"
              type="text"
              value={categoryValue}
              list={datalistId}
              onChange={e => setCategoryValue(e.target.value)}
              placeholder="e.g. Tech, News, Tools…"
              className={inputClass}
            />
            <datalist id={datalistId}>
              {categories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="share-tags" className={labelClass}>Tags</label>
            <input
              id="share-tags"
              type="text"
              value={tagsValue}
              onChange={e => setTagsValue(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Comma-separated</p>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDuplicate}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
