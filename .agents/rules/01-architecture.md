# Architectural Guidelines & Monorepo Rules

- Maintain a clean monorepo architecture:
  - `apps/frontend`: Standalone Angular web client.
  - `apps/backend`: Modular NestJS REST API server.
  - `packages/shared-types`: Canonical DTOs, interfaces, and shared enums.
  - `infrastructure/`: Container definitions and database seed/init assets.
- Follow Clean Architecture, SOLID, DRY, KISS, and YAGNI.
- Keep the system as a clean modular monolith before considering service extraction.
- Shared models and DTO contracts must be defined in `packages/shared-types` to avoid duplication.
- Document architectural decision records (ADRs) under `docs/architecture/adr/`.
