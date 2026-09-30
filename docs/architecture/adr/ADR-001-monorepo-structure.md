# ADR-001: Monorepo Structure with npm Workspaces

## Status

Accepted

## Context

A production streaming service requires tight contract alignment between the backend API and frontend client (DTOs, error shapes, enums, auth tokens, video stream descriptions). In multi-repo setups, shared models often drift or require tedious package publishing rituals.

## Decision

We organize the codebase as a single Git repository (monorepo) using standard native `npm workspaces` targeting:

- `apps/frontend`
- `apps/backend`
- `packages/shared-types`

## Answers to Architectural Questions

1. **What are we doing?**  
   Co-locating the backend, frontend, and shared types in a single repository governed by npm workspaces and unified TypeScript path mapping.
2. **Why are we doing it?**  
   To enable immediate contract sharing, synchronized refactorings, atomic commits, unified linting, and automated continuous integration.
3. **What problem does it solve?**  
   Eliminates contract drift between client and server, avoids private npm registry publishing overhead, and streamlines local full-stack development.
4. **What alternatives exist?**
   - Multi-repo with published npm packages
   - Nx / Turborepo toolchains
   - Submodules
5. **Why was this approach selected?**  
   Native npm workspaces provides zero overhead, native Node/npm support, no proprietary lock-in, and rapid setup while maintaining complete architectural modularity.
