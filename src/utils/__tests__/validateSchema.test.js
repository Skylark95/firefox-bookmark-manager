import { describe, it, expect } from 'vitest'
import { validateSchema } from '../validateSchema'

const validBookmark = {
  id: 'bm_0001',
  title: 'Example',
  url: 'https://example.com',
  lastUsed: 1700000000,
  category: 'Tech',
  tags: ['web', 'example'],
}

describe('validateSchema', () => {
  it('throws on null input', () => {
    expect(() => validateSchema(null)).toThrow('non-empty JSON array')
  })

  it('throws on non-array input', () => {
    expect(() => validateSchema({ id: 'bm_0001' })).toThrow('non-empty JSON array')
  })

  it('throws on empty array', () => {
    expect(() => validateSchema([])).toThrow('non-empty JSON array')
  })

  it('throws when item is not an object', () => {
    expect(() => validateSchema(['not an object'])).toThrow('not an object')
  })

  it.each(['id', 'title', 'url', 'lastUsed', 'category', 'tags'])(
    'throws when required field "%s" is missing',
    (field) => {
      const item = { ...validBookmark }
      delete item[field]
      expect(() => validateSchema([item])).toThrow(`missing required field: "${field}"`)
    }
  )

  it('throws when lastUsed is a string', () => {
    expect(() => validateSchema([{ ...validBookmark, lastUsed: '1700000000' }]))
      .toThrow('lastUsed must be a number')
  })

  it('throws when tags is not an array', () => {
    expect(() => validateSchema([{ ...validBookmark, tags: 'web' }]))
      .toThrow('tags must be an array of strings')
  })

  it('throws when tags contains a non-string', () => {
    expect(() => validateSchema([{ ...validBookmark, tags: ['web', 42] }]))
      .toThrow('tags must be an array of strings')
  })

  it('does not throw for a valid single bookmark', () => {
    expect(() => validateSchema([validBookmark])).not.toThrow()
  })

  it('does not throw for multiple valid bookmarks', () => {
    const second = { ...validBookmark, id: 'bm_0002', title: 'Another' }
    expect(() => validateSchema([validBookmark, second])).not.toThrow()
  })
})
