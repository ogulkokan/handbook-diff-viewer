import { describe, expect, it } from 'vitest'

import { lcsPairs } from './lcs'

const letters = (text: string) => text.split('')

describe('lcsPairs', () => {
  it('finds a longest common subsequence of two lists', () => {
    // A textbook pair: the longest common subsequence of ABCBDAB and BDCABA has 4 items.
    const a = letters('ABCBDAB')
    const b = letters('BDCABA')

    const pairs = lcsPairs(a, b)

    expect(pairs).toHaveLength(4)
    for (const [i, j] of pairs) expect(a[i]).toBe(b[j])
  })

  it('gives the pairs in rising order on both sides', () => {
    const pairs = lcsPairs(letters('ABCBDAB'), letters('BDCABA'))

    for (let n = 1; n < pairs.length; n++) {
      expect(pairs[n]![0]).toBeGreaterThan(pairs[n - 1]![0])
      expect(pairs[n]![1]).toBeGreaterThan(pairs[n - 1]![1])
    }
  })

  it('pairs each item of two equal lists', () => {
    expect(lcsPairs(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ])
  })

  it('gives no pair when a list is empty or nothing is shared', () => {
    expect(lcsPairs([], ['a'])).toEqual([])
    expect(lcsPairs(['a'], ['b'])).toEqual([])
  })

  it('keeps two of three items when two neighbours swap', () => {
    // The order of sec-comms in v1 and v2: one clause moved, two stayed.
    expect(
      lcsPairs(['channels', 'meetings', 'response'], ['meetings', 'channels', 'response']),
    ).toHaveLength(2)
  })

  it('takes a function that says when two items are equal', () => {
    const pairs = lcsPairs(['A', 'b'], ['a', 'B'], (x, y) => x.toLowerCase() === y.toLowerCase())

    expect(pairs).toEqual([
      [0, 0],
      [1, 1],
    ])
  })
})
