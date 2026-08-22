# SKTube — Product Requirements Document

## 1. Product Overview

SKTube is a responsive web application for maintaining a personal library of YouTube channels and browsing their latest long-form videos.

Users sign in, save YouTube channels, and view each channel’s current videos directly from YouTube data. SKTube stores channel metadata only; YouTube remains the source of truth for videos.

## 2. Goals

- Let users create and manage a personal list of YouTube channels.
- Make it quick to find a saved channel and browse its latest videos.
- Provide a clean, responsive experience across desktop and mobile.
- Keep video information current by fetching it directly from YouTube.
- Support email/password authentication and Google sign-in.

## 3. Non-Goals (MVP)

SKTube will not include:

- Video storage, syncing, or watch history.
- Background syncing or scheduled jobs.
- Video caching in the application database.
- Favorites, playlists, watch later, subscriptions, or notifications.
- Channel categories, tags, folders, or custom ordering.
- Shared libraries or social features.
- Support for arbitrary YouTube URLs, video URLs, playlists, or search-result URLs.
- Importing channels from a YouTube account.

## 4. Personas

### Personal YouTube viewer

A user who follows a set of creators and wants one simple place to keep their channel list and browse recent long-form uploads.

### Returning user

A user who has previously created an email/password account and may later choose Google sign-in with the same email address.

## 5. Core User Stories

- As a visitor, I can register with email and password.
- As a visitor, I can create an account with Google using "Continue with Google."
- As a user, I can log in and log out securely.
- As an existing email/password user, I can sign in with Google using the same email without creating a duplicate account.
- As a user, I can add a YouTube channel using a supported handle or channel URL.
- As a user, I can preview a channel before confirming that I want to add it.
- As a user, I am prevented from adding the same channel twice.
- As a user, I can see my saved channels, with most recently added channels first.
- As a user, I can search my saved channels by name or handle.
- As a user, I can remove a channel from my library.
- As a user, I can browse a channel’s latest eligible videos with infinite scrolling.
- As a user, I can watch an eligible video in SKTube using the official YouTube embedded player.
- As a user, I can open a video on YouTube when embedded playback is unavailable or I prefer YouTube.

## 6. User Flows

### Registration and login

1. Visitor opens SKTube.
2. Visitor registers using email and password, or logs in.
3. The application creates a secure authenticated session using an HTTP-only cookie.
4. The authenticated user is redirected to the dashboard.

### Google login

1. Visitor selects “Continue with Google.”
2. Visitor completes Google authentication.
3. If a user account already exists with the same email address, Google sign-in links to that account.
4. Otherwise, the application creates a new account using the Google profile name and email.
5. The user receives the same cookie-based application session.

### Add a channel

1. User selects “Add Channel.”
2. User pastes or enters a supported YouTube channel identifier.
3. SKTube validates the input and retrieves channel details from YouTube.
4. SKTube shows a preview of the channel, including name, handle where available, and thumbnail.
5. User confirms adding the channel.
6. SKTube checks for an existing saved copy of that YouTube channel for the current user.
7. If unique, the channel metadata is saved and the dashboard updates.

### Browse channels and videos

1. User opens the dashboard.
2. User sees saved channel cards ordered by most recently added first.
3. User can filter channels using the search field.
4. User selects a channel.
5. SKTube fetches eligible videos directly from YouTube.
6. Videos load in pages of up to 50 as the user scrolls.
7. User selects a video to open its SKTube playback view.
8. SKTube loads the official embedded YouTube player for the selected video.
9. If YouTube blocks embedded playback, SKTube explains the issue and provides an “Open on YouTube” fallback.

### Remove a channel

1. User selects the remove action for one of their saved channels.
2. User confirms removal if confirmation is used in the UI.
3. SKTube removes the channel from that user’s library.
4. No YouTube data is modified.

## 7. Functional Requirements

### Authentication

- Users must be authenticated to access the dashboard and their channel library.
- Support registration and login using email and password.
- Support logout.
- Use secure HTTP-only cookies for the Next.js application session.
- Support Google sign-in and Google-based account creation.
- Google sign-in using the same email as an existing email/password account must link to that existing account rather than create a duplicate user.
- A user must only be able to access and modify their own saved channels.

