/**
 * Serwist's default Next.js cache list ends with a broad cross-origin
 * NetworkFirst rule. That intercepts third-party embed traffic (including
 * YouTube) and breaks playback in mobile/installed PWAs. Those requests
 * should bypass the service worker entirely.
 */
export function isCrossOriginCatchAllCacheRule(entry) {
  if (typeof entry.matcher !== "function") {
    return false;
  }

  const crossOriginRequest = {
    sameOrigin: false,
    url: new URL("https://example.com/resource"),
    request: new Request("https://example.com/resource"),
  };
  const sameOriginRequest = {
    sameOrigin: true,
    url: new URL("https://example.com/resource"),
    request: new Request("https://example.com/resource"),
  };

  return (
    entry.matcher(crossOriginRequest) === true &&
    entry.matcher(sameOriginRequest) === false
  );
}

export function withoutCrossOriginCatchAllCache(defaultCache) {
  return defaultCache.filter((entry) => !isCrossOriginCatchAllCacheRule(entry));
}
