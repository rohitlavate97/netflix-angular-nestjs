# Netflix Clone — Production-Ready Full-Stack Application

## 1. ROLE

You are a senior full-stack architect and engineer.

Build a **production-ready Netflix-inspired streaming platform** from scratch using:

- Angular
- NestJS
- TypeScript
- PostgreSQL
- Redis
- Docker
- REST APIs
- JWT authentication
- Object storage / media storage abstraction
- HLS video streaming
- Automated testing
- CI/CD

This is not a toy project or a simple UI clone.

The goal is to create an application that demonstrates how a modern production-grade streaming platform can be architected, implemented, tested, secured, containerized, and deployed.

Use clean architecture, SOLID principles, modular design, appropriate design patterns, proper error handling, validation, observability, security, testing, and documentation.

---

# 2. PRIMARY GOALS

The application must demonstrate:

1. Angular frontend development
2. NestJS backend development
3. REST API design
4. Authentication and authorization
5. PostgreSQL database design
6. Redis caching
7. HLS video streaming
8. Search
9. Recommendation logic
10. Multiple user profiles
11. Watch history
12. Continue watching
13. Watchlist
14. Ratings
15. Subscription management
16. Admin dashboard
17. Media management
18. Background processing
19. Docker
20. CI/CD
21. Automated testing
22. Production-grade logging
23. API documentation
24. Security best practices
25. Scalable architecture

---

# 3. IMPORTANT DEVELOPMENT RULE

## BUILD COMMIT-WISE

Do NOT build the entire application in one step.

Implement the project incrementally.

After completing every meaningful feature:

1. Run formatting
2. Run linting
3. Run unit tests
4. Run integration tests where applicable
5. Run the application
6. Verify the feature
7. Fix errors
8. Update documentation
9. Create a Git commit

Every commit must represent a coherent completed feature.

Example:

```text
feat(auth): implement user registration
feat(auth): implement login and JWT authentication
feat(auth): implement refresh token rotation
feat(users): implement user profiles
feat(content): implement movie management
feat(content): implement series and episode management
feat(search): implement movie search
feat(streaming): implement HLS streaming
feat(watch): implement watch history
feat(watch): implement continue watching
feat(admin): implement content management dashboard
```

Never create meaningless commits such as:

```text
update
changes
fix stuff
test
final
```

---

# 4. GIT RULES

Before starting:

```bash
git init
```

Create:

```text
main
develop
```

Use feature branches when appropriate:

```text
feature/authentication
feature/movie-catalog
feature/video-streaming
feature/search
feature/recommendations
feature/admin-dashboard
```

Preferred commit format:

```text
feat(scope): description
fix(scope): description
refactor(scope): description
test(scope): description
docs(scope): description
chore(scope): description
```

Example:

```text
feat(auth): implement JWT authentication
```

Do not commit broken code.

Before every commit:

```bash
npm run lint
npm run test
npm run build
```

Use the equivalent commands appropriate for the Angular/NestJS project.

---

# 5. TECHNOLOGY STACK

## Frontend

Use:

```text
Angular
TypeScript
Angular Router
RxJS
Angular Signals
Reactive Forms
HttpClient
Interceptors
Route Guards
Tailwind CSS
Angular Material where useful
```

Prefer modern Angular architecture.

Use standalone components unless there is a strong architectural reason not to.

Avoid unnecessary NgModules.

Use Signals where they improve local/UI state management.

Use RxJS for asynchronous streams and HTTP workflows.

---

# 6. BACKEND

Use:

```text
NestJS
TypeScript
PostgreSQL
Prisma OR TypeORM
Redis
JWT
Passport
Swagger/OpenAPI
class-validator
class-transformer
Jest
Supertest
```

Use NestJS modules properly.

Each domain should have a clear boundary.

Example:

```text
auth
users
profiles
content
movies
series
episodes
genres
categories
search
watchlist
watch-history
ratings
subscriptions
payments
recommendations
streaming
media
notifications
admin
health
```

---

# 7. DATABASE

Use PostgreSQL.

Design the database carefully.

Required entities should include:

```text
User
Profile
Role
Permission

Movie
Series
Season
Episode

Genre
Category
Cast
Director

MovieGenre
SeriesGenre
MovieCast
SeriesCast

WatchHistory
WatchProgress
Watchlist
Rating

Subscription
SubscriptionPlan
Payment

RefreshToken
Session

MediaAsset
Subtitle
AudioTrack

Notification
Recommendation
```

Use proper:

- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Composite indexes
- Created timestamps
- Updated timestamps
- Soft deletion where appropriate

