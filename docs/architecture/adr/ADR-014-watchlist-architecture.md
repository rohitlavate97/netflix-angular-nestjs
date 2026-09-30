# ADR-014: Profile Watchlist Architecture, Queue Management & My List Experience

## Status

Accepted

## Context

Streaming platforms depend heavily on a personalized curation queue ("My List" / Watchlist) to boost user engagement and retention. Users expect to bookmark movies and television series effortlessly across the catalog, manage their queue from any device, and browse their saved titles in a dedicated view.

Key operational and architectural requirements:
1. **Profile-Level Isolation**: Watchlists must be strictly partitioned by profile (`profileId`), ensuring family members sharing an account maintain distinct queues and personalized content recommendations.
2. **Idempotency & Duplicate Prevention**: The data layer must enforce unique constraints (`['profileId', 'movieId']` and `['profileId', 'seriesId']`) to prevent race conditions or duplicate entries, with idempotent handling on add.
3. **Instant UI Responsiveness**: Adding or removing items must feel instantaneous. The client application must perform optimistic state updates via Angular Signals while dispatching asynchronous HTTP requests in the background.
4. **Resilient Offline Fallback**: In offline or mock scenarios, the frontend must synchronize with `localStorage` so user selections persist across sessions even when backend connectivity is temporarily interrupted.
5. **Aesthetic 5 UX States**: The dedicated "My List" (`/my-list`) page must support Loading (skeleton shimmer cards), Success (interactive content grid), Empty (helpful guidance and explore CTA), Error (actionable recovery with retry), and dynamic filter/sort states.

## Decision

We implement the complete Phase 12 Watchlist feature across shared contracts, NestJS backend, and Angular frontend:

1. **Shared Contract Definitions (`packages/shared-types`)**:
   - `AddToWatchlistDto`: Request payload containing `profileId`, optional `movieId`, and optional `seriesId`.
   - `WatchlistItemDto`: Normalized representation of a watchlist item with populated movie or series entity details and `addedAt` timestamp.
   - `WatchlistResponseDto`: Envelope returning the collection of items and total count.
   - `WatchlistCheckResponseDto`: Fast boolean verification endpoint response (`isInWatchlist`).

2. **Backend Watchlist Service & Controller (`apps/backend/src/modules/watchlist`)**:
   - `WatchlistController`: Exposes `GET /api/v1/watchlist`, `POST /api/v1/watchlist`, `DELETE /api/v1/watchlist/:id`, and `GET /api/v1/watchlist/check` with OpenAPI Swagger annotations and input validation (`AddToWatchlistDto`, `WatchlistQueryDto`).
   - `WatchlistService`:
     - Queries `Watchlist` repository with relations to `movie`, `series`, and their respective `genres`.
     - Validates that either `movieId` or `seriesId` is provided (mutually exclusive per row).
     - Enforces idempotent insertion: if the item is already present in the profile's queue, the existing record is returned safely without throwing unhandled database duplicate key exceptions.
     - Supports pagination, content type filtering, and deletion by ID or content ID.
   - Registered `WatchlistModule` in `AppModule`.

3. **Frontend Watchlist Experience (`apps/frontend/src/app`)**:
   - `WatchlistService`:
     - Core singleton service managing reactive Signals: `watchlistItems`, `watchlistedContentIds`, and `isLoading`.
     - Provides `addToWatchlist`, `removeFromWatchlist`, `toggleWatchlist`, and `isInWatchlist`.
     - Implements optimistic UI updates with automatic rollback on server error and persistent `localStorage` synchronization.
   - `MyListComponent`:
     - Standalone route at `/my-list`.
     - Content filtering controls (`All`, `Movies`, `TV Series`) and sorting controls (`Recently Added`, `Title A-Z`, `Rating`).
     - Responsive grid displaying `ContentCardComponent` with quick removal actions and navigation to content details.
     - Full 5 UX states implementation (shimmer loading, empty CTA, error state with retry button).

4. **Testing Suite Coverage**:
   - Backend unit tests: `watchlist.service.spec.ts` (10 tests) and `watchlist.controller.spec.ts` (4 tests).
   - Backend E2E integration tests: `watchlist.e2e-spec.ts` (4 tests).
   - Frontend unit tests: `watchlist.service.spec.ts` (5 tests) and `my-list.component.spec.ts` (9 tests).
   - Verified 100% test pass rate across backend and frontend workspaces.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing a profile-scoped watchlist system spanning PostgreSQL entities, NestJS REST endpoints, Angular Signals reactive state, and the My List UI.
2. **Why are we doing it?**  
   To allow users to save, organize, and quickly access titles they intend to watch, increasing platform engagement and watch time.
3. **What problem does it solve?**  
   Prevents duplicate watchlist rows through composite database constraints, decouples user queues across multiple profiles on the same account, and provides zero-latency optimistic interactions on the frontend.
4. **What alternatives exist?**  
   - Storing watchlist exclusively on the client (localStorage): Breaks cross-device synchronization.
   - Storing watchlist at the account level: Pollutes queues when multiple users (e.g. kids, parents) share one subscription.
5. **Why was this approach selected?**  
   Profile-level relational persistence backed by composite unique indexes ensures data integrity, while client-side Angular Signals provide an immediate, app-like streaming experience.
