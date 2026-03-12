'use client'
// components/HomeClient.jsx
// CLIENT COMPONENT — handles all interactive features.
//
// FIX: Instead of importing lib/tmdb.js (which uses a server-only env variable),
// we now call our own Next.js API route at /api/movies.
// The API route runs on the server and safely uses TMDB_API_KEY.

import { useState, useEffect, useCallback, useRef } from 'react'
import SearchBar from './SearchBar'
import MovieGrid from './MovieGrid'
import ErrorMessage from './ErrorMessage'

// ── Internal API helpers (call our own server, not TMDB directly) ─────────────

async function fetchPopularMovies(page = 1) {
  const res = await fetch(`/api/movies?type=popular&page=${page}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

async function searchMovies(query, page = 1) {
  const res = await fetch(`/api/movies?type=search&query=${encodeURIComponent(query)}&page=${page}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

// ── Debounce hook ──────────────────────────────────────────────────────────────
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── Infinite scroll hook ───────────────────────────────────────────────────────
function useInfiniteScroll(hasMore, isLoading, onLoadMore) {
  const observerRef = useRef(null)
  return useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (isLoading || !hasMore) return
      observerRef.current = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) onLoadMore() },
        { rootMargin: '0px 0px 200px 0px', threshold: 0 }
      )
      if (node) observerRef.current.observe(node)
    },
    [hasMore, isLoading, onLoadMore]
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function HomeClient({ initialMovies, initialTotalPages, fetchError }) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 500)

  const [movies, setMovies] = useState(initialMovies ?? [])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages ?? 1)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState(fetchError ?? null)

  // Track whether initial SSR data is already loaded to avoid double-fetching page 1
  const initialLoadDone = useRef(initialMovies && initialMovies.length > 0)

  const mode = debouncedQuery.trim() ? 'search' : 'popular'

  // ── Reset when query changes ─────────────────────────────────────────────────
  useEffect(() => {
    setMovies([])
    setPage(1)
    setTotalPages(1)
    setError(null)
    initialLoadDone.current = false
  }, [debouncedQuery])

  // ── Fetch page ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip: initial popular data already came from SSR
    if (mode === 'popular' && page === 1 && initialLoadDone.current) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data =
          mode === 'search'
            ? await searchMovies(debouncedQuery, page)
            : await fetchPopularMovies(page)

        if (cancelled) return
        setTotalPages(data.total_pages)
        setMovies((prev) => page === 1 ? data.results : [...prev, ...data.results])
        if (mode === 'popular' && page === 1) initialLoadDone.current = true
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [debouncedQuery, page, mode])

  const hasMore = page < totalPages
  const loadMore = useCallback(() => setPage((p) => p + 1), [])
  const sentinelRef = useInfiniteScroll(hasMore, isLoading, loadMore)

  return (
    <div className="home">
      <div className="container">

        <header className="home__hero fade-up">
          <div className="home__hero-eyebrow">
            <span>▶</span> Powered by TMDB
          </div>
          <h1 className="home__hero-title">
            Find Your<br /><span className="highlight">Next Film</span>
          </h1>
          <p className="home__hero-sub">
            Browse thousands of movies. Save your favourites. Never run out of things to watch.
          </p>
          <div className="home__search-wrapper">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="ssr-badge">Server-Side Rendered</div>
        </header>

        <p className="home__mode">
          {mode === 'search'
            ? <>Results for <span className="query">"{searchQuery}"</span></>
            : 'Showing popular movies'}
        </p>

        <div className="home__section-header">
          <h2 className="home__section-title">
            {mode === 'search' ? 'Search Results' : 'Popular Now'}
          </h2>
          {movies.length > 0 && (
            <span className="home__section-count">{movies.length} loaded</span>
          )}
        </div>

        {error && <ErrorMessage message={error} />}
        {isLoading && movies.length === 0 && <div className="spinner" />}

        {movies.length > 0 && (
          <MovieGrid movies={movies} sentinelRef={sentinelRef} />
        )}

        {!isLoading && !error && movies.length === 0 && searchQuery && (
          <div className="home__empty fade-up">
            <div className="icon">🎬</div>
            <h3>No movies found</h3>
            <p>Try a different search term</p>
          </div>
        )}

        {isLoading && movies.length > 0 && (
          <div className="home__loading-more">
            <div className="spinner" />
            <span>Loading more movies…</span>
          </div>
        )}

        {!hasMore && !isLoading && movies.length > 0 && (
          <p className="home__end">— End of results —</p>
        )}

      </div>
    </div>
  )
}
