import { describe, it, expect } from 'vitest'
import { mergeBookmarks } from '../mergeBookmarks'
import type { Bookmark } from '../../types'

const bm = (overrides: Partial<Bookmark>): Bookmark => ({
  id: 'bm_0001',
  title: 'Default Title',
  url: 'https://example.com',
  lastUsed: 1000,
  category: 'Tech',
  tags: ['web'],
  archived: false,
  ...overrides,
})

describe('mergeBookmarks', () => {
  it('adds all incoming when existing is empty', () => {
    const incoming = [
      bm({ id: '1', url: 'https://a.com' }),
      bm({ id: '2', url: 'https://b.com' }),
      bm({ id: '3', url: 'https://c.com' }),
    ]
    const { merged, stats } = mergeBookmarks([], incoming)
    expect(merged).toHaveLength(3)
    expect(stats).toEqual({ added: 3, updated: 0, skipped: 0 })
  })

  it('skips all when incoming has same lastUsed as existing', () => {
    const existing = [bm({ id: '1', url: 'https://a.com', lastUsed: 1000 })]
    const incoming = [bm({ id: '2', url: 'https://a.com', lastUsed: 1000 })]
    const { merged, stats } = mergeBookmarks(existing, incoming)
    expect(merged).toHaveLength(1)
    expect(stats).toEqual({ added: 0, updated: 0, skipped: 1 })
  })

  it('updates metadata when incoming is newer', () => {
    const existing = [bm({ id: 'ex_1', url: 'https://a.com', lastUsed: 1000, title: 'Old Title', category: 'Old', tags: ['old'] })]
    const incoming = [bm({ id: 'in_1', url: 'https://a.com', lastUsed: 2000, title: 'New Title', category: 'New', tags: ['new'] })]
    const { merged, stats } = mergeBookmarks(existing, incoming)
    expect(merged).toHaveLength(1)
    expect(stats).toEqual({ added: 0, updated: 1, skipped: 0 })
    expect(merged[0].title).toBe('New Title')
    expect(merged[0].category).toBe('New')
    expect(merged[0].tags).toEqual(['new'])
    expect(merged[0].lastUsed).toBe(2000)
  })

  it('skips all when incoming is older than existing', () => {
    const existing = [bm({ id: '1', url: 'https://a.com', lastUsed: 2000 })]
    const incoming = [bm({ id: '2', url: 'https://a.com', lastUsed: 500 })]
    const { merged, stats } = mergeBookmarks(existing, incoming)
    expect(merged).toHaveLength(1)
    expect(merged[0].lastUsed).toBe(2000)
    expect(stats).toEqual({ added: 0, updated: 0, skipped: 1 })
  })

  it('handles mixed adds, updates, and skips', () => {
    const existing = [
      bm({ id: 'e1', url: 'https://keep.com', lastUsed: 2000 }),
      bm({ id: 'e2', url: 'https://update.com', lastUsed: 1000 }),
      bm({ id: 'e3', url: 'https://skip.com', lastUsed: 3000 }),
    ]
    const incoming = [
      bm({ id: 'i1', url: 'https://new.com', lastUsed: 500 }),
      bm({ id: 'i2', url: 'https://update.com', lastUsed: 5000 }),
      bm({ id: 'i3', url: 'https://skip.com', lastUsed: 100 }),
    ]
    const { merged, stats } = mergeBookmarks(existing, incoming)
    expect(merged).toHaveLength(4)
    expect(stats).toEqual({ added: 1, updated: 1, skipped: 1 })
  })

  it('preserves archived status on update', () => {
    const existing = [bm({ id: 'ex_1', url: 'https://a.com', lastUsed: 1000, archived: true })]
    const incoming = [bm({ id: 'in_1', url: 'https://a.com', lastUsed: 2000 })]
    const { merged } = mergeBookmarks(existing, incoming)
    expect(merged[0].archived).toBe(true)
  })

  it('sets archived to false for newly added bookmarks', () => {
    const { merged } = mergeBookmarks([], [bm({ url: 'https://new.com' })])
    expect(merged[0].archived).toBe(false)
  })

  it('deduplicates within incoming, keeping highest lastUsed', () => {
    const existing: Bookmark[] = []
    const incoming = [
      bm({ id: 'i1', url: 'https://dup.com', lastUsed: 1000, title: 'Older' }),
      bm({ id: 'i2', url: 'https://dup.com', lastUsed: 3000, title: 'Newer' }),
    ]
    const { merged, stats } = mergeBookmarks(existing, incoming)
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Newer')
    expect(stats.added).toBe(1)
  })

  it('preserves the existing id on update', () => {
    const existing = [bm({ id: 'ex_001', url: 'https://a.com', lastUsed: 1000 })]
    const incoming = [bm({ id: 'in_999', url: 'https://a.com', lastUsed: 2000 })]
    const { merged } = mergeBookmarks(existing, incoming)
    expect(merged[0].id).toBe('ex_001')
  })
})
