import { useState, useRef } from 'react'

const PROMPT_TEXT = `You are a data transformation assistant. I will give you raw JSON exported from Firefox via the About Sync extension. Your job is to transform it into a clean, flat array matching an exact target schema.

## INPUT FORMAT
The raw data looks like this:
{
  "clientName": "Firefox on Device Name",
  "id": "some-hex-id",
  "tabs": [
    {
      "icon": null,
      "lastUsed": 1776529824,
      "title": "Page Title Here",
      "urlHistory": ["https://example.com/page"],
      "inactive": true
    }
  ]
}

## OUTPUT FORMAT
Output ONLY a valid JSON array — no markdown, no explanation, no code fences. Each element must match this schema exactly:
[
  {
    "id": "string — generate a unique short ID for each bookmark (e.g. 'bm_0001')",
    "title": "string — the tab title as-is",
    "url": "string — the FIRST entry in urlHistory only",
    "lastUsed": 1776529824,
    "category": "string — infer a single short category from the URL domain and title (e.g. 'Tech', 'News', 'AI', 'Gaming', 'Science', 'Politics', 'Productivity', 'Tools', 'Reference', 'Entertainment')",
    "tags": ["lowercase", "keyword", "strings"]
  }
]

## RULES
1. Process EVERY tab in the tabs array — do not skip any.
2. Use ONLY the first URL in urlHistory.
3. The lastUsed field must remain a number (Unix timestamp in seconds) — do NOT convert it to a date string.
4. The category must be a single short word or two-word phrase. Be consistent — similar topics should get the same category.
5. Tags must be lowercase, single words or hyphenated phrases (e.g. "machine-learning", "open-source"). Include 2 to 5 tags per bookmark.
6. Output must be parseable by JSON.parse() with no modifications — no trailing commas, no comments.
7. Do not include the "icon" or "inactive" fields in the output.

## INPUT DATA
[Paste your raw Firefox JSON here]`

function validateSchema(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('File must contain a non-empty JSON array.')
  }
  const required = ['id', 'title', 'url', 'lastUsed', 'category', 'tags']
  data.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Item at index ${i} is not an object.`)
    }
    for (const field of required) {
      if (!(field in item)) {
        throw new Error(`Item at index ${i} is missing required field: "${field}"`)
      }
    }
    if (typeof item.id !== 'string')       throw new Error(`Item[${i}].id must be a string`)
    if (typeof item.title !== 'string')    throw new Error(`Item[${i}].title must be a string`)
    if (typeof item.url !== 'string')      throw new Error(`Item[${i}].url must be a string`)
    if (typeof item.lastUsed !== 'number') throw new Error(`Item[${i}].lastUsed must be a number`)
    if (typeof item.category !== 'string') throw new Error(`Item[${i}].category must be a string`)
    if (!Array.isArray(item.tags) || !item.tags.every(t => typeof t === 'string')) {
      throw new Error(`Item[${i}].tags must be an array of strings`)
    }
  })
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

export default function UploadView({ onDataLoaded }) {
  const [error, setError]           = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied]         = useState(false)
  const inputRef = useRef(null)

  function processFile(file) {
    if (!file) return
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please upload a valid .json file.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        validateSchema(data)
        onDataLoaded(data)
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  async function handleCopy() {
    await copyToClipboard(PROMPT_TEXT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-start justify-center pt-12 px-4 pb-12">
      <div className="w-full max-w-2xl space-y-5">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Firefox Bookmark Manager</h1>
          <p className="text-slate-500 text-sm">Offline-only. Your data never leaves your browser.</p>
        </div>

        {/* Dropzone */}
        <div
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-500 hover:bg-slate-100'}
            ${error ? 'border-red-400 bg-red-50' : ''}
          `}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => processFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              <p className="font-semibold text-slate-700">Drop your JSON file here</p>
              <p className="text-sm text-slate-500 mt-0.5">or click to browse</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-700">
            <strong>Validation error:</strong> {error}
          </div>
        )}

        {/* Collapsible extraction instructions */}
        <details className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden group">
          <summary className="px-5 py-4 font-semibold text-amber-900 cursor-pointer list-none flex items-center justify-between select-none min-h-[44px]">
            <span>How to export your Firefox tabs</span>
            <svg className="w-4 h-4 text-amber-600 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-5 pb-5 text-sm text-amber-800 space-y-3">
            <p>
              Just building upon Thorsten K. answer (to whom I am grateful for hinting at the right direction),
              on your desktop install the addon <strong>About Sync</strong>. This is the piece of software which
              exposes the info you want. It is not part of vanilla firefox, it is in an addon which was developed
              for developers. From there follow Thorsten K.'s answer steps:
            </p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>open "about:sync" in a new tab, you should see the list "Collections"</li>
              <li>scroll down to "tabs"</li>
              <li>click on "Record Editor (server)"</li>
              <li>in "Select record" select the record of the synced device of which you want want to export the tabs. If you have assigned client names to your devices, it's easy to identify them.</li>
              <li>in the text box below, the list of all entries (one for each synced tab) is shown.</li>
              <li>copy and paste this text into a text editor, and post-process it with text-search-and-replace as needed.</li>
            </ol>
            <p>
              The content is in json format (it is not terribly complex even for non-developers) and the info you
              want should be in the fields "title" and "urlHistory". Just beware that the latter is an array, which
              is to say it can store more than a single url. The only history entry that obviously matches the
              "title" is the first one.
            </p>
            <p className="text-amber-600 text-xs">
              Source:{' '}
              <a
                href="https://stackoverflow.com/a/68309779"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-800"
                onClick={(e) => e.stopPropagation()}
              >
                Stack Overflow answer
              </a>
            </p>
          </div>
        </details>

        {/* AI Prompt Helper */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
            <div>
              <p className="text-slate-200 font-medium text-sm">AI Transformation Prompt</p>
              <p className="text-slate-400 text-xs mt-0.5">Use this with any LLM (ChatGPT, Claude, Gemini, etc.) to transform your raw Firefox export into the required format</p>
            </div>
            <button
              onClick={handleCopy}
              className="ml-4 shrink-0 text-xs px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors min-h-[44px] font-medium"
            >
              {copied ? '✓ Copied!' : 'Copy Prompt'}
            </button>
          </div>
          <pre className="px-5 py-4 text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-auto max-h-56 leading-relaxed">
            {PROMPT_TEXT}
          </pre>
        </div>

      </div>
    </main>
  )
}
