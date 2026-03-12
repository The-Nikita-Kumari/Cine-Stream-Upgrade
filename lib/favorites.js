// lib/favorites.js
// localStorage helpers for the favorites feature.
// These functions are called from Client Components only.

const STORAGE_KEY = 'cinestream_favorites'

/**
 * Read all saved favorites from localStorage.
 * @returns {Array} array of movie objects
 */
export function getFavorites() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

/**
 * Check if a movie id is already in favorites.
 * @param {number} id
 */
export function isFavorite(id) {
  return getFavorites().some((m) => m.id === id)
}

/**
 * Add a movie to favorites. No-op if already present.
 * @param {object} movie
 */
export function addFavorite(movie) {
  const list = getFavorites()
  if (!list.some((m) => m.id === movie.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, movie]))
  }
}

/**
 * Remove a movie from favorites by id.
 * @param {number} id
 */
export function removeFavorite(id) {
  const list = getFavorites().filter((m) => m.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/**
 * Toggle a movie in favorites.
 * @param {object} movie
 * @returns {boolean} true if now favorited, false if removed
 */
export function toggleFavorite(movie) {
  if (isFavorite(movie.id)) {
    removeFavorite(movie.id)
    return false
  } else {
    addFavorite(movie)
    return true
  }
}
