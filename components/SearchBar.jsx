'use client'
// components/SearchBar.jsx
// CLIENT COMPONENT — needs 'use client' because it uses controlled input state.
// The parent (HomeClient) owns the `value` and `onChange` — this component is "dumb".
//
// WHY 'use client'?
// The onChange handler and the input's controlled state require React hooks,
// which need to run in the browser. Any component that handles user events
// (typing, clicking) needs 'use client'.

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">🔍</span>
      <input
        className="search-bar__input"
        type="search"
        placeholder="Search movies, genres, actors…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search movies"
        autoComplete="off"
        spellCheck="false"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  )
}