Avoid N+1 queries.

Use database transactions where required.

---

# 8. DATABASE DESIGN PRINCIPLES

Do not put everything into one giant table.

Use normalized relational modeling where appropriate.

For example:

```text
User
  |
  └── Profile
        |
        ├── WatchHistory
        ├── Watchlist
        ├── Ratings
        └── WatchProgress
```

Content:

```text
Movie
 ├── Genres
 ├── Cast
 ├── Director
 ├── MediaAssets
 └── Recommendations

Series
 ├── Seasons
 │    └── Episodes
 │          ├── MediaAssets
 │          ├── Subtitles
 │          └── AudioTracks
 ├── Genres
 └── Cast
```

---

# 9. AUTHENTICATION

Implement:

```text
Register
Login
Logout
Refresh Token
Password Hashing
Forgot Password
Reset Password
Email Verification
Session Management
```

Use:

```text
Argon2 or bcrypt
JWT access token
Refresh token
```

Do not store passwords in plain text.

Use secure refresh-token handling.

Implement token expiration.

Implement logout/token revocation.

Protect APIs using NestJS guards.

---

# 10. AUTHORIZATION

Implement RBAC.

Roles:

```text
USER
ADMIN
CONTENT_MANAGER
MODERATOR
```

Example permissions:

```text
USER_READ
USER_UPDATE

CONTENT_CREATE
CONTENT_READ
CONTENT_UPDATE
CONTENT_DELETE

MEDIA_UPLOAD
MEDIA_DELETE

ANALYTICS_READ
SUBSCRIPTION_READ
```

Use guards/decorators for authorization.

Example conceptual usage:

```typescript
@Roles('ADMIN')
@Delete(':id')
deleteMovie()
```

Do not duplicate authorization logic throughout controllers.

---

# 11. USER PROFILES

Users can create multiple profiles.

Example:

```text
User
 ├── Rohit
 ├── Family
 ├── Kids
 └── Guest
```

Each profile must have independent:

- Watch history
- Watchlist
- Recommendations
- Preferences
- Ratings

Support:

```text
Profile avatar
Profile name
Language
Maturity level
Kids mode
PIN protection
Autoplay preference
```

---

# 12. CONTENT MANAGEMENT

Support:

## Movies

Fields:

```text
title
slug
description
releaseDate
duration
ageRating
language
country
poster
backdrop
trailer
status
```

## Series

```text
title
slug
description
releaseDate
ageRating
language
poster
backdrop
trailer
status
```

## Seasons

```text
seriesId
seasonNumber
title
description
```

## Episodes

```text
seasonId
episodeNumber
title
description
duration
thumbnail
videoAsset
```

---

# 13. GENRES AND CATEGORIES

Support:

```text
Action
Adventure
Comedy
Drama
Horror
Thriller
Romance
Sci-Fi
Documentary
Animation
Crime
Fantasy
```

Categories should support dynamic rows such as:

```text
Trending Now
Popular Movies
Popular Series
New Releases
Top Rated
Action
Comedy
Indian Movies
English Movies
Continue Watching
```

Do not hard-code these categories into Angular templates.

Retrieve them through APIs.

---

# 14. HOME PAGE

Build a Netflix-inspired homepage.

Structure:

```text
Navbar

Hero Section

Trending Now

Popular Movies

Popular Series

Continue Watching

New Releases

Top Rated

Genre Rows

Footer
```

The UI should be:

- Responsive
- Fast
- Accessible
- Keyboard navigable
- Mobile friendly
- Desktop friendly
- Tablet friendly

Do not copy Netflix branding, logos, copyrighted artwork, or proprietary assets.

Use fictional/demo content and legally usable placeholder media.

---

# 15. MOVIE DETAILS PAGE

Example route:

```text
/movie/:slug
```

Display:

```text
Backdrop
Poster
Title
Description
Genre
Release year
Duration
Age rating
Cast
Director
Trailer
Play button
Add to My List
Rate
Similar content
```

---

# 16. SERIES DETAILS PAGE

Example:

```text
/series/:slug
```

Display:

```text
Series information
Seasons
Episodes
Episode descriptions
Episode duration
Continue watching
Similar series
```

---

# 17. VIDEO PLAYER

Implement a dedicated video player.

Support:

```text
Play
Pause
Seek
Volume
Fullscreen
Playback speed
Quality selection
Subtitle selection
Audio track selection
Resume playback
Skip intro
Next episode
Autoplay
```

Use HLS.

Do not expose private media URLs directly when signed URLs are appropriate.

Design the media layer so it can later support:

```text
AWS S3
CloudFront
Cloudflare R2
MinIO
```

---

# 18. HLS STREAMING

Implement a streaming abstraction.

Conceptually:

```text
Original Video
      ↓
Transcoding
      ↓
HLS
      ↓
.m3u8
      ↓
.ts / fragmented MP4 segments
      ↓
Storage
      ↓
CDN
      ↓
Angular Player
```

For local development use:

```text
MinIO
```

or another local-compatible object storage.

Design the system so production storage can be switched through configuration.

---

# 19. VIDEO PROCESSING

Create a media-processing abstraction.

Use FFmpeg where appropriate.

Support:

```text
1080p
720p
480p
360p
```

Generate:

```text
master.m3u8
1080p.m3u8
720p.m3u8
480p.m3u8
360p.m3u8
```

Generate thumbnails where practical.

Media processing should not block HTTP requests.

Use background jobs.

---

# 20. REDIS

Use Redis for:

```text
Caching
Session data
Rate limiting
Temporary tokens
Popular content
Search caching
Recommendation caching
Background job queues
```

Do not cache everything.

Define TTLs deliberately.

Example:

```text
Homepage:
TTL = 5 minutes

Movie details:
TTL = 10 minutes

Popular content:
TTL = 15 minutes
```

Invalidate cache when content changes.

---

# 21. SEARCH

Implement:

```text
GET /search?q=...
```

Search across:

```text
Movies
Series
Actors
Genres
```

Support:

```text
Pagination
Sorting
Filtering
Partial matching
```

Start with PostgreSQL search if appropriate.

Keep the search abstraction extensible so Elasticsearch/OpenSearch can be introduced later.

---

# 22. WATCH HISTORY

Track:

```text
Profile
Content
Episode
Position
Duration
LastWatchedAt
Completed
```

Example:

```text
User watches episode
        ↓
Frontend periodically reports progress
        ↓
NestJS
        ↓
Redis/cache where appropriate
        ↓
PostgreSQL
```

Avoid writing to PostgreSQL every second.

Use throttling/debouncing.

---

# 23. CONTINUE WATCHING

Homepage should contain:

```text
Continue Watching
```

Show:

```text
Poster
Title
Progress percentage
Remaining duration
```

Clicking the item should resume from the previous position.

---

# 24. WATCHLIST

Implement:

```text
Add to My List
Remove from My List
Check whether item exists
List My List
```

Prevent duplicate entries using database constraints.

---

# 25. RATINGS

Allow users to rate content.

Example:

```text
1 - 5 stars
```

Enforce:

```text
One rating per profile per content
```

Use unique constraints.

Calculate aggregate ratings efficiently.

---

# 26. RECOMMENDATION ENGINE

Do not start with machine learning.

Build a rule-based recommendation engine first.

Use:

```text
Genres watched
Content popularity
Ratings
Watch history
Recently watched
Similar genres
Completion percentage
```

Example:

```text
User watches:
  Sci-Fi
  Thriller
  Action

Recommend:
  Sci-Fi + Thriller
  Action + Thriller
```

Create an abstraction:

```typescript
RecommendationStrategy
```

So future strategies can include:

```text
RuleBasedRecommendationStrategy
CollaborativeFilteringStrategy
MLRecommendationStrategy
```

---

# 27. SUBSCRIPTIONS

Implement:

```text
FREE
BASIC
STANDARD
PREMIUM
```

Example capabilities:

```text
FREE
 └── limited catalog

BASIC
 └── HD
 └── 1 device

STANDARD
 └── Full HD
 └── 2 devices

PREMIUM
 └── 4K
 └── multiple devices
```

Do not connect to a real payment provider initially.

Create a payment abstraction:

```typescript
PaymentProvider
```

Implement:

```text
MockPaymentProvider
```

later allowing:

```text
Razorpay
Stripe
```

without rewriting subscription logic.

---

# 28. ADMIN DASHBOARD

Create a separate Angular admin area.

Routes:

```text
/admin
/admin/dashboard
/admin/users
/admin/movies
/admin/series
/admin/seasons
/admin/episodes
/admin/genres
/admin/media
/admin/subscriptions
/admin/analytics
```

Dashboard should show:

```text
Total users
Active users
Total movies
Total series
Total episodes
Total watch time
Active subscriptions
Revenue
Popular content
```

Use charts where useful.

---

# 29. ADMIN CONTENT MANAGEMENT

Admin should be able to:

```text
Create movie
Update movie
Delete movie
Publish movie
Unpublish movie

Create series
Create season
Create episode

Upload poster
Upload backdrop
Upload trailer
Upload video

Manage genres
Manage categories
```

