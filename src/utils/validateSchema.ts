import type { Bookmark } from '../types'

export function validateSchema(data: unknown): asserts data is Bookmark[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('File must contain a non-empty JSON array.')
  }
  const required = ['id', 'title', 'url', 'lastUsed', 'category', 'tags']
  data.forEach((item: unknown, i: number) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Item at index ${i} is not an object.`)
    }
    const obj = item as Record<string, unknown>
    for (const field of required) {
      if (!(field in obj)) {
        throw new Error(`Item at index ${i} is missing required field: "${field}"`)
      }
    }
    if (typeof obj.id !== 'string')       throw new Error(`Item[${i}].id must be a string`)
    if (typeof obj.title !== 'string')    throw new Error(`Item[${i}].title must be a string`)
    if (typeof obj.url !== 'string')      throw new Error(`Item[${i}].url must be a string`)
    if (typeof obj.lastUsed !== 'number') throw new Error(`Item[${i}].lastUsed must be a number`)
    if (typeof obj.category !== 'string') throw new Error(`Item[${i}].category must be a string`)
    if (!Array.isArray(obj.tags) || !obj.tags.every((t: unknown) => typeof t === 'string')) {
      throw new Error(`Item[${i}].tags must be an array of strings`)
    }
  })
}
