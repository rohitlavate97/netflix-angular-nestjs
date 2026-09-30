# Netflix Clone — Full-Stack Streaming Platform

A production-grade Netflix-inspired streaming platform built from the ground up with **Angular (Frontend)**, **NestJS (Backend)**, **TypeScript**, **PostgreSQL**, **Redis**, **Docker**, **MinIO**, and **HLS Adaptive Video Streaming**.

---

## 🏗️ Architecture & Monorepo Overview

This project is organized as an npm workspaces monorepo:

```text
netflix-angular-nestjs/
├── apps/
│   ├── frontend/               # Angular 19 Standalone Client (Tailwind CSS, Signals, RxJS)
│   └── backend/                # NestJS 11 Modular REST API (Swagger, Terminus Health, Validation)
├── packages/
│   └── shared-types/           # Shared TypeScript models, contracts, DTOs & enums
├── infrastructure/
│   ├── docker/                 # Production multi-stage Dockerfiles
│   ├── postgres/               # Database init & schema scripts
│   ├── redis/                  # Redis caching configuration
│   └── minio/                  # S3-compatible media storage init
├── docs/                       # Architecture diagrams, ADRs, database specs, API guides
├── AGENTS.md                   # AI Agent operating manual & commit quality gates
└── docker-compose.yml          # Local container orchestration
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js**: v20.x or higher (v24.x recommended)
- **npm**: v10.x or higher
- **Docker**: For PostgreSQL, Redis, and MinIO local services

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Infrastructure Services

```bash
npm run docker:up
```

Starts:

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO S3**: `localhost:9000` (Console: `localhost:9001`)

### 4. Build Packages and Applications

```bash
npm run build
```

### 5. Run Backend in Development Mode

```bash
npm run start:backend
```

- API Base: `http://localhost:3000/api/v1`
- Swagger Docs: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/api/v1/health`

### 6. Run Frontend in Development Mode

```bash
npm run start:frontend
```

- Web Application: `http://localhost:4200`

---

## 🧪 Testing & Verification

Execute all quality checks:

```bash
# Run unit tests
npm test

# Run backend end-to-end tests
npm run test:backend:e2e

# Run linter
npm run lint

# Format code
npm run format
```

---

## 📋 Development Roadmap Status

- [x] **Phase 1: Project Foundation** — Monorepo, NestJS application, Angular application, shared types, Docker compose, tooling, initial documentation.
- [x] **Phase 2: Infrastructure** — PostgreSQL (TypeORM), Redis (ioredis), MinIO (S3 SDK), Docker Compose, and health diagnostics.
- [x] **Phase 3: Database** — Core schema entities, relationships, composite indexes, migrations, and idempotent seed data.
- [x] **Phase 4: Authentication** — User registration, login, JWT access & refresh tokens, password hashing, token rotation, and auth guards.
- [ ] **Phase 5: Authorization** — RBAC (User, Admin, Content Manager), route guards, permission decorators.
- [ ] ... _(Phases 6–27)_