Implement validation.

Do not trust frontend validation alone.

---

# 30. NOTIFICATIONS

Implement notification infrastructure.

Examples:

```text
New episode available
Subscription expiring
Password changed
New content added
```

Support:

```text
In-app notifications
Email notification abstraction
```

Create:

```typescript
NotificationService
EmailProvider
```

Use a mock provider during development.

---

# 31. API DESIGN

Use REST.

Follow consistent conventions.

Example:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/profiles
POST   /api/v1/profiles
PATCH  /api/v1/profiles/:id
DELETE /api/v1/profiles/:id

GET    /api/v1/movies
GET    /api/v1/movies/:id
POST   /api/v1/movies
PATCH  /api/v1/movies/:id
DELETE /api/v1/movies/:id

GET    /api/v1/series
GET    /api/v1/series/:id

GET    /api/v1/search

GET    /api/v1/watchlist
POST   /api/v1/watchlist
DELETE /api/v1/watchlist/:contentId

GET    /api/v1/history
POST   /api/v1/history/progress

GET    /api/v1/recommendations
```

Version APIs:

```text
/api/v1
```

---

# 32. API RESPONSE FORMAT

Use a consistent response structure.

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Movie not found",
    "details": []
  }
}
```

Do not expose internal stack traces to clients.

---

# 33. PAGINATION

Use pagination for potentially large collections.

Example:

```text
GET /movies?page=1&limit=20
```

Response:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

Implement reusable pagination DTOs.

---

# 34. VALIDATION

Backend validation is mandatory.

Use:

```text
class-validator
class-transformer
```

Validate:

```text
Email
Password
IDs
Pagination
Sorting
Filters
Movie fields
Profile fields
Subscription fields
```

Reject unexpected input where appropriate.

---

# 35. SECURITY

Implement:

```text
Helmet
CORS
Rate limiting
Input validation
JWT protection
RBAC
Password hashing
Secure cookies where applicable
Refresh token rotation
SQL injection prevention
XSS-aware output handling
CSRF strategy where applicable
```

Never trust:

```text
Frontend validation
Client-side roles
Client-provided user IDs
Client-provided subscription status
Client-provided permissions
```

---

# 36. RATE LIMITING

Protect sensitive endpoints:

```text
Login
Register
Forgot password
Search
Streaming token generation
Admin APIs
```

Use Redis-backed rate limiting if practical.

---

# 37. LOGGING

Implement structured logging.

Log:

```text
Request ID
Timestamp
HTTP method
URL
Status
Response time
User ID where appropriate
Error code
```

Never log:

```text
Passwords
JWT tokens
Refresh tokens
Payment secrets
Sensitive personal information
```

---

# 38. GLOBAL ERROR HANDLING

NestJS must have centralized exception handling.

Create appropriate:

```text
GlobalExceptionFilter
ValidationPipe
```

Use domain-specific errors.

Example:

```text
UserNotFoundException
MovieNotFoundException
UnauthorizedException
SubscriptionRequiredException
MediaNotFoundException
```

Do not scatter raw error handling throughout controllers.

---

# 39. HEALTH CHECK

Implement:

```text
GET /health
```

Check:

```text
Application
Database
Redis
Storage
```

Example response:

```json
{
  "status": "ok",
  "database": "up",
  "redis": "up",
  "storage": "up"
}
```

---

# 40. SWAGGER

Expose Swagger/OpenAPI documentation.

Example:

```text
/api/docs
```

Document:

```text
Authentication
Request bodies
Responses
Errors
Authorization
Pagination
Filtering
```

---

# 41. ANGULAR ARCHITECTURE

Organize Angular by feature.

Preferred structure:

```text
src/app/

core/
  auth/
  guards/
  interceptors/
  services/
  models/

shared/
  components/
  directives/
  pipes/
  ui/

features/
  home/
  auth/
  profiles/
  movies/
  series/
  search/
  watchlist/
  player/
  subscription/
  admin/

layout/
  navbar/
  footer/

store/
```

Avoid a giant:

```text
components/
services/
```

folder containing everything.

---

# 42. ANGULAR STATE MANAGEMENT

Use Signals for appropriate local/application state.

Example:

```typescript
currentUser = signal<User | null>(null);
activeProfile = signal<Profile | null>(null);
```

Use RxJS for:

```text
HTTP
events
streams
complex async workflows
```

Do not introduce NgRx simply for the sake of using NgRx.

If application complexity eventually justifies NgRx, introduce it deliberately.

