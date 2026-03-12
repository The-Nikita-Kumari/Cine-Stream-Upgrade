// app/favorites/page.js
// FAVORITES PAGE — Server Component (wrapper)
//
// The actual favorites content comes from localStorage (a browser API),
// so the real work is done inside FavoritesClient — a Client Component.
// This Server Component just provides the page shell and SEO metadata.

import FavoritesClient from '../../components/FavoritesClient'

export const metadata = {
  title: 'My Favorites — CineStream',
  description: 'Your saved movies — all in one place.',
}

export default function FavoritesPage() {
  return <FavoritesClient />
}
