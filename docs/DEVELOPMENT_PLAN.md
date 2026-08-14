# SKTube — Development Plan

## 1. How to Use This Plan

Implement phases in order. A phase is complete only when its completion criteria are met; do not begin dependent work with known failures in an earlier phase.

- `docs/PRD.md` defines what SKTube must do.
- `docs/ARCHITECTURE.md` defines the approved technical choices and implementation rules.
- This document defines the implementation order.
- Do not expand MVP scope without updating the PRD first.

## 2. MVP Delivery Sequence

| Phase | Outcome | Depends on |
| --- | --- | --- |
| 0 | Shared project foundation | Existing scaffold |
| 1 | Database, models, environment, and validation | Phase 0 |
| 2 | Email/password auth and protected routes | Phase 1 |
| 3 | Google linking for existing password accounts | Phase 2 |
| 4 | Saved-channel dashboard, search, and removal | Phase 2 |
| 5 | Add-channel preview and confirmation | Phases 1, 2, 4 |
| 6 | Current YouTube video feed, embedded playback, and infinite scroll | Phases 1, 2, 4 |
| 7 | Responsive polish, error states, and test coverage | Phases 0–6 |

## Phase 0 — Foundation and Shared UI

### Goal

Prepare the Next.js App Router project for feature work without building product flows yet.

### Tasks

- Preserve the root-level `app/` structure; do not introduce `src/`.
- Install the approved dependencies:
  - `mongoose`, `bcrypt`, `jose`, `zod`
  - `zustand`, `@tanstack/react-query`
  - `react-hook-form`, `@hookform/resolvers`
  - `google-auth-library`, `lucide-react`
  - shadcn/ui dependencies as required by chosen components
- Add a root React Query provider in `app/providers.js` and use it from `app/layout.js`.
- Set up Tailwind design tokens and global base styles in `app/globals.css`.
- Add reusable shared UI building blocks before feature-specific duplication begins:
  - Button, input, label, form error, dialog/confirmation dialog
  - Page/container layout, loading state, empty state, error state
- Create the initial feature and library folder boundaries described in `ARCHITECTURE.md`.
- Establish per-feature `api.js`, `hooks/`, and `query-keys.js` boundaries; all client server-state reads and writes use React Query hooks.
- Place all Vitest tests in colocated `__tests__/` folders; do not co-locate `*.test.js` next to source.
- Add a small Zustand UI store only for genuinely shared client UI state, such as the add-channel dialog.
- Configure `next/image` remote patterns for YouTube image hosts.

### Completion Criteria

- The application starts, lints, and builds successfully.
- React Query is available to Client Components.
- Shared UI components are reusable and not tied to a single screen.
- No server data is stored in Zustand.

## Phase 1 — Database, Models, Environment, and Domain Utilities

### Goal

Create the secure server-side foundation for users, saved channels, validation, and shared domain behavior.

### Tasks

- Add `lib/db.js` with one reusable Mongoose connection helper that handles Next.js development hot reload correctly.
- Add `lib/env.js` to validate required server environment variables with Zod.
- Create `.env.example` with variable names only:
  - `MONGODB_URI`
  - `SESSION_SECRET`
  - `YOUTUBE_API_KEY`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
  - `NEXT_PUBLIC_APP_URL`
- Create the `User` Mongoose model:
  - name, normalized unique email, password hash
  - optional unique Google subject ID and linking timestamp
  - timestamps and safe default field selection for password hash
- Create the `SavedChannel` Mongoose model:
  - user ID, canonical YouTube channel ID, title, optional handle, thumbnail URL, uploads playlist ID
  - timestamps
  - unique `{ userId, youtubeChannelId }` index
  - `{ userId, createdAt }` dashboard-ordering index
- Create shared Zod schemas for registration, login, channel input, channel ID, and video cursor input.
- Create shared ISO 8601 duration parsing and video-eligibility utilities.
- Create a normalized application-error helper for validation, auth, duplicate, not-found, and upstream errors.

### Completion Criteria

- MongoDB connects through one helper only.
- User email uniqueness and saved-channel duplicate uniqueness are enforced by MongoDB indexes.
- Password hashes are never included in ordinary user reads or API responses.
- Environment validation fails clearly when a required secret is missing.
- Domain utilities have unit tests in `lib/__tests__/` and `features/*/__tests__/`, including the exact two-minute duration boundary.

## Phase 2 — Email/Password Authentication and Route Protection

### Goal

Implement the custom JWT-in-HTTP-only-cookie authentication pattern.

### Tasks

- Create `lib/auth/session.js` using `jose`:
  - sign a minimal JWT with the user ID as `sub`
  - verify JWT signature, algorithm, and expiry
  - set and clear the `sktube_session` cookie with the approved security attributes
- Create `lib/auth/require-current-user.js`:
  - read the cookie
  - verify the JWT
  - load the user with Mongoose
  - return the user or a normalized unauthorized result
