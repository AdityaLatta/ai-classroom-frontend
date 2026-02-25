# AI Classroom — Frontend

## Quick Commands
- `npm run dev` — start Next.js dev server (port 3000)
- `npm run type-check` — validate TypeScript (run before committing)
- `npm run lint` — ESLint with jsx-a11y rules
- `npm run test` — Vitest (115 tests)
- `npm run test:coverage` — coverage thresholds: 60% lines/functions/statements, 50% branches
- `npm run format` — Prettier (double quotes, trailing commas, 2-space indent)
- `npm run analyze` — bundle analysis via `ANALYZE=true next build`

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- **State:** Zustand (client) + React Query (server)
- **UI:** shadcn/ui + Radix UI, Tailwind CSS 4, Lucide icons
- **Forms:** react-hook-form + Zod 4
- **Auth:** JWT in-memory (XSS-safe) + httpOnly refresh cookie, Google OAuth
- **Error tracking:** Sentry (logger.ts → captureException)

## Architecture
- **API calls** go through service layer: `src/lib/services/*.service.ts`
- **React Query hooks** in `src/hooks/` call service functions — never import `api` directly in hooks
- **Auth store** (`src/store/auth.store.ts`) uses Zustand persist + service functions
- **Token refresh** handled by Axios interceptor in `src/lib/api.ts` with request queuing
- `window.dispatchEvent(new Event("unauthorized"))` triggers global logout

## Conventions
- `src/components/ui/` is shadcn-generated — don't modify manually, use `npx shadcn add`
- Unused variables must be `_` prefixed (ESLint enforced)
- `logError()` from `src/lib/logger.ts` for all error logging (wired to Sentry)
- Mocking patterns in tests: `useAuthStore.setState()` for auth, `vi.mock("@/lib/api")` for API

## Git
- Pre-commit hook runs Prettier + ESLint via husky/lint-staged
- CI: format:check → lint → type-check → test:coverage
