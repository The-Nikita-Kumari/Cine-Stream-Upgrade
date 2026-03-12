// lib/tmdb.js
// Server-side TMDB API helpers.
// These functions run on the server only — the API key is NEVER sent to the browser.

const API_KEY = process.env.TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
export const IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'

if (!API_KEY && typeof window === 'undefined') {
  console.warn(
    '[CineStream] TMDB_API_KEY is not set.\n' +
    'Copy .env.local.example → .env.local and add your TMDB key.\n' +
    'Get one free at: https://www.themoviedb.org/settings/api'
  )
}

/**
 * Build a full image URL from a TMDB poster path.
 * Safe to call from both Server and Client Components.
 * @param {string|null} path  - e.g. "/abc123.jpg"
 * @param {'w300'|'w500'|'original'} size
 */
export function getImageUrl(path, size = 'w500') {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

/**
 * Core fetch wrapper — appends api_key, sets Next.js cache options, handles errors.
 * @param {string} endpoint
 * @param {Record<string, string|number>} params
 * @param {{ revalidate?: number }} options  - Next.js revalidation in seconds
 */
async function tmdbFetch(endpoint, params = {}, options = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))

  // Next.js 15 extended fetch — revalidate every 60 seconds by default
  const res = await fetch(url.toString(), {
    next: { revalidate: options.revalidate ?? 60 },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.status_message || `TMDB error ${res.status}`)
  }

  return res.json()
}

/**
 * Fetch popular movies — paginated.
 * Used in the Home Server Component for the initial SSR render.
 * @param {number} page
 */
export async function fetchPopularMovies(page = 1) {
  return tmdbFetch('/movie/popular', { page, language: 'en-US' })
}

/**
 * Search movies by query — paginated.
 * @param {string} query
 * @param {number} page
 */
export async function searchMovies(query, page = 1) {
  return tmdbFetch(
    '/search/movie',
    { query, page, language: 'en-US', include_adult: false },
    { revalidate: 30 } // search results can change more often
  )
}
