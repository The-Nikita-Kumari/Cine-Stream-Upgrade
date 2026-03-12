// app/api/movies/route.js
// NEXT.JS API ROUTE — runs on the SERVER only.
//
// This solves the core problem: TMDB_API_KEY is a server-only env variable.
// Client Components (HomeClient.jsx) cannot read it directly.
// So instead of calling TMDB from the browser, the browser calls THIS route,
// and THIS route (running on the server) calls TMDB with the secret key.
//
// Usage:
//   GET /api/movies?type=popular&page=1
//   GET /api/movies?type=search&query=batman&page=1

import { NextResponse } from 'next/server'

// Force this route to always run dynamically (never statically cached by Next.js build)
export const dynamic = 'force-dynamic'

const API_KEY = process.env.TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')   // 'popular' or 'search'
  const query = searchParams.get('query') // search term
  const page = searchParams.get('page') || '1'

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is not set in .env.local' },
      { status: 500 }
    )
  }

  try {
    let endpoint
    const params = new URLSearchParams({ api_key: API_KEY, page, language: 'en-US' })

    if (type === 'search' && query) {
      endpoint = '/search/movie'
      params.set('query', query)
      params.set('include_adult', 'false')
    } else {
      endpoint = '/movie/popular'
    }

    // Use no-store for search (every query is unique/dynamic).
    // Use revalidate for popular (stable list, cache for 60s).
    const fetchOptions =
      type === 'search'
        ? { cache: 'no-store' }
        : { next: { revalidate: 60 } }

    const res = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`, fetchOptions)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.status_message || `TMDB error ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
