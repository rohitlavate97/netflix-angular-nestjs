# ADR-003: Angular Standalone Components & Signals

## Status

Accepted

## Context

Streaming UIs require high rendering performance, zero lag during horizontal scrolling, instant UI feedback, and clean state handling across responsive layouts.

## Decision

We utilize modern Angular (v18+) with standalone components, native Signals for local state management, RxJS for asynchronous HTTP data streams, and Tailwind CSS for utility-first dark styling.

## Answers to Architectural Questions

1. **What are we doing?**  
   Building the web client exclusively with standalone components and Angular Signals without legacy NgModules.
2. **Why are we doing it?**  
   Standalone components reduce boilerplate, simplify routing and code-splitting, and Signals offer fine-grained reactivity and predictable change detection without zone overhead.
3. **What problem does it solve?**  
   Eliminates complex state synchronization bugs, simplifies testing, reduces initial bundle sizes through better tree-shaking, and enforces a modern clean component hierarchy.
4. **What alternatives exist?**
   - Legacy Angular with NgModules and heavy NgRx store
   - React or Vue
5. **Why was this approach selected?**  
   Aligns with the core stack requirement (Angular + TypeScript) and represents current state-of-the-art Angular best practices.
