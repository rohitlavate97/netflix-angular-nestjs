# ADR-006: JWT Authentication, Refresh Token Rotation & Session Revocation

## Status

Accepted

## Context

Streaming platforms require a secure, performant authentication mechanism capable of:

- Stateless API verification across distributed microservices or edge instances.
- Low-latency request authorization on media streaming and catalog endpoints.
- Secure token renewal without requiring users to log in repeatedly.
- Immediate session revocation when a user logs out, resets their password, or experiences security incidents.
- Strict protection against Token Sidejacking and Replay Attacks.

## Decision

We implement a dual-token JWT authentication architecture with Refresh Token Rotation:

1. **Short-Lived JWT Access Tokens**:
   - TTL: 15 minutes.
   - Encoded payload: `sub` (User UUID), `email`, `role`.
   - Signed using HMAC SHA-256 (`JWT_SECRET`).
   - Validated on protected routes via `JwtStrategy` and `JwtAuthGuard`.

2. **Long-Lived Refresh Tokens with Rotation**:
   - TTL: 7 days.
   - Generated as cryptographically random 64-character hex strings (`crypto.randomBytes(32)`).
   - Stored in PostgreSQL with SHA-256 hash digests (`RefreshToken.tokenHash`) — raw tokens are never persisted in the database.
   - Upon refresh request:
     - The incoming raw token is hashed and checked against the database.
     - The old token record is marked as `isRevoked = true`.
     - A completely new refresh token is minted, hashed, and persisted.
     - A new access token is generated and returned alongside the new refresh token.

3. **Session Revocation & Logout**:
   - `/api/v1/auth/logout` endpoint accepts the active refresh token and marks it as revoked in the database.
   - Future refresh attempts using a revoked token are rejected with `401 Unauthorized`.

4. **Security Hardening**:
   - Password hashing with `bcryptjs` (salt rounds: 10).
   - Public route exclusion via `@Public()` decorator.
   - Current user extraction via `@CurrentUser()` custom param decorator.
   - Automatic default profile generation ("Main Profile") upon registration.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing authentication module with registration, credential-based login, short-lived JWTs, cryptographically secured refresh token rotation, logout revocation, and current-user identification.
2. **Why are we doing it?**  
   To establish a secure, industry-standard authentication boundary that protects user accounts and enables personalized experiences (profiles, watchlists, history).
3. **What problem does it solve?**  
   Mitigates long-lived token theft risks through 15-minute access token lifetimes, prevents replay attacks through automatic single-use refresh token rotation, and prevents plaintext database leaks by hashing refresh tokens.
4. **What alternatives exist?**
   - Stateful session cookies with Redis session store: Adds state check overhead to every single streaming chunk request.
   - Long-lived non-rotating JWTs: Exposes users to permanent account takeover if an access token is intercepted.
5. **Why was this approach selected?**  
   Stateless access tokens deliver zero-database-hit performance on fast video streams, while rotated database-backed refresh tokens provide security, auditability, and immediate revocation capabilities.
