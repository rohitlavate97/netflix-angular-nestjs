# ADR-005: Relational Schema Modeling & Entity Design

## Status

Accepted

## Context

A video streaming platform requires distinct yet interrelated domain models:

- Identity & Multiple Profiles (with PIN protection, kids mode, maturity ratings).
- Content Catalog (Movies, Series, Seasons, Episodes, Genres, Categories).
- HLS Video Pipeline (MediaAssets with multi-bitrate streams, Subtitles, Audio tracks).
- User Engagement (Watch history with timestamp progress, Watchlists, 1-5 Star Ratings).
- Subscriptions (Tiers, access levels, validity periods).

## Decision

We implement a normalized relational schema in PostgreSQL 16 utilizing TypeORM entities:

- **UUIDs** as primary keys for distributed readiness and collision prevention.
- **Relational Constraints**:
  - `ON DELETE CASCADE` for child profiles, watch history, seasons, episodes, and subtitles.
  - `ON DELETE RESTRICT` for subscription plans referenced by active subscriptions.
- **Unique Composite Constraints**:
  - `(profileId, movieId)` and `(profileId, seriesId)` on `watchlists` and `ratings` to enforce single entries per content.
  - `(seriesId, seasonNumber)` on `seasons` and `(seasonId, episodeNumber)` on `episodes`.
- **Composite Indexes**:
  - `(profileId, movieId)` and `(profileId, episodeId)` on `watch_history` to support fast lookups for continue-watching queries.
- **Soft Deletion**: `deletedAt` timestamps on Users, Movies, and Series for audit and compliance.

## Answers to Architectural Questions

1. **What are we doing?**  
   Creating 17 normalized TypeORM entities, an idempotent database seeder (`SeedService`), and a core PostgreSQL migration.
2. **Why are we doing it?**  
   To provide strongly typed data persistence with strict foreign key constraints, composite performance indexes, and deterministic test data.
3. **What problem does it solve?**  
   Prevents data duplication in watchlists and ratings, eliminates orphaned records through cascading deletes, and optimizes high-frequency watch history writes.
4. **What alternatives exist?**
   - Document databases (e.g., MongoDB): Lacks native relational integrity for profiles, subscriptions, and content relations.
   - Denormalized content JSON blobs: Causes update anomalies and inefficient querying.
5. **Why was this approach selected?**  
   PostgreSQL relational modeling is the industry standard for streaming platforms, providing ACID transactions, robust foreign keys, and performant composite indexing.
