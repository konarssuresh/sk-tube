# SKTube — Architecture

## 1. Purpose

This document defines the technical architecture and implementation rules for SKTube. `docs/PRD.md` is the product source of truth; this document defines how those requirements are implemented.

The MVP is a responsive Next.js web app where authenticated users save YouTube channels and browse current eligible uploads. MongoDB stores users and saved-channel metadata only. YouTube remains the source of truth for video data.

## 2. Locked Technology Choices

| Area                | Choice                                    | Rule                                                                                                                       |
| ------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Framework           | Next.js App Router with JavaScript        | Prefer Server Components; use Client Components only where browser interactivity is needed.                                |
| Database            | MongoDB with Mongoose                     | Use Mongoose models and one shared connection helper.                                                                      |
| Authentication      | Custom JWT session cookie                 | Do not use Auth.js, Better Auth, or another auth framework.                                                                |
| Passwords           | `bcrypt`                                  | Hash before storage and compare on login. Never return a password hash.                                                    |
| JWT                 | `jose`                                    | Sign and verify the JWT on the server. The JWT contains only the user ID and standard expiry claims.                       |
| Google sign-in      | `google-auth-library`                     | Google may link only to an existing email/password account with the same verified email. It must not create a user in MVP. |
| Validation          | Zod                                       | Validate at every server boundary.                                                                                         |
| Forms               | React Hook Form + `@hookform/resolvers`   | Use Zod schemas with forms.                                                                                                |
| Client state        | Zustand                                   | Client-only UI state; never use it as a server-data cache.                                                                 |
| Server state        | `@tanstack/react-query`                   | Fetching, mutation lifecycle, invalidation, infinite video pagination, loading, and error state.                           |
| Styling and base UI | Tailwind CSS, shadcn/ui, Lucide icons     | Put reusable UI building blocks in shared component folders.                                                               |
| YouTube API         | Server-only `fetch` client                | Do not expose the YouTube API key to the browser.                                                                          |
| Testing             | Vitest, React Testing Library, Playwright | Test domain utilities, UI behavior, and core end-to-end flows.                                                             |

## 3. Architecture Principles

### DRY is mandatory

Do not duplicate business logic, validation, API calls, authentication checks, error mapping, or reusable UI behavior.

Create one shared implementation for:

- Mongoose connection management.
- JWT creation, verification, cookie setting, and cookie clearing.
- Resolving the authenticated user from a request.
- Zod validation schemas for each domain input.
- YouTube Data API requests and response mapping.
- Video eligibility filtering.
- Query keys and React Query hooks.
- Common loading, empty, and error states.

Do not create abstractions merely because code looks similar once. Extract an abstraction when behavior is genuinely shared or expected to be reused.

### Component boundaries

- Reusable building blocks such as inputs, buttons, dialogs/modals, cards, loaders, empty states, and error states belong in shared components.
- Feature-specific UI belongs inside its feature folder.
- A component nearing **300 lines** must be split into smaller focused components, hooks, or utilities.
- A component should own one clear UI responsibility. Keep business logic out of presentational components where practical.
- Custom hooks that consume server state belong in `features/<feature>/hooks/`, not inside `components/`.

### State ownership

| State type                                                                | Owner                    |
| ------------------------------------------------------------------------- | ------------------------ |
| Current user and saved-channel records                                    | MongoDB                  |
| Current YouTube videos                                                    | YouTube Data API         |
| Fetched channels, previews, videos, mutations, and pagination             | TanStack React Query     |
| Shared client-only UI state, such as modal visibility or selected channel | Zustand                  |
| Local form field state                                                    | React Hook Form          |
| JWT session                                                               | HTTP-only browser cookie |

Zustand must not store fetched channels, fetched videos, session tokens, or duplicate React Query data.

## 4. High-Level Request Flow

```text
Browser
  ├── Next.js pages and reusable UI
  ├── Zustand: local shared UI state
  └── TanStack Query: server data and video pagination
             │
             ▼
Next.js server boundary
  ├── proxy.js: route-level cookie guard
  ├── Server Actions: authenticated channel mutations
  └── Route Handlers: authentication, channel reads, and paginated video reads
             │
             ├── Mongoose ──► MongoDB (users, saved channels)
             └── YouTube client ──► YouTube Data API
```

The `proxy.js` guard improves navigation but is not the authorization boundary. Every protected Server Action and Route Handler must independently call `requireCurrentUser()` before accessing data.

## 5. Project Structure

SKTube uses the existing root-level `app/` directory. Do not introduce a `src/` directory.

