# NestJS Backend Engineering Standards

- Modular domain boundaries (e.g. `auth`, `users`, `profiles`, `content`, `streaming`, `search`).
- Controllers: Thin orchestration only. Validate requests via DTOs and delegate to domain services.
- Business Logic: Isolated in domain/services, never in controllers.
- Validation: Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- Error Handling: Centralized `GlobalExceptionFilter` mapping to standard envelope `{ success: false, error: { code, message, details } }`.
- Security: Hash passwords with bcrypt/Argon2. Use short-lived JWT access tokens + rotating refresh tokens.
- Caching: Redis for hot queries with explicit TTLs and cache invalidation on mutations.
- Database: PostgreSQL with normalized schema, composite indexes, soft-delete where appropriate, foreign key constraints.
