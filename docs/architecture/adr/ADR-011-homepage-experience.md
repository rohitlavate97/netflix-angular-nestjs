# ADR-011: Homepage Experience, Horizontal Carousel Architecture & Quick Preview Modal

## Status

Accepted

## Context

The Netflix streaming homepage is the central discovery interface. It requires:
1. An immersive, cinematic hero banner showcasing trending or featured content with clear calls to action (Play, More Info) and audio control.
2. Smooth horizontal carousels (content rows) categorized by genres, personalized recommendations, Top 10 rankings, and continue-watching queues.
3. An expandable Quick Preview modal for deep content inspection without navigating away from the browsing context, supporting season/episode pickers for TV series and "More Like This" recommendation cards.

Without dedicated component boundaries and reactive state coordination, horizontal scroll carousels easily introduce layout shifts, slow DOM reflows, and cumbersome modal state management.

## Decision

We implement the complete Phase 9 Homepage Experience in `apps/frontend/src/app/features/home/`:

1. **Dynamic Hero Banner (`HeroBannerComponent`)**:
   - High-resolution backdrop visual with multi-directional gradients (horizontal fade for text readability and vertical blend into the feed below).
   - "Top 10 Today" badge, uppercase title, truncated synopsis, and primary CTAs ("Play" and "More Info").
   - Bottom-right corner cluster: Audio mute/unmute toggle and maturity rating indicator.

2. **Horizontal Content Rows (`ContentRowComponent`)**:
   - Custom horizontal carousel powered by native smooth scroll APIs (`element.scrollBy({ left: delta, behavior: 'smooth' })`).
   - Group-hover pagination controls (left and right chevron arrows) with automated boundaries detection (`canScrollLeft`, `canScrollRight`).
   - Supports 3 distinct visual variants:
     - Standard horizontal cards with hover scale and micro-actions.
     - Top 10 row with giant numbered rank typography (ranks 1 through 10).
     - Continue Watching row with personalized viewing progress bars.
   - Hidden scrollbar styling (`no-scrollbar`) and touch gesture support.

3. **Content Quick Preview Modal (`ContentModalComponent`)**:
   - Fullscreen backdrop with backdrop blur and smooth fade-in animation.
   - Media visual with quick action controls (Play, Add/Remove My List, Like, Audio toggle).
   - Detailed metadata display: Match score percentage, release year, age rating, duration, Ultra HD 4K badge, and 5.1 Spatial Audio badge.
   - TV Series support: Season selector with interactive episode cards (thumbnail, episode number, title, duration, overview).
   - "More Like This" recommendation cards grid for instant exploration.
   - Full keyboard accessibility: Closes on `Escape` key and outside backdrop clicks.

4. **Signals-Driven Home Orchestration (`HomeComponent`)**:
   - Coordinates feed data fetching, hero selection, continue-watching queue generation, and modal visibility via Angular Signals and computed expressions (`isModalOpen`, `isHeroSeries`, `profileName`, `recommendedItems`).
   - Enforces the 5 UX states: Loading shimmer skeletons (`type="banner"` and `type="row"`), Error recovery with retry, Empty state fallback, and Success feed presentation.

## Answers to Architectural Questions

1. **What are we doing?**  
   Implementing the full Netflix homepage experience including HeroBanner, horizontal scrolling ContentRows, Top 10 rankings, Continue Watching progress bars, and the Quick Preview Modal.
2. **Why are we doing it?**  
   To deliver the signature Netflix browsing experience with zero navigation latency, dynamic carousel scrolling, and rich modal inspection.
3. **What problem does it solve?**  
   Eliminates page-reload navigation for content details, standardizes horizontal pagination across desktop and mobile, and provides personalized row categorization.
4. **What alternatives exist?**
   - Full page navigation on card click: Disrupts browsing momentum and requires preserving scroll state.
   - Third-party carousel libraries (Swiper, Slick): Adds heavy external dependencies and conflicts with Angular Signals reactivity.
5. **Why was this approach selected?**  
   Native CSS scroll-smooth with Angular Signals provides 60fps performance, zero external library overhead, and complete styling flexibility for custom Top 10 and progress bar layouts.
