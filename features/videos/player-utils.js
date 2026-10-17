const YOUTUBE_NO_COOKIE_HOST = "https://www.youtube-nocookie.com";

export function buildYoutubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function resolvePlayerOrigin(appOrigin) {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return appOrigin;
}

export function shouldUseConservativePlayback({
  userAgent = "",
  coarsePointer = false,
  narrowViewport = false,
  installedPwa = false,
} = {}) {
  const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(userAgent);

  return (
    installedPwa ||
    isMobileUserAgent ||
    coarsePointer ||
    narrowViewport
  );
}

/** @deprecated Use shouldUseConservativePlayback */
export function shouldUseMutedAutoplay(options) {
  return shouldUseConservativePlayback(options);
}

export function readYoutubeEmbedPreferences() {
  if (typeof window === "undefined") {
    return { useConservativePlayback: true };
  }

  return {
    useConservativePlayback: shouldUseConservativePlayback({
      userAgent: window.navigator.userAgent,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches,
      narrowViewport: window.matchMedia("(max-width: 639px)").matches,
      installedPwa:
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true,
    }),
  };
}

export function getYoutubePlayerVars({ appOrigin, useMutedAutoplay = false }) {
  return {
    autoplay: 1,
    playsinline: 1,
    rel: 0,
    origin: appOrigin,
    enablejsapi: 1,
    ...(useMutedAutoplay ? { mute: 1 } : {}),
  };
}

export function getYoutubeEmbedParams({
  appOrigin,
  useConservativePlayback = false,
}) {
  return {
    autoplay: useConservativePlayback ? 0 : 1,
    playsinline: 1,
    rel: 0,
    origin: appOrigin,
  };
}

export function buildYoutubeEmbedUrl({
  videoId,
  appOrigin,
  useConservativePlayback = false,
  /** @deprecated Use useConservativePlayback */
  useMutedAutoplay,
}) {
  const conservative =
    useConservativePlayback ||
    (useMutedAutoplay !== undefined ? useMutedAutoplay : false);

  const url = new URL(`${YOUTUBE_NO_COOKIE_HOST}/embed/${videoId}`);
  const playerVars = getYoutubeEmbedParams({
    appOrigin,
    useConservativePlayback: conservative,
  });

  for (const [key, value] of Object.entries(playerVars)) {
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function getYoutubeNoCookieHost() {
  return YOUTUBE_NO_COOKIE_HOST;
}
