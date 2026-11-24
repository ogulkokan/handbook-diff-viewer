/** The part of the app's state that a link must carry, so that it opens the same view (US7). */
export interface UrlState {
  /** A version number, or null for the default. */
  base: number | null
  target: number | null
  changesOnly: boolean
  showFormatting: boolean
}

function versionIn(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key)
  if (raw === null || !/^\d+$/.test(raw)) return null
  return Number(raw)
}

/** Reads the state from the query of an address. A value that makes no sense is left out. */
export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)
  return {
    base: versionIn(params, 'base'),
    target: versionIn(params, 'target'),
    changesOnly: params.get('only') === '1',
    showFormatting: params.get('formatting') === '1',
  }
}

/** The query for a state, with a leading "?" when it is not empty. A default has no entry. */
export function toSearch(state: UrlState): string {
  const params = new URLSearchParams()
  if (state.base !== null) params.set('base', String(state.base))
  if (state.target !== null) params.set('target', String(state.target))
  if (state.changesOnly) params.set('only', '1')
  if (state.showFormatting) params.set('formatting', '1')
  const query = params.toString()
  return query === '' ? '' : `?${query}`
}
