import { describe, it, expect } from 'vitest'
import { formatDate } from '../formatDate'

describe('formatDate', () => {
  it('formats a known timestamp correctly', () => {
    // 2020-01-15T12:00:00Z — midday UTC, safe across all UTC±11 timezones
    expect(formatDate(1579089600)).toBe('Jan 15, 2020')
  })

  it('formats epoch 0 without throwing', () => {
    expect(() => formatDate(0)).not.toThrow()
  })

  it('formats a far-future timestamp', () => {
    // 2038-01-19
    const result = formatDate(2147483647)
    expect(result).toMatch(/2038/)
  })

  it('output contains a 3-letter month abbreviation and 4-digit year', () => {
    const result = formatDate(1700000000)
    expect(result).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/)
  })
})
