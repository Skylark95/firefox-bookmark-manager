import { useState } from 'react'

function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function getHostname(url) {
  try { return new URL(url).hostname } catch { return url }
}

async function copyToClipboard(text) {
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

export default function BookmarkCard({ bookmark, onTagClick, onCategoryChange }) {
  const { title, url, lastUsed, category, tags } = bookmark
  const [urlCopied, setUrlCopied] = useState(false)

  async function handleCopyUrl(e) {
    e.preventDefault()
    e.stopPropagation()
    await copyToClipboard(url)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top row: category badge + date */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => onCategoryChange(category)}
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 hover:bg-brand-200 transition-colors shrink-0"
          title={`Filter by ${category}`}
        >
          {category}
        </button>
        <span className="text-xs text-slate-400 shrink-0">{formatDate(lastUsed)}</span>
      </div>

      {/* Title */}
      <h2 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
        {title}
      </h2>

      {/* URL row: link + copy button */}
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-600 hover:text-brand-800 hover:underline truncate flex-1"
          title={url}
        >
          {getHostname(url)}
        </a>
        <button
          onClick={handleCopyUrl}
          title="Copy URL"
          className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded"
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
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1 border-t border-slate-100">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </article>
  )
}