---

# 43. ANGULAR HTTP INTERCEPTOR

Implement:

```text
Authorization header
401 handling
refresh token
request retry
global API error handling
```

Avoid infinite refresh loops.

---

# 44. ROUTE GUARDS

Implement:

```text
AuthGuard
AdminGuard
ProfileGuard
SubscriptionGuard
```

Do not rely exclusively on guards for security.

The backend must enforce authorization independently.

---

# 45. RESPONSIVE DESIGN

The UI must work on:

```text
Mobile
Tablet
Laptop
Desktop
Large desktop
```

Netflix-style horizontal content rows should support:

```text
Mouse wheel
Touch scrolling
Keyboard navigation
```

Use lazy loading for images.

Use responsive image sizes where possible.

---

# 46. PERFORMANCE

Frontend:

```text
Lazy routes
Lazy components
Image lazy loading
TrackBy / efficient rendering
Signals
HTTP caching where appropriate
Code splitting
```

Backend:

```text
Database indexes
Pagination
Redis caching
Connection pooling
Efficient queries
Async processing
```

Never optimize blindly.

Measure first where possible.

---

# 47. DOCKER

Create:

```text
Dockerfile.backend
Dockerfile.frontend
docker-compose.yml
```

Local infrastructure:

```text
Angular
NestJS
PostgreSQL
Redis
MinIO
```

Example:

```text
docker compose up -d
```

The application should start with minimal manual configuration.

---

# 48. ENVIRONMENT CONFIGURATION

Use:

```text
.env
.env.example
.env.development
.env.production
```

Never commit secrets.

Example:

```text
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Provide safe development defaults where appropriate.

---

# 49. TESTING

Backend:

```text
Unit tests
Integration tests
E2E tests
```

Frontend:

```text
Component tests
Service tests
Guard tests
Interceptor tests
```

Important tests:

```text
Registration
Login
Refresh token
Authorization
Movie CRUD
Search
Watchlist
Watch progress
Subscription access
Admin authorization
Streaming authorization
```

---

# 50. TEST DATA

Create seed data.

Seed:

```text
Admin user
Normal user
Demo profiles

Movies
Series
Seasons
Episodes
Genres
Categories

Subscription plans
```

Use fictional content.

Do not use copyrighted Netflix assets.

---

# 51. OBSERVABILITY

Prepare architecture for:

```text
Metrics
Tracing
Centralized logs
```

Add useful application metrics such as:

```text
HTTP request count
HTTP latency
Error count
Active users
Video playback requests
Streaming failures
Database query timing
Cache hit/miss
```

Do not over-engineer observability in the first iteration.

Build the foundation first.

---

# 52. CI/CD

Create GitHub Actions.

Pipeline:

```text
Install
 ↓
Lint
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Build
 ↓
Docker Build
```

Production deployment can later be extended to:

```text
AWS
Azure
GCP
Railway
Render
Fly.io
```

Keep deployment provider abstraction separate from application code.

---

# 53. PROJECT STRUCTURE

Use a monorepo:

```text
netflix-clone/

├── apps/
│   ├── frontend/
│   │   └── Angular application
│   │
│   └── backend/
│       └── NestJS application
│
├── packages/
│   ├── shared-types/
│   ├── eslint-config/
│   └── tsconfig/
│
├── infrastructure/
│   ├── docker/
│   ├── postgres/
│   ├── redis/
│   └── minio/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── decisions/
│
├── scripts/
│
├── docker-compose.yml
├── .env.example
├── README.md
└── package.json
```

If a monorepo tool such as Nx is selected, use it consistently rather than mixing unrelated workspace strategies.

---

# 54. ARCHITECTURAL PRINCIPLES

Follow:

```text
SOLID
DRY
KISS
YAGNI
Separation of Concerns
Dependency Inversion
Single Responsibility
Composition over inheritance
```

Do not blindly apply design patterns.

Use patterns when they solve an actual problem.

Useful patterns:

```text
Repository
Strategy
Factory
Adapter
Facade
Specification
Observer/Event-driven
```

---

# 55. DOMAIN EVENTS

Introduce domain events where useful.

Examples:

```text
UserRegistered
MoviePublished
EpisodePublished
WatchProgressUpdated
SubscriptionActivated
SubscriptionExpired
```

Do not introduce Kafka/RabbitMQ immediately.

Start with an internal event abstraction.

Design the system so a message broker can be introduced later.

---

# 56. BACKGROUND JOBS

Use a queue system for:

```text
Video processing
Thumbnail generation
Email notifications
Recommendation refresh
Analytics aggregation
Cleanup jobs
```

Redis + BullMQ can be used.

Example:

```text
Video Uploaded
      ↓
