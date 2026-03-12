'use client'
// components/FavoritesClient.jsx
// CLIENT COMPONENT — the entire favorites feature relies on localStorage,
// which only exists in the browser. So this whole page is a Client Component.
//
// Note: Even Client Components are server-rendered by Next.js on first request!
// The difference is that localStorage isn't available during that server render,
// so we initialise with an empty array and populate it in useEffect.

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import MovieGrid from './MovieGrid'
import { getFavorites } from '../lib/favorites'

export default function FavoritesClient() {
  // Initialise empty — populated in useEffect once we're in the browser
  const [movies, setMovies] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMovies(getFavorites())
    setMounted(true)

    // Re-read when another tab / the navbar updates favorites
    function handleFavChange() {
      setMovies(getFavorites())
    }
    window.addEventListener('cinestream:favchange', handleFavChange)
    return () => window.removeEventListener('cinestream:favchange', handleFavChange)
  }, [])

  // Called by MovieCard when user clicks the heart on this page
  const handleToggle = useCallback(() => {
    // Re-read the full list from localStorage after toggle
    setMovies(getFavorites())
  }, [])

  function handleClearAll() {
    if (window.confirm('Remove all favorites?')) {
      localStorage.removeItem('cinestream_favorites')
      setMovies([])
      window.dispatchEvent(new Event('cinestream:favchange'))
    }
  }

  // Avoid hydration mismatch — show nothing until we're mounted in the browser
  if (!mounted) {
    return (
      <div className="favorites">
        <div className="container">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="favorites">
      <div className="container">
        <header className="favorites__header fade-up">
          <h1 className="favorites__title">♥ My Favorites</h1>
          {movies.length > 0 && (
            <span className="favorites__count">{movies.length} saved</span>
          )}
        </header>

        {movies.length === 0 ? (
          <div className="favorites__empty fade-up">
            <div className="icon">🎬</div>
            <h2>No favorites yet</h2>
            <p>Tap the heart on any movie to save it here.</p>
            {/* Next.js <Link> replaces React Router's <Link> */}
            <Link href="/" className="favorites__cta">
              ▶ Browse Movies
            </Link>
          </div>
        ) : (
          <>
            <div className="favorites__actions">
              <button className="favorites__clear" onClick={handleClearAll} type="button">
                Clear all
              </button>
            </div>
            <MovieGrid
              movies={movies}
              sentinelRef={null}
              onAfterToggle={handleToggle}
            />
          </>
        )}
      </div>
    </div>
  )
}
