# CineStream — Next.js 15 Upgrade

A movie discovery app built with **Next.js 15 App Router**, migrated from the original Vite + React (CSR) version.

## What Changed & Why

### The Core Problem with the Vite Version
In the Vite app, React ran **entirely in the browser** (Client-Side Rendering, CSR):

1. Browser requests `index.html`
2. Server sends back an almost-empty HTML file
3. Browser downloads all the JavaScript
4. JavaScript runs, calls `useEffect`, fetches movies from TMDB
5. Finally, movies appear on screen

**SEO problem:** When Google crawls the page at step 2, it sees an empty `<div id="root">`. No movie titles, no metadata — so it can't index the content.

### How Next.js 15 Fixes It (SSR)
With Server-Side Rendering:

1. Browser requests the page
2. **Next.js server fetches movies from TMDB** (before sending any HTML)
3. Server sends back fully-rendered HTML — including all movie titles and images
4. Browser shows the content instantly
5. React "hydrates" — attaches event listeners to the already-visible HTML

Google now sees a full page of movies. ✅

---

## Project Structure

```
cine-stream/
├── app/                        # Next.js App Router pages
│   ├── layout.js               # Root layout (replaces index.html + App.jsx)
│   ├── page.js                 # Home page — SERVER COMPONENT (SSR fetch here)
│   ├── globals.css             # Global styles
│   └── favorites/
│       └── page.js             # Favorites page — Server Component wrapper
│
├── components/                 # Reusable UI components
│   ├── Navbar.jsx              # 'use client' — needs usePathname + localStorage
│   ├── HomeClient.jsx          # 'use client' — search, infinite scroll, favorites
│   ├── FavoritesClient.jsx     # 'use client' — reads localStorage for saved movies
│   ├── MovieGrid.jsx           # 'use client' — renders MovieCard grid
│   ├── MovieCard.jsx           # 'use client' — heart animation + localStorage
│   ├── SearchBar.jsx           # 'use client' — controlled input
│   └── ErrorMessage.jsx        # Server Component — no interactivity needed
│
├── lib/                        # Utility functions
│   ├── tmdb.js                 # TMDB API helpers (server-side, uses Next.js fetch cache)
│   └── favorites.js            # localStorage helpers (client-side only)
│
├── public/                     # Static assets
├── .env.local.example          # Environment variable template
├── .gitignore
├── next.config.mjs
└── package.json
```

---

## Server Components vs Client Components

| Component | Type | Why |
|---|---|---|
| `app/layout.js` | Server | No interactivity, just HTML structure |
| `app/page.js` | Server | Fetches TMDB data on the server for SEO |
| `app/favorites/page.js` | Server | Just a wrapper + metadata |
| `Navbar.jsx` | **Client** | Uses `usePathname`, reads localStorage |
| `HomeClient.jsx` | **Client** | Search state, infinite scroll, favorites |
| `FavoritesClient.jsx` | **Client** | Reads localStorage for saved movies |
| `MovieGrid.jsx` | **Client** | Contains Client Components (MovieCard) |
| `MovieCard.jsx` | **Client** | useState (animation), localStorage |
| `SearchBar.jsx` | **Client** | Controlled input (onChange handler) |
| `ErrorMessage.jsx` | Server | Pure display, no interactivity |

**Rule of thumb:** Only add `'use client'` when the component needs:
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs (`localStorage`, `window`, `document`)
- Event handlers (`onClick`, `onChange`)

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your API key
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` and add your TMDB API key:
```
TMDB_API_KEY=your_actual_api_key_here
```
Get a free key at: https://www.themoviedb.org/settings/api

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
npm start
```

---

## Key Next.js Concepts Used

### File-Based Routing
- `app/page.js` → `/`
- `app/favorites/page.js` → `/favorites`
- No `react-router-dom` needed!

### `next/link` vs React Router's `<Link>`
Next.js has its own `<Link>` component imported from `next/link`. It works the same way but is optimised for Next.js (prefetching, etc.).

### `next/image` vs `<img>`
`<Image>` from `next/image` automatically optimises images — lazy loading, resizing, and converting to WebP/AVIF format. Images must be allowed in `next.config.mjs`.

### Extended `fetch` with caching
Next.js extends the native `fetch` API. You can pass `{ next: { revalidate: 60 } }` to cache the response for 60 seconds on the server — no repeated API calls for every visitor.

### Environment Variables
- `TMDB_API_KEY` (no `NEXT_PUBLIC_` prefix) → **server-only**, never sent to the browser ✅
- `NEXT_PUBLIC_*` → available on both server and browser

---

## Features
- 🔍 **Search** with 500ms debounce (client-side)
- ♾️ **Infinite scroll** — loads more movies as you scroll
- ♥ **Favorites** — saved to localStorage, persists between sessions
- 🚀 **SSR** — first page of popular movies rendered on the server
- 🔎 **SEO** — movie titles and metadata visible to search engine crawlers
- 🖼️ **Optimised images** — via `next/image`
- 🔒 **Secure** — API key never exposed to the browser


## Live URL Link

Check out the application here: https://cine-stream-upgrade.vercel.app/