- Add authentication APIs:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Registration API: validate input, reject duplicate email, hash password with bcrypt, create user, and set the session cookie.
- Login API: validate input, fetch password hash explicitly, compare with bcrypt, and set the session cookie on success.
- Add login and registration pages using React Hook Form and Zod.
- Auth forms and logout use `useMutation` hooks from `features/auth/hooks/`, not raw `fetch` in components.
- Add root `proxy.js` to redirect unauthenticated users from protected pages and authenticated users away from login/register pages.
- Create a protected-route layout that calls `requireCurrentUser()` server-side.
- Use generic invalid-credentials messaging; do not reveal whether an email exists.

### Completion Criteria

- A user can register, log in, log out, and receive a secure HTTP-only session cookie.
- Protected pages redirect unauthenticated visitors to login.
- Protected Server Actions and Route Handlers reject missing, expired, invalid, or userless sessions even when called directly.
- Password hashes and JWT secrets never reach browser code.
- Auth forms and logout use `useMutation` hooks from `features/auth/hooks/`, not raw `fetch` in components.
- Auth flows have integration tests.

## Phase 3 — Google Login for Existing Password Accounts

### Goal

Allow Google sign-in only as a linked authentication method for a pre-existing email/password user.

### Tasks

**Google Cloud setup (manual):**

1. Create OAuth 2.0 Web application credentials in Google Cloud Console.
2. Add authorized redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/google/callback` (for example `http://localhost:3000/api/auth/google/callback` in local development).
3. Copy `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` into `.env`.
4. Configure the OAuth consent screen to request `openid`, `email`, and `profile` scopes only.

**Implementation:**

- Add `lib/google-auth.js` for OAuth URL generation, callback code exchange, and ID-token verification through `google-auth-library`.
- Add Google authentication routes:
  - `GET /api/auth/google`
  - `GET /api/auth/google/callback`
- Add a Google login button to the login page (full-page redirect to `GET /api/auth/google`; not a React Query mutation).
- In the callback, require both a Google subject ID and a verified email.
- Find the existing User by normalized verified email.
- Reject a Google login if no password-based user exists; never create a user from Google in MVP.
- Link Google subject ID only when the user has no existing Google ID.
- Reject subject-ID conflicts; never link one Google identity to two users.
- After successful linking or matching login, set the normal `sktube_session` cookie and redirect to the dashboard.

### Completion Criteria

- A password user can sign in with the same verified Google email.
- The Google subject ID is linked once and reused on later logins.
- An unknown Google email cannot create an SKTube account.
- An unverified email or conflicting Google subject ID is rejected.
- The Google flow creates the same app session as password login.

## Phase 4 — Channel Library Dashboard

### Goal

Create the protected dashboard where users browse, search, and remove their saved channels.

### Tasks

- Add `GET /api/channels`, protected by `requireCurrentUser()`.
- Query only the current user’s saved channels, ordered by `createdAt` descending.
- Add channel query keys and a `useChannels` React Query hook in `features/channels/hooks/`.
- Build dashboard components:
  - dashboard header and add-channel trigger
  - channel search input
  - responsive channel grid
  - reusable channel card
  - remove confirmation dialog
  - loading, empty, no-search-match, and error states
- Search locally against currently fetched channel titles and handles; do not create a separate search API in MVP.
- Implement a protected remove-channel Server Action that validates ownership and removes exactly one saved channel.
- Wrap removal in a React Query mutation and invalidate the channel-list query on success.

### Completion Criteria

- The dashboard lists only the authenticated user’s channels, newest added first.
- Search filters by title and handle.
- Removing a channel updates the UI and cannot delete another user’s channel.
- Empty, no-match, loading, and error states are present.
- The dashboard works on narrow mobile and desktop layouts.

## Phase 5 — Add Channel Preview and Confirmation

### Goal

Allow a user to safely add a supported YouTube channel only after reviewing a fetched preview.

### Tasks

- Create the server-only YouTube client using `fetch` and `YOUTUBE_API_KEY`.
- Implement parsing and validation for only:
  - `@handle`
  - `https://www.youtube.com/channel/<channel-id>`
- Reject all other input before making an upstream request.
- Resolve the input with the YouTube Data API and map a safe preview:
  - canonical channel ID, title, handle when available, thumbnail URL, uploads playlist ID
- Build the add-channel dialog from reusable form and modal primitives.
- Use a two-step flow:
  1. Validate/resolve channel and show preview.
  2. Require explicit confirmation before saving.
- Implement an authenticated add-channel Server Action.
- Check for an existing saved channel before inserting and handle the unique-index duplicate error as the final safeguard.
- Invalidate the channel-list query after successful addition.

### Completion Criteria

