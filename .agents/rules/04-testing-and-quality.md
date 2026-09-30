# Testing, Quality Gates, and Commit Discipline

- Commit-Wise Rule: Never make large amorphous commits. Every commit must represent a single coherent feature or milestone.
- Quality Gate: Before every commit, execute:
  1. `npm run lint` (0 errors)
  2. `npm run test` (100% pass)
  3. `npm run build` (successful compilation)
- Conventional Commit prefixes: `feat(...)`, `fix(...)`, `refactor(...)`, `test(...)`, `docs(...)`, `chore(...)`, `perf(...)`.
- Zero tolerance for `any`, `@ts-ignore`, or disabling linters without explicit justification.
