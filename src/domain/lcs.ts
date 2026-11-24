/**
 * A longest common subsequence of two lists, as pairs of indexes [index in a, index in b].
 * The pairs rise on both sides. When more than one longest subsequence exists, the result is one of them.
 *
 * The table has a.length times b.length cells. The lists here are the words of one paragraph
 * or the children of one node, so both stay small.
 */
export function lcsPairs<T>(
  a: readonly T[],
  b: readonly T[],
  equal: (x: T, y: T) => boolean = Object.is,
): Array<[number, number]> {
  const rows = a.length + 1
  const columns = b.length + 1
  // length[i * columns + j] is the length of the result for a.slice(i) and b.slice(j).
  const length = new Uint32Array(rows * columns)

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      length[i * columns + j] = equal(a[i]!, b[j]!)
        ? length[(i + 1) * columns + j + 1]! + 1
        : Math.max(length[(i + 1) * columns + j]!, length[i * columns + j + 1]!)
    }
  }

  const pairs: Array<[number, number]> = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (equal(a[i]!, b[j]!)) {
      pairs.push([i, j])
      i++
      j++
    } else if (length[(i + 1) * columns + j]! >= length[i * columns + j + 1]!) {
      i++
    } else {
      j++
    }
  }
  return pairs
}