Media Processing Job
      ↓
FFmpeg
      ↓
HLS generated
      ↓
Storage
      ↓
Content marked READY
```

---

# 57. ANALYTICS

Track non-sensitive product events:

```text
VideoStarted
VideoCompleted
VideoPaused
SearchPerformed
ContentAddedToWatchlist
RatingSubmitted
SubscriptionActivated
```

Build a basic analytics dashboard.

Do not collect unnecessary personal information.

---

# 58. DOCUMENTATION

Maintain:

```text
README.md
ARCHITECTURE.md
DATABASE.md
API.md
DEVELOPMENT.md
DEPLOYMENT.md
SECURITY.md
```

Every major architectural decision should be documented.

Use ADRs:

```text
docs/architecture/adr/
```

Example:

```text
ADR-001-angular-frontend.md
ADR-002-nestjs-backend.md
ADR-003-postgresql.md
ADR-004-redis-caching.md
ADR-005-hls-streaming.md
```

---

# 59. DEVELOPMENT PHASES

Build in the following order.

## Phase 1 — Project Foundation

Implement:

```text
Repository
Monorepo
Angular application
NestJS application
Shared configuration
ESLint
Prettier
Git
Docker
Environment configuration
README
```

Commit:

```text
chore(project): initialize monorepo
```

---

## Phase 2 — Infrastructure

Implement:

```text
PostgreSQL
Redis
MinIO
Docker Compose
Database connection
Redis connection
Health endpoint
```

Commit:

```text
feat(infrastructure): add postgres redis and minio
```

---

## Phase 3 — Database

Implement:

```text
Entities
Migrations
Indexes
Relationships
Seed data
```

Commit:

```text
feat(database): implement core schema
```

---

## Phase 4 — Authentication

Implement:

```text
Registration
Login
JWT
Refresh token
Logout
Password hashing
Validation
```

Commit:

```text
feat(auth): implement authentication
```

---

## Phase 5 — Authorization

Implement:

```text
Roles
Permissions
Guards
Decorators
Admin authorization
```

Commit:

```text
feat(auth): implement role based authorization
```

---

## Phase 6 — Profiles

Implement:

```text
Multiple profiles
Profile CRUD
Profile selection
Kids mode
Profile PIN
```

Commit:

```text
feat(profiles): implement profile management
```

---

## Phase 7 — Content

Implement:

```text
Movies
Series
Seasons
Episodes
Genres
Categories
Cast
```

Commit:

```text
feat(content): implement content catalog
```

---

## Phase 8 — Angular UI Foundation

Implement:

```text
Global layout
Navbar
Footer
Theme
Responsive design
Routing
Reusable cards
Loading states
Error states
```

Commit:

```text
feat(ui): implement application shell
```

---

## Phase 9 — Home Page

Implement:

```text
Hero
Rows
Trending
Popular
New releases
Continue watching placeholder
```

Commit:

```text
feat(home): implement streaming homepage
```

---

## Phase 10 — Movie and Series Details

Implement:

```text
Movie details
Series details
Season selector
Episode list
Related content
```

Commit:

```text
feat(content): implement content detail pages
```

---

## Phase 11 — Search

Implement:

```text
Search API
Filters
Pagination
Search UI
Search suggestions
```

Commit:

```text
feat(search): implement content search
```

---

## Phase 12 — Watchlist

Implement:

```text
Add
Remove
List
Duplicate protection
UI
```

Commit:

```text
feat(watchlist): implement my list
```

---

## Phase 13 — Watch History

Implement:

```text
Progress
History
Resume
Continue watching
```

Commit:

```text
feat(watch): implement watch progress
```

---

## Phase 14 — Video Streaming

Implement:

```text
Media assets
Upload abstraction
FFmpeg
HLS
Signed URLs
Video player
```

Commit:

```text
feat(streaming): implement HLS video streaming
```

---

## Phase 15 — Subtitles and Audio

Implement:

```text
Subtitle tracks
Audio tracks
Language selection
Quality selection
```

Commit:

```text
feat(player): implement subtitles and audio tracks
```

---

## Phase 16 — Recommendations

Implement:

```text
Recommendation engine
Similar content
Personalized rows
```

Commit:

```text
feat(recommendations): implement recommendation engine
```

---

## Phase 17 — Subscription

Implement:

```text
Plans
Subscription
Access control
Mock payment provider
```

Commit:

```text
feat(subscription): implement subscription management
```

---

## Phase 18 — Admin

Implement:

```text
Admin dashboard
Content management
User management
Media management
Subscription management
```

Commit:

```text
feat(admin): implement admin dashboard
```

---

## Phase 19 — Notifications

Implement:

```text
Notification model
Notification API
In-app notifications
Email abstraction
```

Commit:

```text
feat(notifications): implement notification system
```

---

## Phase 20 — Background Jobs

Implement:

```text
BullMQ
Video processing queue
Email queue
Recommendation jobs
Cleanup jobs
```

Commit:

```text
feat(jobs): implement background processing
```

---

## Phase 21 — Analytics

Implement:

```text
Events
Watch analytics
User analytics
Admin dashboard metrics
```

Commit:

```text
feat(analytics): implement analytics
```

---

## Phase 22 — Security Hardening

Review:

```text
Authentication
Authorization
Rate limiting
CORS
Helmet
Validation
Secrets
Logging
File uploads
Signed URLs
```

Commit:

```text
security: harden application security
```

---

## Phase 23 — Testing

Implement comprehensive:

```text
Unit tests
Integration tests
E2E tests
Frontend tests
```

Commit:

```text
test: increase application test coverage
```

---

## Phase 24 — Performance

Review:

```text
Database indexes
Redis caching
API latency
Angular bundle
Lazy loading
Image loading
Streaming performance
```

Commit:

```text
perf: optimize application performance
```

---

## Phase 25 — Docker Production Build

Create:

```text
Production Dockerfiles
Docker Compose
Health checks
Non-root containers
Environment configuration
```

Commit:

```text
chore(docker): add production containers
```

---

## Phase 26 — CI/CD

Implement:

```text
GitHub Actions
Lint
Test
Build
Docker
Security checks
```

Commit:

```text
ci: implement continuous integration
```

---

## Phase 27 — Final Documentation

Complete:

```text
README
Architecture
Database
API
Security
Deployment
ADR
Local development
Troubleshooting
```

Commit:

```text
docs: complete project documentation
```

---

# 60. QUALITY GATES

Never move to the next phase if the current phase is broken.

Before each phase completion verify:

```text
Application starts
Database works
API works
Frontend works
Tests pass
Lint passes
Build passes
Docker works where applicable
Documentation updated
Git commit created
```

---

# 61. ERROR HANDLING DURING DEVELOPMENT

If you encounter an error:

1. Understand the root cause.
2. Do not randomly modify unrelated files.
3. Fix the smallest appropriate layer.
4. Run the relevant test.
5. Run the full test suite.
6. Verify the application.
7. Document the fix if it is architectural.
8. Commit the fix.

Never hide errors using:

```text
any
@ts-ignore
eslint-disable
empty catch blocks
```

unless there is a documented and justified reason.

---

# 62. CODE QUALITY

Avoid:

```typescript
any
```

Prefer:

```typescript
unknown
```

when the type is genuinely unknown.

Use strict TypeScript configuration.

Avoid giant services.

Avoid giant controllers.

Avoid business logic inside controllers.

Controllers should primarily:

```text
receive request
validate input
call application/domain service
return response
```

Business logic belongs in services/domain/application layers.

---

# 63. FRONTEND UX

Every API-driven page must support:

```text
Loading
Success
Empty
Error
Retry
```

For example:

```text
Loading movies...
No movies found.
Failed to load movies. Retry.
```

Do not leave users with blank screens.

---

# 64. ACCESSIBILITY

Implement:

```text
Semantic HTML
Keyboard navigation
Focus states
ARIA where required
Accessible buttons
Accessible forms
Readable contrast
Screen-reader-friendly labels
```

The video player controls must be keyboard accessible.

---

# 65. DEMO CONTENT

Create fictional content such as:

```text
The Last Horizon
Shadow Protocol
Mumbai Nights
Quantum Code
The Silent Planet
Code 404
Beyond Tomorrow
```

Create fictional actors/directors.

Do not use copyrighted Netflix content.

---

# 66. FINAL PROJECT EXPERIENCE

The final application should feel like a real streaming platform.

A user should be able to:

```text
Register
 ↓