### Dashboard

- Display the authenticated user’s saved channels.
- Show channels in descending creation order: recently added first.
- Include an “Add Channel” action.
- Include a search/filter input.
- Search must filter the current user’s saved channels by channel title and handle.
- Each channel card should show:
  - Channel thumbnail
  - Channel title
  - YouTube handle, when available
  - A way to remove the channel
- Selecting a channel opens its video browsing view.

### Add Channel

- Accept only these input formats:
  - YouTube handle, such as `@Fireship`
  - YouTube channel URL, such as `https://www.youtube.com/channel/UC...`
- Reject unsupported inputs, including video, playlist, custom, search, and arbitrary YouTube URLs.
- Resolve the supplied input using the YouTube Data API.
- Show a channel preview before persisting it.
- Require explicit user confirmation before adding the channel.
- Detect duplicates by canonical YouTube channel ID within the current user’s library.
- Show a clear message if the channel is already saved.

### Channel Videos

- Fetch video data directly from YouTube when the user views a channel.
- Do not persist video records in MongoDB for MVP.
- Load videos newest first.
- Fetch up to 50 videos per page.
- Support infinite scrolling while more pages are available.
- While the first page or additional pages are loading, show a one-row shimmer skeleton grid that matches the video card layout (one, two, or three placeholders depending on screen width).
- Display for each eligible video:
  - Thumbnail
  - Title
  - Duration
  - Published date
- Exclude:
  - YouTube Shorts
  - Live streams
  - Unavailable, deleted, private, or otherwise inaccessible videos
- Selecting a video opens an SKTube playback view with the official YouTube embedded player.
- The player must be responsive, maintain a 16:9 layout, and preserve YouTube’s native controls and branding.
- Autoplay videos when opened from the channel feed using the YouTube IFrame Player API; do not autoplay thumbnails on the grid. On mobile, start muted when browsers block unmuted autoplay and let users unmute through native YouTube controls.
- Provide an “Open on YouTube” link as a visible fallback and secondary action.
- If a video is not embeddable or playback is blocked by YouTube, show a clear explanation and the fallback link.

## 8. Data Requirements

### Stored in MongoDB

#### User

- Unique user ID
- Email address
- Authentication provider/account linkage data as required
- Password credential data for email/password accounts, stored securely
- Created and updated timestamps

#### Saved Channel

- Unique saved-channel ID
- User ID
- Canonical YouTube channel ID
- Channel title
- Channel handle, when available
- Channel thumbnail URL
- Channel creation timestamp in SKTube
- Updated timestamp if needed

### Data Constraints

- A user may save a given canonical YouTube channel ID only once.
- Different users may save the same YouTube channel.
- Video metadata must not be stored in MongoDB in MVP.
- Saved-channel records must be scoped to and queried by the authenticated user.

## 9. YouTube API Behavior

- YouTube is the source of truth for channel and video data.
- Use the YouTube Data API to resolve supported channel identifiers and retrieve channel metadata.
- Use YouTube data to retrieve the latest videos for a selected channel.
- Use YouTube pagination tokens to fetch subsequent pages.
- Request up to 50 videos per page.
- Apply eligibility filtering so Shorts, live streams, and unavailable videos are not shown.
- Retrieve and expose a video’s embed eligibility so SKTube can handle videos that YouTube will not play in an embedded player.
- If a channel or video is no longer available, present an appropriate unavailable state rather than storing stale video data.
- API failures, invalid identifiers, rate limits, and unavailable content must be handled gracefully with user-facing error messages.

## 10. Responsive UI Requirements

- SKTube must function as a responsive web application.
- The dashboard must adapt from multi-column channel cards on larger screens to an appropriate single- or reduced-column layout on smaller screens.
- Search, add-channel actions, dialogs, cards, and video lists must remain usable on mobile devices.
- Touch targets must be practical for mobile use.
- Embedded playback must remain usable on desktop and mobile, including a visible “Open on YouTube” fallback.

## 11. Error and Empty States

