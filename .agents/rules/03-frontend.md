# Angular Frontend Engineering Standards

- Modern Angular (v18+) with Standalone Components.
- Use new template control flow syntax: `@if`, `@for (item of items; track item.id)`, `@switch`.
- UI State Management: Angular Signals for local state; RxJS for asynchronous streams and HTTP requests.
- Styling: Tailwind CSS configured for high-fidelity Netflix dark theme palette.
- Five Mandatory UX States: Every data-driven view must implement Loading, Success, Empty, Error, and Retry states.
- Routing: Lazy load all feature routes (`/browse`, `/watch/:id`, `/search`, `/profile`, `/admin`).
- Guards & Interceptors: `AuthGuard`, `ProfileGuard`, `AdminGuard`, and JWT Auth interceptor with auto-refresh mechanism.