Login
 ↓
Create/select profile
 ↓
Browse homepage
 ↓
Search content
 ↓
Open movie
 ↓
Watch trailer
 ↓
Start movie
 ↓
Pause
 ↓
Resume later
 ↓
Add to My List
 ↓
Rate movie
 ↓
Receive recommendations
 ↓
Browse series
 ↓
Watch episode
 ↓
Automatically continue next episode
```

An admin should be able to:

```text
Login
 ↓
Open dashboard
 ↓
Create movie
 ↓
Upload media
 ↓
Process video
 ↓
Publish movie
 ↓
See analytics
```

---

# 67. FINAL ARCHITECTURE TARGET

The target architecture should eventually resemble:

```text
                         ┌──────────────────┐
                         │     Angular      │
                         │     Frontend     │
                         └────────┬─────────┘
                                  │
                              HTTPS/API
                                  │
                         ┌────────▼─────────┐
                         │      NestJS      │
                         │   API Backend    │
                         └────────┬─────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
       ┌─────▼─────┐        ┌─────▼─────┐       ┌─────▼─────┐
       │ PostgreSQL│        │   Redis   │       │   MinIO   │
       │ Database  │        │   Cache   │       │  Storage  │
       └───────────┘        └─────┬─────┘       └───────────┘
                                  │
                            ┌─────▼─────┐
                            │  BullMQ   │
                            │   Jobs    │
                            └─────┬─────┘
                                  │
                            ┌─────▼─────┐
                            │   FFmpeg  │
                            │ Transcode │
                            └───────────┘
