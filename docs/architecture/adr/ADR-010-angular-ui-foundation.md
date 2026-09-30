# ADR-010: Angular Standalone Architecture & Netflix UI Foundation

## Status

Accepted

## Context

A production-grade streaming user interface requires high visual fidelity, seamless micro-interactions, responsive navigation across devices, and resilient UX states for data consumption.

Previous frontend architectures commonly suffered from heavy `NgModule` bloat, awkward RxJS pipe chains for local view state, and inconsistent error/loading boundaries. In modern streaming platforms, UI responsiveness, atomic component reusability, and strict zero-flicker state transitions (Loading, Success, Empty, Error, Retry) are mandatory.

## Decision

We establish the foundational client architecture in `apps/frontend` using modern Angular 19 Standalone Components, reactive Signals, and a customized Netflix dark design system:

1. **Standalone Component Architecture**:
   - Zero legacy `NgModule` declarations.
   - Every view, layout, and shared widget is an autonomous `standalone: true` component importing only its direct dependencies.
   - Dynamic route-level code splitting using `loadComponent` with standalone lazy-loading in `app.routes.ts`.

2. **Reactive State with Angular Signals**:
   - `AuthService`: Signals store authentication state (`currentUser`, `accessToken`, `isAuthenticated`, `isAdmin`).
   - `ProfileService`: Signals track active user profiles (`currentProfile`, `profiles`, `isKidsMode`).
   - Reactive fine-grained reactivity replaces zone-polluted change detection cycles, ensuring smooth 60fps animations.

3. **Application Shell & Dynamic Navigation**:
   - `NavbarComponent`: Sticky glassmorphic header that dynamically transitions from transparent with a top gradient to solid `#141414` upon window scrolling.
   - Comprehensive controls: StreamFlix brand logo, desktop navigation links, expandable search bar, notification flyout, active profile switcher dropdown, and responsive slide-out mobile drawer.
   - `FooterComponent`: Multi-column links grid, interactive service code generator, and architecture technical disclaimer.

4. **Shared 5-UX-State Design System**:
   - `ContentCardComponent`: High-fidelity Netflix media card with hover enlargement, metadata tags (match score, maturity rating, duration, HD badge), interactive overlay actions (play, watchlist toggle, like, details expansion), and image load fallback gradients.
   - `LoadingSkeletonComponent`: Shimmer placeholder pulse animations for hero banners, rows, and grids.
   - `ErrorStateComponent`: Resilient error panel with retry action emitter.
   - `EmptyStateComponent`: Clean illustration and CTA for empty watchlists and search queries.

5. **HTTP Interceptor & Route Guards**:
   - `authInterceptor`: Injects Bearer tokens and handles automatic 401 token refresh retries.
   - `authGuard` & `profileGuard`: Functional guards securing authenticated and profile-selected route trees.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing the complete Angular 19 UI shell, responsive navigation, Netflix theme tokens, Signals-based core services, and reusable 5-state UI components.
2. **Why are we doing it?**  
   To provide a high-fidelity streaming interface foundation that faithfully matches the Netflix user experience while establishing scalable reactive state patterns.
3. **What problem does it solve?**  
   Prevents brittle view states, avoids monolithic module coupling, guarantees responsive layout across mobile and desktop, and standardizes data fetching UX states across all upcoming feature phases.
4. **What alternatives exist?**
   - Traditional NgModules: Increased boilerplate, complex injector trees, and heavier bundle sizes.
   - Third-party UI component libraries (e.g., Material UI, Bootstrap): Imposes non-Netflix aesthetic opinions that conflict with dark streaming platform design.
5. **Why was this approach selected?**  
   Standalone Angular components combined with Tailwind CSS tokens and reactive Signals provide zero-runtime-overhead styling, clean bundle tree-shaking, and predictable micro-interaction performance.
