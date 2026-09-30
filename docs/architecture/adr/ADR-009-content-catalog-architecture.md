# ADR-009: Content Catalog, Hierarchical Series & Dynamic Categories

## Status

Accepted

## Context

A modern streaming platform catalog serves two critical purposes:

1. **Rich Catalog Discovery for Viewers**: High-performance querying of movies, TV shows, genres, maturity ratings, and dynamically curated homepage category rows (Trending Now, Popular, Action, Sci-Fi).
2. **Robust Content Ingestion for Operators**: Hierarchical management of episodic television (Series $\rightarrow$ Seasons $\rightarrow$ Episodes), multi-genre tagging, and decoupled HLS media asset bindings.

Without clean domain boundaries, content querying degrades rapidly under load and ingestion pipelines become brittle.

## Decision

We implement a normalized relational content catalog in the `ContentModule`:

1. **Dual Content Entity Types**:
   - `Movie`: Standalone feature film with metadata, duration, age rating, and direct `MediaAsset` association.
   - `Series`: Multi-season show supporting nested `Season` (sequenced numbers) and `Episode` (sequenced numbers, duration, thumbnails, and dedicated `MediaAsset`).

2. **Categorization & Discovery**:
   - `Genre`: Many-to-many relationship with both Movies and Series (`movie_genres`, `series_genres`).
   - `Category`: Ordered display rows for Netflix-style home screen carousels (`categories` table with `displayOrder` and `slug`).
   - `CategoriesService.getHomeFeed()` dynamically populates each category with related movies and television series.

3. **Granular Operator Access Control**:
   - Public browse and retrieval endpoints (`GET /api/v1/movies`, `GET /api/v1/series`, `GET /api/v1/genres`, `GET /api/v1/categories/feed`).
   - Mutation endpoints (create, update, delete, add season, add episode) are protected via `@Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)` and `RolesGuard`.

4. **Media Decoupling**:
   - Video streaming metadata (`masterPlaylistUrl`, multi-bitrate resolutions, audio tracks, subtitles) is encapsulated within `MediaAsset`.
   - Movies and episodes link to media assets via foreign keys with `ON DELETE SET NULL` to preserve catalog metadata integrity.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing `ContentModule` featuring movie/series catalogs, hierarchical seasons and episodes, genre filtering, category feed generation, and administrative CRUD endpoints.
2. **Why are we doing it?**  
   To provide an organized, Netflix-grade content library that powers client browsing, discovery carousels, and operational content management.
3. **What problem does it solve?**  
   Solves content discovery fragmentation, enforces data integrity between series, seasons, and episodes, and secures content modification behind role-based access control.
4. **What alternatives exist?**
   - Single flat "Video" entity: Fails to model multi-season series structures naturally, resulting in duplicate metadata.
   - Denormalized JSON document store: Leads to update anomalies when editing genres, seasons, or media references.
5. **Why was this approach selected?**  
   Hierarchical relational modeling accurately mirrors real-world streaming catalogs and ensures referential integrity with cascading season/episode deletions.
