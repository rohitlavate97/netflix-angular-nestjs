# ADR-004: Core Infrastructure Layer (PostgreSQL, Redis, MinIO)

## Status
Accepted

## Context
A production streaming service requires:
1. Normalized, ACID-compliant relational data persistence for users, profiles, catalogs, subscriptions, and transactions.
2. Low-latency in-memory caching and message queue broker capabilities for rate-limiting, hot metadata, and background processing.
3. Scalable, S3-compliant object storage for media assets (HLS video segments, master playlists, posters, backdrops, and thumbnails).

## Decision
We adopt:
- **PostgreSQL 16** via `@nestjs/typeorm` and `pg`.
- **Redis 7** via `ioredis` encapsulated within a managed global `RedisModule`.
- **MinIO S3 Object Storage** via `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` encapsulated within a global `StorageModule`.
- **Comprehensive Health Checks** via `HealthController` at `/api/v1/health` providing real-time ping diagnostics for Database, Redis, and Storage.

## Answers to Architectural Questions
1. **What are we doing?**  
   Configuring PostgreSQL, Redis, and MinIO clients with connection pooling, automatic retry strategies, and comprehensive health monitoring.
2. **Why are we doing it?**  
   To establish a resilient infrastructure foundation that works identically in local development (via Docker Compose) and cloud production (AWS RDS, ElastiCache, S3).
3. **What problem does it solve?**  
   Decouples business services from low-level client configuration, provides unified health probing for orchestrators (Kubernetes/Docker health checks), and prevents fragile network dependencies in testing through mockable modules.
4. **What alternatives exist?**  
   - SQLite, in-memory cache, and local disk storage (unsuitable for production streaming).
   - Microservices with independent databases from day 1 (premature distributed complexity).
5. **Why was this approach selected?**  
   Provides battle-tested, high-performance infrastructure components that adhere to industry standards and scale cleanly without vendor lock-in.
