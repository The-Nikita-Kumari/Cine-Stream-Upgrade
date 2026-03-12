'use client'
// components/MovieGrid.jsx
// CLIENT COMPONENT — renders the grid of MovieCards.
// It is a Client Component because MovieCard uses useState for the heart-pop animation
// and event handlers.

import MovieCard from './MovieCard'

/**
 * MovieGrid — renders the responsive CSS grid of MovieCards.
 *
 * Props:
 *   movies        {Array}    — list of TMDB movie objects
 *   sentinelRef   {Function} — ref callback attached to the last card for infinite scroll
 *   onAfterToggle {Function} — optional callback after a favorite is toggled (used by FavoritesPage)
 */
export default function MovieGrid({ movies, sentinelRef, onAfterToggle }) {
  return (
    <div className="movie-grid">
      {movies.map((movie, idx) => {
        const isLast = idx === movies.length - 1
        return (
          <MovieCard
            key={`${movie.id}-${idx}`}
            movie={movie}
            innerRef={isLast && sentinelRef ? sentinelRef : null}
            onAfterToggle={onAfterToggle}
          />
        )
      })}
    </div>
  )
}
