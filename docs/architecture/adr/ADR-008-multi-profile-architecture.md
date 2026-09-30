# ADR-008: Multi-Profile Architecture, Kids Mode & PIN Protection

## Status

Accepted

## Context

A video streaming platform is typically shared across a household. To provide a high quality personalized experience:

- Every household member requires separate watch histories, watchlists, recommendations, and playback preferences.
- Parents need parental controls (Kids mode) that restrict viewing to age-appropriate titles (`ALL`, `7+`).
- Adult profiles must be guardable by a 4-digit security PIN so kids cannot switch to unrestricted profiles.
- Platform capacity must be bounded to prevent database bloat (maximum 5 profiles per account).
- Accounts must maintain at least one primary profile at all times.

## Decision

We implement a multi-profile domain architecture in the `ProfilesModule`:

1. **Entity Relations & Isolation**:
   - `Profile` entities maintain a foreign key to `User` (`userId`) with `ON DELETE CASCADE`.
   - All subsequent engagement models (`WatchHistory`, `Watchlist`, `Rating`) link directly to `profileId` rather than `userId`.

2. **Account Capacity & Limits**:
   - Strictly limit profile creation to a maximum of 5 profiles per user (`MAX_PROFILES_PER_USER = 5`).
   - Prevent deletion of the last remaining profile on an account (`count <= 1`).
   - Enforce unique profile names per account to avoid viewer confusion.

3. **Kids Mode & Maturity Clamping**:
   - Profiles flagged with `isKids: true` have their maturity rating automatically clamped to `'ALL'` or `'7+'`.
   - Prevents bypass where client requests higher maturity ratings for a kid profile.

4. **Security & PIN Verification**:
   - 4-digit numeric PINs (`^\d{4}$`) are hashed using `bcrypt` (10 rounds) before persistence.
   - Raw PINs and hash values are never leaked in API responses; only `hasPin: boolean` is exposed in `UserProfileDto`.
   - Endpoints `/api/v1/profiles/:id/verify-pin` and `/api/v1/profiles/:id/select` enforce PIN comparison prior to profile access.

5. **Avatar Catalog**:
   - Centralized preset avatar library (`DEFAULT_PROFILE_AVATARS`) with dedicated Kids mode avatar defaults.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing `ProfilesModule` supporting multi-profile CRUD (up to 5 profiles), PIN verification, Kids mode maturity clamping, profile selection, and avatar presets.
2. **Why are we doing it?**  
   To allow multi-user household personalization while safeguarding children and securing adult profiles with cryptographic PINs.
3. **What problem does it solve?**  
   Prevents mixed watchlists and corrupted recommendation engines caused by shared viewing, and protects underage viewers from mature content.
4. **What alternatives exist?**
   - Single profile per account: Forces separate subscriptions for every family member, creating unacceptable friction.
   - Unhashed client-side PIN checks: Severe vulnerability allowing easy inspection and bypass.
5. **Why was this approach selected?**  
   Relational profile segregation paired with bcrypt PIN hashing and maturity clamping delivers industry-standard Netflix user experience and security.
