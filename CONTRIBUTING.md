# Contributing

1. **Fork & branch** — small, focused PRs.
2. **Install** — `npm install`
3. **Develop** — `npm run dev` with `.env.local` from `.env.example`, or `AWAIR_DEMO_MODE=true` without a token.
4. **Verify** — `npm run lint`, `npm run test`, `npm run build`.
5. **Design** — follow `DESIGN.md` (tonal surfaces, no hard 1px dividers for sectioning).

## API client changes

- Keep the Awair token server-side only (`src/lib/awair/client.ts`, Route Handlers).
- Document new env vars in `docs/ENVIRONMENT.md` and `.env.example`.
- If you add or change Awair endpoints, update `docs/API_COVERAGE.md` and (if user-facing) `docs/API.md`.

## Tests

Vitest unit tests live next to modules as `*.test.ts`. Prefer pure functions and small fixtures over live API calls in CI.
