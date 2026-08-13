import { getEnv } from "@/lib/env";
import { AppError, AppErrorCode } from "@/lib/errors";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function pickThumbnailUrl(thumbnails) {
  return (
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    null
  );
}

function formatHandle(customUrl) {
  if (!customUrl || typeof customUrl !== "string") {
    return null;
  }

  const trimmed = customUrl.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function mapYouTubeChannelItem(item) {
  const uploadsPlaylistId = item?.contentDetails?.relatedPlaylists?.uploads;
  const thumbnailUrl = pickThumbnailUrl(item?.snippet?.thumbnails);

  if (!uploadsPlaylistId) {
    throw new AppError(
      AppErrorCode.UPSTREAM,
      "This channel could not be loaded from YouTube. Please try again.",
    );
  }

  if (!thumbnailUrl || !item?.snippet?.title || !item?.id) {
    throw new AppError(
      AppErrorCode.UPSTREAM,
      "This channel could not be loaded from YouTube. Please try again.",
    );
  }

  return {
    youtubeChannelId: item.id,
    title: item.snippet.title,
    handle: formatHandle(item.snippet.customUrl),
    thumbnailUrl,
    uploadsPlaylistId,
  };
}

async function youtubeFetch(endpoint, params) {
  const { YOUTUBE_API_KEY } = getEnv();
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);

  url.searchParams.set("key", YOUTUBE_API_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let response;

  try {
    response = await fetch(url.toString());
  } catch {
    throw new AppError(
      AppErrorCode.UPSTREAM,
      "Could not reach YouTube. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new AppError(
      AppErrorCode.UPSTREAM,
      "YouTube is unavailable right now. Please try again.",
    );
  }

  return response.json();
}

async function fetchChannelList(params) {
  const payload = await youtubeFetch("channels", {
    part: "snippet,contentDetails",
    ...params,
  });

  const item = payload?.items?.[0];

  if (!item) {
    throw new AppError(AppErrorCode.NOT_FOUND, "Channel not found.");
  }

  return mapYouTubeChannelItem(item);
}

export async function resolveChannelPreview(normalizedInput) {
  if (normalizedInput.type === "handle") {
    const forHandle = normalizedInput.handle.replace(/^@/, "");

    return fetchChannelList({ forHandle });
  }

  return fetchChannelList({ id: normalizedInput.youtubeChannelId });
}
