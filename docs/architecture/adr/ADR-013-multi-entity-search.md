# ADR-013: Multi-Entity Search Architecture, Debounced Instant Queries & Redis Caching

## Status

Accepted

## Context

Discovery on a modern streaming platform depends heavily on an instant, multi-entity search engine. Users search not only for exact movie and TV series titles, but also by genre, actors, plot keywords, and directors.

Key operational and architectural requirements:
1. **Multi-Entity Catalog Coverage**: Query across Movies and TV Series simultaneously, including associated genres, descriptions, and metadata.
2. **Instant Search with Query Debouncing**: Avoid spamming backend HTTP services on every keystroke by implementing client-side debouncing (`debounceTime(350)` with `distinctUntilChanged`).
3. **Relevance Scoring & Flexible Sorting**: Rank exact and prefix title matches higher than broad description matches, while supporting sort filters (Newest Releases, Highest Rated, Title A-Z).
4. **Fast Query Caching**: Leverage Redis caching with deliberate TTLs (300 seconds / 5 minutes) to ensure high throughput and reduced PostgreSQL database load for frequent search terms.
5. **Aesthetic 5 UX States**: Deliver a polished Netflix dark streaming UI with shimmer loading skeleton cards, empty state with intelligent recommendations and popular keywords, error recovery, and instant deep-linking via query parameters (`/search?q=...`).

## Decision

We implement the complete Phase 11 Search feature across backend and frontend workspaces:

1. **Shared Contract Definitions (`packages/shared-types`)**:
   - Authored `SearchQueryDto`, `SearchResultItemDto`, `SearchResultsResponseDto`, and enums `SearchEntityType` (`all`, `movie`, `series`) and `SearchSortBy` (`relevance`, `newest`, `rating`, `title`).

2. **Backend Search Service & Controller (`apps/backend/src/modules/search`)**:
   - `SearchController`: Exposes `GET /api/v1/search` with Swagger OpenAPI documentation and strict `class-validator` input validation (`SearchQueryDto`).
   - `SearchService`:
     - Evaluates Redis search cache key (`search:v1:...`) with 300s TTL.
     - Constructs TypeORM `SelectQueryBuilder` queries across `Movie` and `Series` entities joining genres and seasons.
     - Computes relevance scores (100 for exact title matches, 80 for prefix matches, 60 for title containment, 40 for descriptions, 30 for genres).
     - Applies pagination (`page`, `limit`, `totalPages`) and serializes results into `SearchResultsResponseDto`.
   - Registered `SearchModule` in `AppModule`.

3. **Frontend Search Experience (`apps/frontend/src/app/features/search`)**:
   - `SearchComponent`:
     - Standalone component registered at `/search` in `app.routes.ts`.
     - Two-way bound search bar with RxJS debounced stream (`Subject<string>`).
     - Entity filter chips: `All`, `Movies`, `TV Series`.
     - Dropdowns for `Genre` and `Sort By`.
     - 5 UX States: Loading shimmer skeleton cards, Error state with retry, Empty state with search tips and "Popular on StreamFlix" fallback, Discovery splash with clickable trending search tags, and Success grid using `ContentCardComponent`.
   - Updated `NavbarComponent`: `executeSearch()` seamlessly navigates to `/search?q=...`.
   - Updated `ContentService.search()` to query the backend endpoint with fallback to enriched demo catalogs for offline resilience.

4. **Testing Suite Coverage**:
   - Backend unit tests: `search.service.spec.ts` (7 tests) and `search.controller.spec.ts` (2 tests).
   - Backend E2E integration tests: `search.e2e-spec.ts` (3 tests).
   - Frontend unit tests: `search.component.spec.ts` (10 tests) and updated `navbar.component.spec.ts` (7 tests).

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing a multi-entity catalog search engine spanning NestJS, PostgreSQL, Redis, and Angular with debounced querying, entity filters, relevance ranking, and caching.
2. **Why are we doing it?**  
   To allow users to rapidly discover movies and television series through a fluid, responsive search interface with minimal latency.
3. **What problem does it solve?**  
   Eliminates slow full-table scans through Redis caching and query normalization, prevents request floods via client-side debouncing, and enables deep-linkable permalink search URLs.
4. **What alternatives exist?**  
   - Dedicated search clusters (Elasticsearch/OpenSearch/Meilisearch): Overkill for early-stage catalog sizes; our architecture provides an extensible service boundary so a search engine cluster can be swapped in without modifying frontend consumers.
   - Client-only filtering: Infeasible for production catalog scale with thousands of titles.
5. **Why was this approach selected?**  
   PostgreSQL `LIKE`/`ILIKE` with indexes coupled with Redis caching provides sub-5ms response times for repeated queries while keeping the infrastructure lightweight and container-ready.