- Only handles and `/channel/` URLs are accepted.
- The user sees a preview before a channel is saved.
- Duplicate channels are blocked per user, including concurrent attempts.
- API keys and raw YouTube responses are never exposed to the browser.
- Invalid input, not found, duplicate, and upstream failures have clear UI states.

## Phase 6 — Channel Video Feed, Embedded Playback, and Infinite Scroll

### Goal

Display current eligible YouTube uploads and play them through the official embedded YouTube player without persisting video data.

### Tasks

- Add a protected channel-detail page and a protected video-playback page; verify the saved channel belongs to the current user in both routes.
- Add `GET /api/channels/[channelId]/videos?cursor=`.
- In the Route Handler:
  - load the owned SavedChannel and its uploads playlist ID
  - retrieve playlist items in raw pages of up to 50
  - retrieve matching video details and `status.embeddable` in batches
  - exclude missing/private/unavailable videos
  - exclude live, upcoming, and archived livestreams
  - exclude videos with duration strictly below 120 seconds
  - continue through underlying YouTube pages until 50 eligible videos are collected or results end
  - return only mapped SKTube video fields, including embed eligibility, and an opaque next cursor
- Create video query keys and `useInfiniteQuery` hook in `features/videos/hooks/`.
- Build video-feed, video-card, load-more sentinel, shimmer skeleton row, retry, empty, and end-of-results components.
- Build a reusable responsive `YoutubePlayer` using YouTube’s official privacy-enhanced iframe embed.
- Navigate a selected video to its protected SKTube playback page instead of opening a new browser tab.
- Use `playsinline=1`, `rel=0`, and the application origin in the embed URL; do not autoplay or overlay/customize YouTube player controls.
- Provide a visible “Open on YouTube” fallback on every playback page.
- If `status.embeddable` is false or embedded playback fails, show the fallback state instead of a broken player.
- Keep React Query cache in memory only. Do not persist videos in MongoDB or introduce server-side caching/background sync.

### Completion Criteria

- Videos appear newest first and show thumbnail, title, duration, and published date.
- The feed returns up to 50 eligible videos at a time and loads additional pages by scrolling.
- Videos under two minutes, livestreams, and unavailable videos are absent.
- Video data remains current from YouTube and is never saved as application video records.
- The feed handles YouTube errors, no eligible videos, and end of results clearly.
- Initial and paginated video loading show a one-row shimmer skeleton grid (1/2/3 cards by breakpoint) instead of a text loader.
- Selecting an eligible video loads the official YouTube embedded player inside SKTube.
- Non-embeddable or blocked videos show a clear fallback state with “Open on YouTube”.

## Phase 7 — Quality, Responsive Polish, and Release Readiness

### Goal

Verify the full MVP against the PRD and prepare it for a safe first deployment.

### Tasks

- Review all feature components for duplication and split any component approaching 300 lines.
- Confirm reusable inputs, dialogs, cards, loaders, empty states, and error states are shared rather than reimplemented.
- Test keyboard navigation, focus management in dialogs, and touch-friendly controls.
- Test mobile, tablet, and desktop layouts.
- Add unit tests in colocated `__tests__/` folders per `ARCHITECTURE.md` for:
  - channel input parsing
  - duration parsing and <120-second filtering
  - JWT creation and verification
  - Zod validation and YouTube response mapping
- Add integration tests in colocated `__tests__/` folders per `ARCHITECTURE.md` for:
  - auth APIs and authorization checks
  - Google existing-account linking
  - saved-channel ownership and duplicate prevention
  - paginated video filtering/cursor behavior with mocked YouTube responses
  - embedded-player URL generation and non-embeddable fallback behavior
- Add Playwright coverage for:
  - registration/login/logout
  - protected-route redirect
  - add, search, and remove channel
  - channel video browsing and loading another page
  - embedded video playback and the “Open on YouTube” fallback
- Run lint, build, and the full test suite.
- Verify production environment variables, Google redirect URI, cookie security, and MongoDB connectivity.
- Check each PRD MVP acceptance criterion before release.

### Completion Criteria

- Lint, production build, and tests pass.
- All MVP acceptance criteria in `PRD.md` are verified.
- No video, API key, password hash, or JWT secret is exposed to the browser.
- There are no known authorization bypasses or user-data ownership gaps.
- The application is usable across the supported responsive layouts.

**Status:** Phase 7 complete. Lint, Vitest, Playwright, and production build pass; PRD §12 is covered by the automated suite plus the production checklist in `README.md`.

## 3. Out of Scope for This Plan

Do not implement these during MVP development:

- Video storage, history, favorites, watch later, playlists, or notifications.
- Background jobs, scheduled sync, Redis, or persistent video caching.
- Google-only registration or additional OAuth providers.
- Arbitrary YouTube URL support.
- Channel folders, tags, custom sorting, sharing, or social features.

## 4. Definition of MVP Complete

The MVP is complete when Phase 7 is complete and the acceptance criteria in `docs/PRD.md` have been verified end to end.