### Authentication

- Invalid credentials: explain that login failed without exposing sensitive account details.
- Registration conflict: explain when an email is already associated with an account.
- Google authentication failure: show a retry option and a clear generic error.

### Dashboard

- No saved channels: explain that the library is empty and provide an “Add Channel” action.
- No search matches: indicate that no saved channels match the search term.

### Add Channel

- Empty input: prompt the user to enter a handle or supported channel URL.
- Unsupported URL/input: explain accepted formats.
- Channel not found: explain that the channel could not be found.
- Duplicate channel: indicate that the channel is already in the user’s library.
- YouTube/API error: show a retryable error without losing the entered value where practical.

### Channel Videos

- Loading videos: show a responsive one-row shimmer skeleton grid matching the video card layout.
- No eligible videos: explain that no supported videos are currently available.
- No additional videos: indicate that the end of available results has been reached.
- Video retrieval failure: show a retry action.
- Unavailable channel: explain that the channel is no longer accessible on YouTube.
- Embedded playback unavailable: explain that YouTube does not allow playback in SKTube and provide “Open on YouTube.”

## 12. MVP Acceptance Criteria

The MVP is complete when:

- Users can register, log in, and log out with email and password.
- Authenticated sessions use secure HTTP-only cookies.
- Users can create an account with Google.
- Users can sign in with Google, and Google sign-in links to an existing email/password account when both use the same email.
- Unauthenticated users cannot access another user’s dashboard or saved channels.
- Users can add channels using only `@handle` input or `/channel/` URLs.
- Users see a fetched channel preview and must confirm before adding it.
- Duplicate saved channels are prevented per user.
- The dashboard lists saved channels with newest additions first.
- Users can search/filter their saved channels.
- Users can remove a saved channel from their own library.
- Channel pages display latest eligible YouTube videos, newest first.
- Videos load through infinite scrolling in pages of up to 50.
- Each displayed video includes thumbnail, title, duration, and published date.
- Shorts, live streams, and unavailable videos are not displayed.
- Selecting a video opens a responsive official YouTube embedded player inside SKTube.
- Videos that cannot play in the embedded player show a clear “Open on YouTube” fallback.
- MongoDB stores users and saved channel metadata, but not video records.
- Core flows work on desktop and mobile-sized screens.
- Empty, loading, validation, duplicate, unavailable, and API-error states are handled clearly.

## 13. Future Scope

### v1.1 — Search & Discovery

SKTube will add a protected Discover area with two separate pages. Search results are fetched directly from YouTube and are never stored automatically.

#### Video Search

- Provide a protected video-search page where users can search public YouTube videos, including videos from channels they have not saved.
- Search results must use the same eligible-video rules as the channel feed: exclude unavailable videos, live streams, and videos shorter than two minutes.
- Each result shows thumbnail, title, channel title, published date, and duration.
- Results load progressively with infinite scrolling.
- Selecting a result opens the same SKTube embedded-player experience.
- A searched video must not require that its channel exists in the user’s library. It must still be validated server-side against current YouTube data before playback.
- Every searched video playback page includes the existing visible “Open on YouTube” fallback.

#### Channel Search

- Provide a protected channel-search page where users can search public YouTube channels by name or `@handle`.
- Each result shows the channel avatar, title, handle when available, description excerpt, subscriber count when publicly available, total video count, and total view count when available.
- Clearly indicate when the current user has already saved a channel.
- Let the user add a discovered channel directly from search results using the established duplicate-safe saved-channel flow.
- Do not automatically save search-result channels or retain the user’s searches in v1.1.

#### Discover navigation and responsive behavior

- Add a Discover navigation destination with separate Video Search and Channel Search views.
- On small screens, both views must remain easy to switch between and results must retain usable touch targets.

### Later potential improvements

- Channel folders, tags, and custom sorting.
- Favorites, watch later, and personal video notes.
- Watch history and progress tracking.
- Notifications for new videos.
- Caching and background refresh strategies.
- YouTube account import.
- Playlist support.
- Shared or collaborative channel libraries.
- Channel analytics and upload schedules.