```text
app/
├── (auth)/
│   ├── login/page.js
│   └── register/page.js
├── (protected)/
│   ├── layout.js
│   ├── dashboard/page.js
│   └── channels/[channelId]/page.js
├── api/
│   ├── auth/
│   │   ├── register/route.js
│   │   ├── login/route.js
│   │   ├── logout/route.js
│   │   └── google/
│   │       ├── route.js          # Starts Google OAuth
│   │       └── callback/route.js # Verifies and links Google identity
│   └── channels/
│       ├── route.js
│       └── [channelId]/videos/route.js
├── globals.css
├── layout.js
├── page.js
└── providers.js
components/
├── ui/                     # Reusable shadcn-based building blocks
└── shared/                 # Reusable app-level components
features/
├── auth/
│   ├── __tests__/
│   │   ├── api.test.js
│   │   └── schemas.test.js
│   ├── api.js
│   ├── hooks/
│   │   ├── use-login-mutation.js
│   │   ├── use-register-mutation.js
│   │   └── use-logout-mutation.js
│   ├── components/
│   ├── query-keys.js
│   └── schemas.js
├── channels/
│   ├── __tests__/
│   ├── actions.js
│   ├── api.js
│   ├── components/
│   ├── hooks/
│   ├── query-keys.js
│   └── schemas.js
└── videos/
    ├── __tests__/
    ├── api.js
    ├── components/
    ├── hooks/
    ├── query-keys.js
    └── utils.js
lib/
├── __tests__/
│   ├── env.test.js
│   ├── errors.test.js
│   └── auth/
│       └── session.test.js
├── auth/
│   ├── session.js
│   └── require-current-user.js
├── db.js
├── env.js
├── errors.js
├── google-auth.js
└── youtube-client.js
models/
├── User.js
└── SavedChannel.js
stores/
└── ui-store.js
docs/
├── PRD.md
└── ARCHITECTURE.md
__tests__/
└── proxy.test.js
proxy.js
```

## 6. Database Design

### User model

The User model is the source of truth for an SKTube identity. Since Google-only account creation is not allowed in MVP, every user has an email/password credential.

Required fields:

- `name`
- `email`: normalized to lowercase, trimmed, unique, and indexed
- `passwordHash`: bcrypt hash; never selected or returned by default unless needed to authenticate
- `googleId`: optional stable Google subject identifier, unique when present
- `googleLinkedAt`: optional timestamp
- Mongoose `createdAt` and `updatedAt`

Rules:

- Never store a plaintext password.
- Never use the email address as the Google identity. Use Google’s stable subject ID after its verified email has matched the existing user.
- Do not allow a Google ID already linked to one user to be linked to another.

### SavedChannel model

Required fields:

- `userId`: ObjectId reference to User, indexed
- `youtubeChannelId`: canonical YouTube channel ID
- `title`
- `handle`: optional YouTube handle
- `thumbnailUrl`
- `uploadsPlaylistId`: channel uploads playlist ID used for video retrieval
- Mongoose `createdAt` and `updatedAt`

Indexes:

- Unique compound index: `{ userId: 1, youtubeChannelId: 1 }`.
- Query index for dashboard ordering: `{ userId: 1, createdAt: -1 }`.

No video documents, video caches, history records, favorites, or background-sync records exist in MVP.

## 7. Authentication and Authorization

### Session design

SKTube uses a stateless signed JWT stored in an HTTP-only cookie named `sktube_session`.

JWT requirements:

- Payload contains the minimum required identity: `sub` set to the MongoDB user ID.
- Use a server-only secret from `SESSION_SECRET`.
- Sign using HS256.
- Include issued-at and seven-day expiry claims.
- Do not put email addresses, names, roles, password data, Google tokens, or other sensitive data in the payload.

Cookie requirements:

- `httpOnly: true`
- `secure: true` in production
- `sameSite: "lax"`
- `path: "/"`
- Seven-day `maxAge`/expiry aligned with the JWT expiry

The session utility is the only place allowed to create, verify, set, or clear the session cookie.

### Email/password registration and login

