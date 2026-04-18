import { describe, it, expect } from 'vitest'
import { getHostname } from '../getHostname'

describe('getHostname', () => {
  it('extracts hostname from https URL', () => {
    expect(getHostname('https://example.com/path/page')).toBe('example.com')
  })

  it('extracts subdomain hostname', () => {
    expect(getHostname('http://sub.domain.co.uk/foo')).toBe('sub.domain.co.uk')
  })

  it('returns the original string for an invalid URL', () => {
    expect(getHostname('not a url')).toBe('not a url')
  })

  it('returns empty string for empty input', () => {
    expect(getHostname('')).toBe('')
  })
})
