'use client'
// components/MovieCard.jsx
// CLIENT COMPONENT — needs:
//   - useState for the heart-pop animation
//   - localStorage access via favorites helpers
//   - Custom DOM event to notify Navbar of count changes
//
// WHY 'use client'?
// This component calls useState and reads/writes localStorage — both are browser-only
// features. The 'use client' directive tells Next.js to also bundle this for the browser.

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { getImageUrl } from '../lib/tmdb'
import { toggleFavorite, isFavorite } from '../lib/favorites'

/**
 * MovieCard — displays poster, title, year, rating, and a favourite toggle.
 *
 * Props:
 *   movie         {object}    — TMDB movie object
 *   innerRef      {Function}  — forwarded to root element (used by IntersectionObserver)
 *   onAfterToggle {Function}  — optional callback after toggling (used by FavoritesPage)
 */
export default function MovieCard({ movie, innerRef, onAfterToggle }) {
  // Read initial fav state from localStorage once we're on the client
  const [isFav, setIsFav] = useState(false)
  const [popping, setPopping] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setIsFav(isFavorite(movie.id))
  }, [movie.id])

  const posterUrl = getImageUrl(movie.poster_path, 'w500')
  const year = movie.release_date?.slice(0, 4) ?? '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  function handleFavClick(e) {
    e.stopPropagation()

    // Animate the heart button
    setPopping(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setPopping(false), 400)

    // Toggle in localStorage and update local state
    const nowFavorited = toggleFavorite(movie)
    setIsFav(nowFavorited)

    // Notify the Navbar so its count badge updates without a page refresh
    window.dispatchEvent(new Event('cinestream:favchange'))

    // Notify parent (e.g. FavoritesPage) if needed
    if (onAfterToggle) onAfterToggle(movie, nowFavorited)
  }

  return (
    <article className="movie-card fade-up" ref={innerRef}>
      <div className="movie-card__poster">
        {posterUrl ? (
          /*
           * Next.js <Image> replaces <img>.
           * It automatically optimises images: resizing, lazy loading, and
           * converting to modern formats (WebP/AVIF). This is better than the
           * plain <img> used in the Vite version.
           */
          <Image
            className="movie-card__img"
            src={posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 600px) 170px, (max-width: 1024px) 190px, 210px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="movie-card__no-poster">
            <span className="icon">🎬</span>
            <span>No Poster</span>
          </div>
        )}

        {/* Overview overlay on hover */}
        {movie.overview && (
          <div className="movie-card__overlay" aria-hidden="true">
            <p className="movie-card__overview">{movie.overview}</p>
          </div>
        )}

        {/* Favourite button */}
        <button
          className={`movie-card__fav${isFav ? ' favorited' : ''}${popping ? ' pop' : ''}`}
          onClick={handleFavClick}
          aria-label={isFav ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
          type="button"
        >
          {isFav ? '♥' : '♡'}
        </button>
      </div>

      <div className="movie-card__info">
        <h3 className="movie-card__title">{movie.title}</h3>
        <div className="movie-card__meta">
          <span className="movie-card__year">{year}</span>
          <span className="movie-card__rating">
            <span className="star">★</span>
            {rating}
          </span>
        </div>
      </div>
    </article>
  )
}
