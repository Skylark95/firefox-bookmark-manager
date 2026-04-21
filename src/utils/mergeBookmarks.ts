import type { Bookmark } from '../types'

export interface MergeStats {
  added: number;
  updated: number;
  skipped: number;
}

export interface MergeResult {
  merged: Bookmark[];
  stats: MergeStats;
}

export function mergeBookmarks(existing: Bookmark[], incoming: Bookmark[]): MergeResult {
  const stats: MergeStats = { added: 0, updated: 0, skipped: 0 }

  const existingByUrl = new Map<string, Bookmark>(existing.map(bm => [bm.url, bm]))

  // Deduplicate incoming against itself, keeping highest lastUsed per URL
  const incomingByUrl = new Map<string, Bookmark>()
  for (const bm of incoming) {
    const current = incomingByUrl.get(bm.url)
    if (!current || bm.lastUsed > current.lastUsed) {
      incomingByUrl.set(bm.url, bm)
    }
  }

  for (const bm of incomingByUrl.values()) {
    const ex = existingByUrl.get(bm.url)
    if (!ex) {
      existingByUrl.set(bm.url, { ...bm, archived: false })
      stats.added++
    } else if (bm.lastUsed > ex.lastUsed) {
      existingByUrl.set(bm.url, {
        ...ex,
        title: bm.title,
        category: bm.category,
        tags: bm.tags,
        lastUsed: bm.lastUsed,
      })
      stats.updated++
    } else {
      stats.skipped++
    }
  }

  return { merged: Array.from(existingByUrl.values()), stats }
}
