// app/layout.js
// ROOT LAYOUT — Server Component
// This is the equivalent of index.html + the <App> wrapper in the old Vite project.
// It wraps every page with the Navbar and global styles.
// Because it is a Server Component, it renders on the server and sends full HTML
// to the browser (great for SEO).

import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: {
    default: 'CineStream — Discover Movies',
    template: '%s | CineStream',
  },
  description:
    'Browse thousands of movies, search by title, and save your favourites. Powered by TMDB.',
  keywords: ['movies', 'films', 'TMDB', 'discover', 'watch', 'favorites'],
  openGraph: {
    title: 'CineStream — Discover Movies',
    description: 'Browse thousands of movies. Save your favourites. Never run out of things to watch.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="app">
          {/*
            Navbar is a Client Component (needs usePathname for active link highlighting).
            Even though it is a Client Component, Next.js still server-renders it on
            the first request — "use client" only means it also runs on the browser.
          */}
          <Navbar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
