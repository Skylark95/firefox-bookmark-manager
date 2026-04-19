import { useState } from 'react'
import { formatDate } from '../utils/formatDate'
import { getHostname } from '../utils/getHostname'
import type { Bookmark } from '../types'

interface Props {
  bookmark: Bookmark;
  onTagClick: (tag: string) => void;
  onCategoryChange: (category: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  isArchived?: boolean;
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

export default function BookmarkCard({ bookmark, onTagClick, onCategoryChange, onArchive, onDelete, onRestore, isArchived }: Props) {
  const { id, title, url, lastUsed, category, tags } = bookmark
  const [urlCopied, setUrlCopied] = useState(false)

  async function handleCopyUrl(e: React.MouseEvent): Promise<void> {
    e.preventDefault()
    e.stopPropagation()
    await copyToClipboard(url)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  return (
    <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top row: category badge + date */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => onCategoryChange(category)}
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-slate-600 dark:text-brand-200 dark:hover:bg-slate-500 transition-colors shrink-0"
          title={`Filter by ${category}`}
        >
          {category}
        </button>
        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{formatDate(lastUsed)}</span>
      </div>

      {/* Title */}
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
        {title}
      </h2>

      {/* URL row: link + copy button */}
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 hover:underline truncate flex-1"
          title={url}
        >
          {getHostname(url)}
        </a>
        <button
          onClick={handleCopyUrl}
          title="Copy URL"
          className="shrink-0 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded"
        >
          {urlCopied ? (
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-brand-400 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-auto pt-1 border-t border-slate-100 dark:border-slate-700">
        {isArchived ? (
          <button
            onClick={() => onRestore?.(id)}
            title="Restore bookmark"
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Restore
          </button>
        ) : (
          <button
            onClick={() => onArchive(id)}
            title="Archive bookmark"
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>
        )}
        <button
          onClick={() => onDelete(id)}
          title="Delete bookmark"
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  )
}
