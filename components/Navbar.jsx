'use client'
// components/Navbar.jsx
// CLIENT COMPONENT — needs `usePathname` (browser router API) for active link styling,
// and reads localStorage for the favorites count.
// The 'use client' directive tells Next.js this component also runs in the browser.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getFavorites } from '../lib/favorites'

export default function Navbar() {
  const pathname = usePathname()

  // Read favorites count from localStorage on the client.
  // We initialise to 0 to avoid a hydration mismatch (server doesn't have localStorage).
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    // Update count on mount
    setFavCount(getFavorites().length)

    // Listen for a custom event that MovieCard dispatches when favorites change
    function handleFavChange() {
      setFavCount(getFavorites().length)
    }
    window.addEventListener('cinestream:favchange', handleFavChange)
    return () => window.removeEventListener('cinestream:favchange', handleFavChange)
  }, [])

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Next.js <Link> replaces React Router's <NavLink> */}
        <Link href="/" className="navbar__logo">
          <span className="navbar__logo-icon">▶</span>
          <span className="navbar__logo-text">Cine<span>Stream</span></span>
        </Link>

        <div className="navbar__links">
          <Link
            href="/"
            className={`navbar__link${pathname === '/' ? ' active' : ''}`}
          >
            Discover
          </Link>

          <Link
            href="/favorites"
            className={`navbar__link${pathname === '/favorites' ? ' active' : ''}`}
          >
            <span className="navbar__fav-badge">
              ♥ Favorites
              {favCount > 0 && <span className="count">{favCount}</span>}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
