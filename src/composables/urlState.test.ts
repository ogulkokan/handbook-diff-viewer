import { describe, expect, it } from 'vitest'

import { parseUrlState, toSearch, type UrlState } from './urlState'

const DEFAULTS: UrlState = { base: null, target: null, changesOnly: false, showFormatting: false }

describe('the state in the address', () => {
  it('reads the two versions and the two switches', () => {
    expect(parseUrlState('?base=1&target=3&only=1&formatting=1')).toEqual({
      base: 1,
      target: 3,
      changesOnly: true,
      showFormatting: true,
    })
  })

  it('gives the defaults for an empty query', () => {
    expect(parseUrlState('')).toEqual(DEFAULTS)
  })

  it('leaves out a value that is not a version number or not "1"', () => {
    expect(parseUrlState('?base=abc&target=-2&only=yes&formatting=true')).toEqual(DEFAULTS)
    expect(parseUrlState('?base=1.5&target=2e3')).toEqual(DEFAULTS)
  })

  it('writes no entry for a default', () => {
    expect(toSearch(DEFAULTS)).toBe('')
    expect(toSearch({ ...DEFAULTS, base: 2, target: 3 })).toBe('?base=2&target=3')
  })

  it('gives back the same state after a write and a read', () => {
    const state: UrlState = { base: 1, target: 3, changesOnly: true, showFormatting: true }

    expect(parseUrlState(toSearch(state))).toEqual(state)
  })
})
