export function validateSchema(data) {
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