```

Production evolution:

```text
Angular
   ↓
CDN
   ↓
Load Balancer
   ↓
NestJS instances
   ↓
Redis
   ↓
PostgreSQL
   ↓
Object Storage
   ↓
CDN
```

---

# 68. IMPORTANT INSTRUCTION FOR THE AI CODING AGENT

Do not simply generate code.

Think like a senior engineer responsible for maintaining this system for years.

Before implementing a feature:

1. Understand the existing architecture.
2. Inspect related modules.
3. Determine dependencies.
4. Design the change.
5. Implement it.
6. Test it.
7. Review it.
8. Update documentation.
9. Commit it.

Never overwrite existing functionality without understanding why it exists.

Never create duplicate services, models, utilities, or components when an existing abstraction can be reused.

Before creating a new abstraction, search the repository for an existing equivalent.

Prefer extending existing architecture over introducing parallel architecture.

---

# 69. LEARNING MODE

Because this project is also intended as a learning project, whenever a major architectural decision is made, explain briefly:

```text
What are we doing?
Why are we doing it?
What problem does it solve?
What alternatives exist?
Why was this approach selected?
```

Put deeper explanations into:

```text
docs/architecture/
```

Do not unnecessarily interrupt implementation with long explanations.

---

# 70. DO NOT OVERENGINEER

Do not introduce:

```text
Microservices
Kafka
Kubernetes
Elasticsearch
Service mesh
Complex distributed transactions
```

unless the current architecture genuinely requires them.

Start as a modular monolith.

Design clean boundaries so the system can evolve into distributed services later.

The goal is:

```text
Modular Monolith
       ↓
Scalable Architecture
       ↓
Optional Service Extraction
```

not:

```text
Microservices everywhere from day one
```

---

# 71. DEFINITION OF DONE

A feature is DONE only when:

```text
[ ] Backend implemented
[ ] Frontend implemented where applicable
[ ] Database migration implemented
[ ] Validation implemented
[ ] Authorization implemented
[ ] Error handling implemented
[ ] Unit tests implemented
[ ] Integration/E2E tests where appropriate
[ ] Documentation updated
[ ] Lint passes
[ ] Tests pass
[ ] Build passes
[ ] Manual verification completed
[ ] Git commit created
```

---

# 72. START NOW

Start with Phase 1 only.

Do NOT implement the entire project immediately.

First:

```text
1. Inspect the current repository.
2. Determine whether it is empty or already contains code.
3. Create the project structure.
4. Initialize Angular.
5. Initialize NestJS.
6. Configure TypeScript.
7. Configure ESLint.
8. Configure Prettier.
9. Configure Git.
10. Create the initial README.
11. Verify both applications start.
12. Run tests.
13. Run builds.
14. Create the first commit.
```

After completing Phase 1, report:

```text
PHASE COMPLETED

Phase:
What was implemented:
Files created:
Tests:
Build:
Git commit:
Next phase:
```

Then wait for the next instruction.

Do not automatically implement Phase 2.

---

# 73. GOLDEN RULE

**Build this like a real production system, but keep the architecture understandable enough that a developer can learn every part of it.**

The final result should demonstrate strong skills in:

```text
Angular
TypeScript
NestJS
REST APIs
PostgreSQL
Redis
Authentication
Authorization
System Design
Video Streaming
Caching
Background Jobs
Testing
Docker
CI/CD
Security
Performance
Architecture
```

The project should be something that can be discussed confidently in a senior full-stack/software-engineering interview.