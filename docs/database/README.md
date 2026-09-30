# Database Design & Modeling

The platform uses PostgreSQL with normalized schemas, composite indexes, soft-deletes, and relational constraints.

## Core Relational Domains

1. **Identity & Access**: User, Profile, Role, Permission, RefreshToken, Session
2. **Catalog & Content**: Movie, Series, Season, Episode, Genre, Category, Cast, Director
3. **Engagement**: WatchHistory, WatchProgress, Watchlist, Rating
4. **Subscription**: SubscriptionPlan, UserSubscription, PaymentTransaction
5. **Media Pipeline**: MediaAsset, Subtitle, AudioTrack

Detailed ER diagrams and migration scripts will be expanded in Phase 3.
