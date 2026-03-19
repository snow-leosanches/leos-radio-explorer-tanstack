# Leo's Radio Explorer

Discover and stream thousands of live radio stations from every genre and corner of the world — free, no sign-up needed.

## Features

- **Live streaming** — HLS + direct stream support via HTML5 audio
- **Persistent player** — bottom bar stays across all pages, just like Spotify
- **Browse by genre** — 60+ genres with curated artwork and colour coding
- **Browse by country** — 190+ countries with flag display and station counts
- **Real-time search** — instant results by name, genre, or country (⌘K from anywhere)
- **Library** — save favourite stations to localStorage, undo removals via toast
- **Station detail pages** — artwork, metadata, related stations, vote counts
- **Dark mode** — system-aware with manual override, flicker-free
- **Accessible** — keyboard navigation, focus rings, ARIA labels, 44px touch targets

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, SSR) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + custom design tokens |
| Audio | HTML5 `<audio>` + [HLS.js](https://github.com/video-dev/hls.js) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Radio data | [Radio Browser API](https://www.radio-browser.info) |
| Fonts | Manrope (UI) + Fraunces (display) |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build    # production build
pnpm start    # serve the built output
```

## Project Structure

```
src/
├── components/
│   ├── home/          # HeroBanner, FeaturedRail, GenreGrid
│   ├── player/        # AudioPlayer (bottom bar)
│   ├── search/        # SearchInput
│   ├── station/       # StationDetailHero, RelatedStations
│   └── ui/            # StationCard, FavoriteButton, EmptyState, …
├── context/
│   ├── PlayerContext.tsx   # Audio playback state (useReducer + HLS.js)
│   └── LibraryContext.tsx  # Saved stations (localStorage)
├── hooks/
│   └── useDebounce.ts
├── lib/
│   ├── radio-browser.ts    # Radio Browser API client
│   ├── query-keys.ts       # TanStack Query key factory
│   └── genre-meta.ts       # Genre emoji/colour map + flagEmoji()
└── routes/
    ├── __root.tsx
    ├── index.tsx            # Discover / Home
    ├── search.tsx
    ├── library.tsx
    ├── about.tsx
    ├── genres/
    │   ├── index.tsx
    │   └── $genre.tsx
    ├── countries/
    │   ├── index.tsx
    │   └── $country.tsx
    └── stations/
        └── $stationId.tsx
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SNOWPLOW_COLLECTOR_URL` | No | Snowplow analytics collector endpoint (analytics silently disabled if unset) |

## Data Source

Station data is provided by [Radio Browser](https://www.radio-browser.info) — a free, community-maintained, open database of internet radio stations. No API key required.

## License

MIT
