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

export function isInstalledPwa() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function shouldUseMutedAutoplay({
  userAgent = "",
  coarsePointer = false,
  narrowViewport = false,
  installedPwa = false,
} = {}) {
  const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(userAgent);

  return (
    isMobileUserAgent ||
    coarsePointer ||
    narrowViewport ||
    installedPwa
  );
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

export function buildYoutubeEmbedUrl({ videoId, appOrigin }) {
  const url = new URL(`${YOUTUBE_NO_COOKIE_HOST}/embed/${videoId}`);
  const playerVars = getYoutubePlayerVars({ appOrigin });

  for (const [key, value] of Object.entries(playerVars)) {
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function getYoutubeNoCookieHost() {
  return YOUTUBE_NO_COOKIE_HOST;
}
