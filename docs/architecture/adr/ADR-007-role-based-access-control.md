# ADR-007: Role-Based Access Control (RBAC) & Route Authorization

## Status

Accepted

## Context

A production streaming platform requires diverse access levels across administrators, content managers, moderators, and end users:

- **End Users**: Can browse public and catalog content, manage their profiles, watchlists, ratings, and stream media.
- **Moderators**: Can view user reports, inspect reviews/ratings, and review system audit records.
- **Content Managers**: Can upload, update, categorize, and manage movies, series, episodes, and media assets.
- **Platform Administrators**: Possess unrestricted supervisory control across user accounts, subscriptions, system configuration, and analytics.

Hardcoding authorization checks across dozens of controllers leads to logic duplication, security drift, and high bug risk.

## Decision

We implement a declarative Role-Based Access Control (RBAC) and Granular Permissions system:

1. **Shared Contract Definitions**:
   - `UserRole` and `UserPermission` enums defined centrally in `packages/shared-types`.
   - `ROLE_PERMISSIONS` constant maps each `UserRole` to its allowed permissions set:
     - `ADMIN`: All permissions.
     - `CONTENT_MANAGER`: Content creation, modification, deletion, media uploading, and analytics.
     - `MODERATOR`: User reading, content inspection, and analytics.
     - `USER`: Content consumption.

2. **Declarative Route Metadata Decorators**:
   - `@Roles(...roles: UserRole[])`: Attaches required role constraints to controller classes or route handlers.
   - `@RequirePermissions(...permissions: UserPermission[])`: Attaches granular permission requirements.

3. **Guards Architecture**:
   - `RolesGuard`: Evaluates whether the authenticated user's assigned role matches any role specified in `@Roles()`. Returns `403 Forbidden` if unauthorized.
   - `PermissionsGuard`: Evaluates whether the user's role grants all permissions specified in `@RequirePermissions()`.
   - Guards integrate seamlessly with `JwtAuthGuard` using NestJS `Reflector`.

4. **Stateless Authorization Performance**:
   - The user's role is embedded directly in the cryptographically signed JWT access token (`JwtPayload.role`).
   - Route authorization executes in-memory without database queries, ensuring optimal latency for high-throughput streaming and catalog traffic.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing declarative RBAC decorators (`@Roles`, `@RequirePermissions`), authorization guards (`RolesGuard`, `PermissionsGuard`), and role-permission matrices.
2. **Why are we doing it?**  
   To secure administrative, ingestion, and management operations without duplicating authorization checks across individual controllers.
3. **What problem does it solve?**  
   Prevents unauthorized privilege escalation, separates operational roles (content managers cannot alter user passwords or billing), and guarantees consistent HTTP 403 Forbidden responses.
4. **What alternatives exist?**
   - Manual `if (user.role !== 'ADMIN')` in every controller action: Error-prone, hard to audit, and redundant.
   - External policy engines (e.g. OPA / Casbin): Overkill for current monolith scale, adding unnecessary runtime overhead.
5. **Why was this approach selected?**  
   Native NestJS reflector guards paired with shared TypeScript types provide compile-time type safety, zero database latency, clean declarative syntax, and seamless testability.
