# Netflix Clone — System Architecture

## Overview

This platform is structured as an npm workspaces monorepo containing:

- `apps/backend`: NestJS modular API server handling business logic, data persistence, streaming metadata, and background processing.
- `apps/frontend`: Modern Angular client built with standalone components, Signals, RxJS, and Tailwind CSS.
- `packages/shared-types`: Canonical TypeScript interfaces, enums, and DTO definitions shared across client and server.
- `infrastructure/`: Container definitions for local services (PostgreSQL, Redis, MinIO).

## Architectural Decision Records (ADRs)

- [ADR-001: Monorepo Architecture](adr/ADR-001-monorepo-structure.md)
- [ADR-002: NestJS Modular Backend Architecture](adr/ADR-002-nestjs-backend-architecture.md)
- [ADR-003: Angular Standalone Frontend Architecture](adr/ADR-003-angular-frontend-architecture.md)
- [ADR-004: Core Infrastructure Layer](adr/ADR-004-infrastructure-layer.md)
- [ADR-005: Relational Schema Modeling & Entity Design](adr/ADR-005-relational-database-schema.md)
