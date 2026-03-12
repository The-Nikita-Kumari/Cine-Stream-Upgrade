// app/page.js
// HOME PAGE — Server Component (default in Next.js App Router)
//
// KEY CONCEPT — WHY THIS FILE IS SPECIAL:
// In the old Vite app, useEffect ran in the BROWSER to fetch popular movies.
// The HTML sent to Google was an empty <div id="root"></div> — not SEO friendly.
//
// In Next.js, this file is a Server Component. The `async/await` fetch runs on
// the SERVER before anything is sent to the browser. Google sees a fully-rendered
// list of movie titles in the HTML response — much better for SEO!

import { fetchPopularMovies } from '../lib/tmdb'
import HomeClient from '../components/HomeClient'

// This generates SEO metadata for the home page
export const metadata = {
  title: 'Discover Movies — CineStream',
  description: 'Browse the most popular movies right now. Search by title and save your favourites.',
}

export default async function HomePage() {
  // ✅ This fetch runs on the SERVER — no API key is exposed to the browser,
  //    and the initial movie list is included in the HTML sent to the client.
  let initialMovies = []
  let initialTotalPages = 1
  let fetchError = null

  try {
    const data = await fetchPopularMovies(1)
    initialMovies = data.results
    initialTotalPages = data.total_pages
  } catch (err) {
    fetchError = err.message
  }

  // Pass the server-fetched data down to the Client Component as props.
  // The Client Component handles search, infinite scroll, and favorites (all
  // features that need browser APIs like localStorage and IntersectionObserver).
  return (
    <HomeClient
      initialMovies={initialMovies}
      initialTotalPages={initialTotalPages}
      fetchError={fetchError}
    />
  )
}
