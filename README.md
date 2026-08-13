# SKTube

SKTube is a responsive Next.js app for saving YouTube channels and browsing their latest long-form uploads. MongoDB stores users and saved-channel metadata only. YouTube remains the source of truth for videos.

Product and architecture details: [docs/PRD.md](docs/PRD.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

## Setup

1. Copy `.env.example` to `.env` and fill in the values (names only are committed):

```text
MONGODB_URI=
SESSION_SECRET=
YOUTUBE_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_APP_URL=
```

2. `SESSION_SECRET` must be at least 32 characters.
3. `GOOGLE_REDIRECT_URI` must be `{NEXT_PUBLIC_APP_URL}/api/auth/google/callback` (for local development, `http://localhost:3000/api/auth/google/callback`).
4. Never prefix secrets with `NEXT_PUBLIC_`.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit and integration tests |
| `npm run test:e2e` | Playwright end-to-end tests |

## End-to-end tests

Playwright needs a running MongoDB using the same `MONGODB_URI` as `.env`. Each test creates a unique `sktube-e2e-*` user.

YouTube Data API calls are served by a local mock (`YOUTUBE_API_BASE`) so the suite does not consume API quota. Google OAuth is covered by Vitest, not Playwright.

```bash
npx playwright install chromium
npm run test:e2e
```

## Production checklist

- MongoDB is reachable from the deployment.
- `SESSION_SECRET` is a long random value; session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- Google OAuth redirect URI matches the deployed `{NEXT_PUBLIC_APP_URL}/api/auth/google/callback`.
- `YOUTUBE_API_KEY` stays server-only.
- Password hashes, JWT secrets, and raw YouTube responses are never sent to the browser.

MVP acceptance criteria are listed in [docs/PRD.md](docs/PRD.md#12-mvp-acceptance-criteria).
