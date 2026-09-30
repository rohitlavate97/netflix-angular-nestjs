# ADR-012: Dedicated Content Details View & Episodic Picker Architecture

## Status

Accepted

## Context

Streaming platforms require a dedicated, permalinkable content details page (`/title/:id`) to complement in-context modal previews. This page must:
1. Support deep linking and direct URL access (e.g. from external shares, bookmarks, search engine results, or notifications).
2. Display rich metadata: cinematic hero backdrop, match percentage, maturity advisory ratings, audio/subtitle language tracks, release year, and genres.
3. Provide full TV series navigation with season dropdown selection and detailed episode lists showing thumbnails, runtimes, episode synopses, and direct play buttons.
4. Render personalized "More Like This" recommendation grids to encourage continued exploration.
5. Adhere to the core Netflix streaming architecture: 5 UX states (Loading, Success, Empty, Error, Retry), Angular standalone components with Signals reactivity, and strict TypeScript contracts.

## Decision

We implement the complete Phase 10 Content Details View in `apps/frontend/src/app/features/details/`:

1. **Dedicated Route Configuration (`/title/:id`)**:
   - Added lazy-loaded route in `apps/frontend/src/app/app.routes.ts` mapping `/title/:id` to `ContentDetailsComponent`.
   - Utilizes Angular's router input binding (`withComponentInputBinding()`) to automatically bind the route parameter `:id` to `@Input() id`.

2. **Full Page Orchestration (`ContentDetailsComponent`)**:
   - High-fidelity cinematic hero section with radial and linear gradients for contrast.
   - Quick action controls: "Play" (navigates to `/watch/:id`), Watchlist toggle with visual bookmark feedback, Like, and Native Clipboard Share with toast notification.
   - Metadata breakdown: Dynamic match rating calculation, release year, age rating pill, 4K UHD, HDR10, and Dolby Atmos badges.
   - Comprehensive error recovery: Retry handler via `(retry)="loadContent()"`, loading skeleton state, and 404 empty state.
   - "More Like This" recommendation cards with seamless route switching.

3. **Season Selector (`SeasonSelectorComponent`)**:
   - Clean, accessible dropdown selector displaying season title/number and episode counts.
   - Emits strongly typed `(seasonSelect)` events when season selection changes.

4. **Episode Picker (`EpisodePickerComponent`)**:
   - Responsive episodic list displaying episode number, thumbnail, hover play button, duration badge, title, and synopsis.
   - Emits `(playEpisode)` with route navigation to `/watch/:id?episode=:episodeId`.
   - Built-in empty fallback state for seasons with pending uploads.

5. **Cast & Advisory Metadata (`CastListComponent`)**:
   - Formatted pills for cast members, genre tags, directors/creators, and content advisory warnings (e.g., "Sci-Fi Violence", "Intense Sequences").

6. **Shared Types Contract Alignment**:
   - Updated `SeriesDto` in `packages/shared-types/src/content.types.ts` to include optional `averageRating?: number`, maintaining unified type parity across movies and series.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing the dedicated `/title/:id` content details page with full TV series season/episode selectors, cast list, content advisories, and "More Like This" recommendation grids.
2. **Why are we doing it?**  
   To enable direct URL navigation, deep content exploration, and season-by-season episode browsing beyond the quick modal preview.
3. **What problem does it solve?**  
   Allows users to bookmark, share, and directly browse complete series episode catalogs and production metadata with seamless playback routing.
4. **What alternatives exist?**  
   - Restricting content details exclusively to modals: Prevents direct URL sharing and limits multi-season series browsing on mobile devices.
   - Traditional page reloads: Creates sluggish transitions and destroys playback state.
5. **Why was this approach selected?**  
   Standalone Angular components with Angular Signals and route input binding deliver lightning-fast client transitions, zero unnecessary re-renders, and full type safety across frontend and backend boundaries.