Authentication is exposed through Route Handlers, not Server Actions:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/google` to start the Google OAuth redirect
- `GET /api/auth/google/callback` to handle the Google OAuth callback

Registration:

1. Validate name, email, and password using Zod.
2. Normalize email before querying.
3. Reject duplicate email addresses.
4. Hash password with bcrypt.
5. Create the User document.
6. Create the signed JWT and set the session cookie.

Login:

1. Validate email and password with Zod.
2. Find the user by normalized email and explicitly select `passwordHash`.
3. Compare with bcrypt.
4. On success, create the JWT and set the session cookie.
5. On failure, return a generic invalid-credentials response.

Logout clears `sktube_session` and redirects or returns success.

### Google login and linking

Google is an alternate sign-in method for an existing password account only.

1. Complete the Google OAuth flow server-side.
2. Verify Google’s identity token using `google-auth-library`.
3. Require a verified Google email and a Google subject ID.
4. Find the User by normalized verified email.
5. If no user exists, reject the login with a message explaining that the user must register with email/password first.
6. If `googleId` is absent, link the verified Google subject ID to that user.
7. If `googleId` exists, require it to match the verified Google subject ID.
8. Create the same `sktube_session` cookie used by email/password login.

Do not automatically create a user from Google. Do not link accounts based on an unverified email. Do not store Google access or refresh tokens because the application uses its own YouTube API key rather than acting on the user’s YouTube account.

### Protected routes and data access

`proxy.js`:

- Reads `sktube_session`.
- Verifies the JWT.
- Redirects unauthenticated users away from protected pages such as `/dashboard` and `/channels/*`.
- Redirects authenticated users away from login/register pages.

`requireCurrentUser()`:

1. Reads the session cookie on the server.
2. Verifies the JWT.
3. Fetches the user from MongoDB using the JWT `sub`.
4. Returns the user or throws/returns a normalized unauthorized error.

Every protected Server Action and Route Handler must call `requireCurrentUser()`. Every channel database query must include the authenticated user ID; never trust a client-provided user ID.

## 8. Data Fetching and Mutation Patterns

### React Query

Install one Query Client provider at the application root. Define query keys in the owning feature, for example:

```text
channels.all
channels.detail(channelId)
videos.byChannel(channelId)
```

Rules:

- All server state consumed by the UI must go through TanStack React Query (`useQuery`, `useMutation`, or `useInfiniteQuery`).
- Client components must not call `fetch` directly for application server data; use feature `api.js` functions wrapped by hooks in `hooks/`.
- React Query hooks live in `features/<feature>/hooks/`, not inside `components/`.
- Plain fetch/request functions live in `features/<feature>/api.js` (or Server Actions for mutations, wrapped by `useMutation` in hooks).
- Query keys live in `features/<feature>/query-keys.js`.
- Use `useQuery` for saved-channel reads.
- Use `useMutation` for Server Action calls and Route Handler mutations, then invalidate the affected query keys.
- Use `useInfiniteQuery` only for the channel video feed.
- React Hook Form owns local form field state only; mutation lifecycle (`isPending`, `error`, `onSuccess`) comes from React Query.
- Do not duplicate query results into Zustand.
- Keep fetch functions and query hooks inside the feature that owns them.

### Server Actions

Use Server Actions for authenticated application mutations:

- Previewing a supported YouTube channel before confirmation.
- Adding a confirmed channel.
- Removing a channel.

Each action validates its input with Zod, calls `requireCurrentUser()` where needed, performs server-side authorization, and returns a normalized success/error result. Client components use React Query mutations around actions when mutation status or cache invalidation is required.

### Route Handlers

Use Route Handlers for authentication and data accessed by client-side React Query:

- `POST /api/auth/register`: creates an email/password user and sets `sktube_session`.
- `POST /api/auth/login`: validates credentials and sets `sktube_session`.
- `POST /api/auth/logout`: clears `sktube_session`.
- `GET /api/auth/google`: creates the Google OAuth authorization redirect.
- `GET /api/auth/google/callback`: verifies the Google identity, links it only to a matching existing password account, and sets `sktube_session`.
- `GET /api/channels`: the authenticated user’s saved channels, ordered newest first.
- `GET /api/channels/[channelId]/videos?cursor=`: current eligible YouTube videos for one saved channel.

Route Handlers must validate parameters, authenticate the request, verify ownership, and return an explicit JSON response shape. They must not expose database documents or raw YouTube responses directly.

## 9. YouTube Integration

All YouTube requests are made server-side through `lib/youtube-client.js`. The browser never receives `YOUTUBE_API_KEY`.

### Supported channel input

The add-channel preview accepts only:

- A YouTube handle, such as `@Fireship`.
- A YouTube channel URL whose path is `/channel/<canonical-channel-id>`.

Reject every other format before calling YouTube, including video URLs, playlist URLs, custom channel URLs, search URLs, and malformed input.

### Preview and persistence

1. Normalize and validate the submitted identifier.
2. Resolve it with the YouTube Data API.
3. Return a preview containing canonical channel ID, title, handle where available, thumbnail, and uploads playlist ID.
4. On confirmation, check for an existing `{ userId, youtubeChannelId }` record.
5. Create the SavedChannel record if unique.
6. Rely on the compound unique index as the final duplicate safeguard.

### Video retrieval

For a saved channel:

1. Load the channel only after verifying it belongs to the current user.
2. Read its `uploadsPlaylistId`.
3. Call `playlistItems.list` with `maxResults=50` and the incoming page token. YouTube’s uploads playlist represents the channel’s uploaded videos and is the appropriate newest-first source. [YouTube playlist items documentation](https://developers.google.com/youtube/v3/docs/playlistItems/list)
4. Fetch details for the returned video IDs with `videos.list`.
5. Map only fields the product needs: video ID, title, thumbnail, ISO duration, published date, and YouTube watch URL.
6. Filter the mapped results using the shared video eligibility utility.
7. Continue through underlying YouTube pages until 50 eligible videos are collected or no next page token remains.
8. Return up to 50 eligible videos and an opaque next cursor for `useInfiniteQuery`.

The cursor represents only the next position in the saved channel’s uploads playlist. It does not grant access to another user’s channel because ownership is always checked before it is used.

### Eligibility filter

The shared utility excludes a video when any of these are true:

- The video detail is absent, deleted, private, unavailable, or not public.
- It is a live, upcoming, or archived livestream.
- Its parsed ISO 8601 duration is **strictly less than 120 seconds**.

A video exactly two minutes long is eligible. This is the explicit MVP short-video rule; SKTube does not attempt to infer YouTube’s internal Shorts classification.

### Video links

Each eligible card links to `https://www.youtube.com/watch?v=<videoId>`.

- Desktop links open in a new tab with safe link attributes.
- On mobile, the normal browser/OS handling may open the YouTube app when available.

### No video caching

Do not save fetched videos in MongoDB, React Query persistence, Redis, or a background job. React Query’s in-memory cache is allowed only for the active browser session and normal UI behavior.

## 10. Shared UI and Responsive Design

### Reusable UI building blocks

Place reusable components in `components/ui` or `components/shared`, including:

- Button, input, label, form field, and validation message.
- Dialog/modal and confirmation dialog.
- Search input.
- Loading indicator/skeleton.
- Empty-state and error-state components.
- Channel card and video-card primitives when their display behavior is reused.

Feature components compose these blocks rather than reimplementing them.

### Responsive behavior

- Use mobile-first Tailwind styles.
- Channel cards form a responsive grid: one column on narrow screens and progressively more columns when space allows.
- Add-channel, search, removal, and video-feed controls must remain usable with touch input.
- The dashboard keeps recently added channels first before and after filtering.

## 11. Error Handling

Use normalized application errors; do not pass raw MongoDB, JWT, or YouTube API errors to the UI.

| Situation                                        | User-facing behavior                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Missing/invalid/expired session                  | Redirect to login for pages; return 401 for API requests.                     |
| Missing user for a valid token                   | Treat as unauthorized and clear the session at the next auth response.        |
| Invalid credentials                              | Generic login failure message.                                                |
| Google email has no password account             | Explain that email/password registration is required before Google sign-in.   |
| Unsupported channel input                        | Explain the accepted `@handle` and `/channel/` URL formats.                   |
| Channel not found                                | Show a clear, retryable preview error.                                        |
| Duplicate saved channel                          | Explain that the channel already exists in the user’s library.                |
| YouTube quota/API failure                        | Show a retryable error without exposing the API key or raw upstream response. |
| No saved channels/search results/eligible videos | Use a reusable empty state with the appropriate next action.                  |

## 12. Environment Variables

```text
MONGODB_URI=
SESSION_SECRET=
YOUTUBE_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_APP_URL=
```

Validate server environment variables at application startup through `lib/env.js`. Never prefix secrets with `NEXT_PUBLIC_`. Commit an `.env.example` containing names only.

## 13. Testing Strategy

### Test file layout

- All Vitest tests live in `__tests__/` folders colocated with the code under test.
- Never place `*.test.js` or `*.spec.js` alongside source files.
- Name files `<subject>.test.js` inside `__tests__/`.
- Mirror subpaths when testing nested modules (for example, `lib/__tests__/auth/session.test.js` for `lib/auth/session.js`).
- Route Handler integration tests go in `app/api/<route>/__tests__/`.
- Future Playwright E2E tests go in `e2e/` at the repo root (not Vitest).

### Unit tests

- Supported channel input parsing.
- Video duration parsing and eligibility filtering, especially the 120-second boundary.
- JWT/session utility behavior.
- Zod schemas.
- YouTube response mapping.

### Integration tests

- Registration, duplicate-email rejection, login, logout, and protected-action rejection.
- Google linking succeeds only for a matching existing verified email/password user.
- Google login rejects an unknown email rather than creating a user.
- Saved-channel duplicate protection and ownership checks.
- Video endpoint filtering and cursor behavior with mocked YouTube responses.

### End-to-end tests

- Register/login, add a previewed channel, search it, remove it.
- Browse an eligible video feed and load another page.
- Attempt to open protected pages while logged out.
- Validate mobile-sized dashboard interaction.

## 14. Explicit MVP Boundaries

Do not add these without changing the PRD and this architecture:

- Video persistence, history, favorites, watch later, playlists, or notifications.
- Background refresh or scheduled synchronization.
- Redis or server-side caching.
- Google-only account registration.
- Arbitrary YouTube URL support.
- Custom ordering, folders, tags, social features, or sharing.
