# ADR-015: Watch History, Throttled Playback Progress & Continue Watching Architecture

## Status

Accepted

## Context

Streaming platforms depend critically on continuous playback resumption and user watch history. When users switch devices or pause midway through a title, they expect to pick up seamlessly where they left off without losing progress.

Key operational and architectural requirements:
1. **High-Frequency Playback Throttling**: Video players generate playback tick events continuously (often once or twice per second). Directly writing to the PostgreSQL database on every tick would exhaust connection pools and degrade performance. The client architecture must throttle progress reports to 5-second intervals, supplemented with an immediate flush on pause, modal dismissal, or page unload.
2. **Dual-Tier Resumption Caching**: Resume position queries must respond with sub-millisecond latency. A dual-tier lookup strategy utilizes Redis (`watch:progress:${profileId}:${contentId}`) with a 24-hour TTL as the fast path, backed by relational persistence in PostgreSQL.
3. **Continue Watching Aggregation**: The homepage "Continue Watching" queue must surface in-progress content (`positionSeconds > 10` and `completed = false`), compute remaining minutes dynamically, and cache the aggregated list in Redis for 60 seconds.
4. **Profile Isolation & History Removal**: Watch history records are strictly partitioned by profile (`profileId`). Users must be able to remove individual items from their queue or clear their viewing history entirely.
5. **Aesthetic 5 UX States**: Both the homepage Continue Watching carousel and the dedicated Viewing Activity (`/history`) page must handle Loading (shimmer skeletons), Success (rich media list with progress bars), Empty (friendly guidance and catalog CTA), Error (actionable recovery with retry), and dynamic feedback toasts.

## Decision

We implement the complete Phase 13 Watch History & Resume feature across shared contracts, NestJS backend, and Angular frontend workspaces:

1. **Shared Contract Definitions (`packages/shared-types`)**:
   - `ReportWatchProgressDto`: Request payload containing `profileId`, `movieId` / `episodeId`, `positionSeconds`, `durationSeconds`, and `completed`.
   - `WatchHistoryItemDto`: Detailed historical entry with populated Movie or Episode relations, timestamps, and completion flags.
   - `ContinueWatchingItemDto`: Enriched card data with title, subtitle (e.g. `S1:E3 Into the Void`), progress percentage, and calculated `remainingMinutes`.
   - `ResumePlaybackDto`: Exact resume point metadata consumed by player and details view.
   - `WatchHistoryResponseDto` & `ContinueWatchingResponseDto`: Standard API envelopes.

2. **Backend Watch History Service & Controller (`apps/backend/src/modules/watch-history`)**:
   - `WatchHistoryController`: Exposes `POST /api/v1/watch-history/progress`, `GET /api/v1/watch-history/continue-watching`, `GET /api/v1/watch-history/resume`, `GET /api/v1/watch-history`, `DELETE /api/v1/watch-history/:id`, and `DELETE /api/v1/watch-history/profile/:profileId` with Swagger OpenAPI documentation.
   - `WatchHistoryService`:
     - Calculates `progressPercentage` and automatically flags `completed = true` once playback reaches 95% of total duration.
     - Performs idempotent upserts per `(profileId, movieId)` or `(profileId, episodeId)`.
     - Caches progress records in Redis with 86,400s (24h) TTL and invalidates the continue-watching cache on write.
     - Aggregates continue-watching records joining movie and series episodes.
   - Registered `WatchHistoryModule` in `AppModule`.

3. **Frontend Watch History & Resume Experience (`apps/frontend/src/app`)**:
   - `WatchHistoryService`:
     - Core Angular singleton service with reactive Signals: `continueWatchingList`, `watchHistoryList`, and `isLoading`.
     - Throttled progress pipeline using RxJS `progressSubject.pipe(throttleTime(5000, asyncScheduler, { leading: true, trailing: true }))`.
     - Offline persistence via `localStorage` ensuring instant zero-latency resumption and offline demo resilience.
   - `WatchHistoryComponent`:
     - Standalone feature component registered at `/history`.
     - Filter tabs (`All`, `In Progress`, `Completed`), individual item removal, clear all history modal, and 5 UX states.
   - UI Integrations:
     - `HomeComponent`: Connected dynamic Continue Watching row with real profile progress and remaining time indicators.
     - `ContentRowComponent`: Enhanced progress bar and remaining minutes badge with inline remove action.
     - `ContentDetailsComponent`: Integrated "Resume (Xm left)" and "Restart" actions alongside progress indicators.
     - `NavbarComponent`: Added "Viewing Activity" shortcut in the profile dropdown menu.

4. **Testing Suite Coverage**:
   - Backend unit tests: `watch-history.service.spec.ts` (14 tests) and `watch-history.controller.spec.ts` (6 tests). Total backend unit tests: 187/187 passing across 26 suites.
   - Backend E2E integration tests: `watch-history.e2e-spec.ts` (5 tests). Total backend E2E tests: 53/53 passing across 7 suites.
   - Frontend unit tests: `watch-history.service.spec.ts` (5 tests), `watch-history.component.spec.ts` (7 tests), updated `home.component.spec.ts`, `content-row.component.spec.ts`, and `content-details.component.spec.ts`. Total frontend unit tests: 123/123 passing.
   - Linter: 0 errors and 0 warnings.
   - Monorepo build: Clean build across `@netflix/shared-types`, `@netflix/backend`, and `@netflix/frontend`.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing a profile-partitioned watch history and playback resumption system with throttled client progress reporting, Redis dual-tier caching, and responsive frontend UI views.
2. **Why are we doing it?**  
   To allow users to resume playback seamlessly from where they paused on any device, while safeguarding backend database resources from high-frequency playback heartbeat floods.
3. **What problem does it solve?**  
   Prevents database write bottlenecks through client-side throttling (5s) and Redis buffering, eliminates resume latency through fast-path cache queries, and keeps continue-watching queues synchronized with actual viewing progress.
4. **What alternatives exist?**  
   - Direct database write on every timeupdate event: Unscalable; creates unsustainable database load under production concurrency.
   - Client-only localStorage tracking: Breaks cross-device synchronization and fails when users switch browsers.
5. **Why was this approach selected?**  
   Client-side throttling combined with server-side Redis caching and PostgreSQL relational persistence offers the ideal balance of sub-millisecond response times, low database overhead, and cross-device consistency.
