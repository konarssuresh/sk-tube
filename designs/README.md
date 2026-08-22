# SKTube Design Reference

Open `index.html` in a browser to review the interactive MVP design reference.

## Included flows

- Login
- Registration
- Dashboard with channel search
- Empty dashboard
- Add-channel input and preview confirmation
- Duplicate-channel feedback
- Remove-channel confirmation
- Channel video feed with infinite-scroll loading state
- Video-feed empty and upstream-error states
- Embedded video playback page with “Open on YouTube” action
- Embedded-playback blocked fallback state
- Discover: video search with eligible-result filtering and infinite-scroll loading state
- Discover: channel search with public metrics and already-saved/add-to-library states
- Embedded playback for a searched video whose channel is not in the user’s library

## Visual direction

- Dark, calm, content-first interface.
- A restrained red accent references YouTube without recreating YouTube’s visual language.
- Rounded, low-contrast surfaces keep channel and video artwork as the visual focus.
- Mobile layouts collapse the channel grid, stack channel search results, and keep primary actions reachable.

This is a product-design reference, not production application code. The implementation must still follow `docs/PRD.md`, `docs/ARCHITECTURE.md`, and `docs/DEVELOPMENT_PLAN.md`.
