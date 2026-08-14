export function buildYoutubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function buildYoutubeEmbedUrl({ videoId, appOrigin }) {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);

  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");
  url.searchParams.set("origin", appOrigin);

  return url.toString();
}
