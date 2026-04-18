import { describe, it, expect } from 'vitest'
import { filterBookmarks } from '../filterBookmarks'

const bm = (overrides) => ({
  id: 'bm_0001',
  title: 'Default Title',
  url: 'https://example.com',
  lastUsed: 1000,
  category: 'Tech',
  tags: ['web'],
  ...overrides,
})

const FIXTURES = [
  bm({ id: '1', title: 'Alpha Article', url: 'https://alpha.com', lastUsed: 3000, category: 'News', tags: ['politics', 'world'] }),
  bm({ id: '2', title: 'Beta Tool',    url: 'https://beta.dev',  lastUsed: 1000, category: 'Tech', tags: ['tools', 'dev'] }),
  bm({ id: '3', title: 'Gamma Guide',  url: 'https://gamma.io',  lastUsed: 2000, category: 'Tech', tags: ['dev', 'reference'] }),
]

const defaults = { activeCategory: null, activeTags: [], searchQuery: '', sortOrder: 'newest' }

describe('filterBookmarks', () => {
  it('returns all bookmarks when no filters are applied', () => {
    expect(filterBookmarks(FIXTURES, defaults)).toHaveLength(3)
  })

  it('filters by activeCategory', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, activeCategory: 'Tech' })
    expect(result).toHaveLength(2)
    expect(result.every(b => b.category === 'Tech')).toBe(true)
  })

  it('filters by a single active tag', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, activeTags: ['dev'] })
    expect(result).toHaveLength(2)
    expect(result.map(b => b.id)).toEqual(expect.arrayContaining(['2', '3']))
  })

  it('filters by multiple tags (AND logic)', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, activeTags: ['dev', 'reference'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('filters by search query matching title', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, searchQuery: 'gamma' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('filters by search query matching URL', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, searchQuery: 'alpha.com' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('search query is case-insensitive', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, searchQuery: 'BETA' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('multi-term search requires all terms to match', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, searchQuery: 'beta dev' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('sorts by newest (lastUsed descending)', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, sortOrder: 'newest' })
    expect(result.map(b => b.id)).toEqual(['1', '3', '2'])
  })

  it('sorts by oldest (lastUsed ascending)', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, sortOrder: 'oldest' })
    expect(result.map(b => b.id)).toEqual(['2', '3', '1'])
  })

  it('sorts alphabetically by title', () => {
    const result = filterBookmarks(FIXTURES, { ...defaults, sortOrder: 'alpha' })
    expect(result.map(b => b.title)).toEqual(['Alpha Article', 'Beta Tool', 'Gamma Guide'])
  })
})
