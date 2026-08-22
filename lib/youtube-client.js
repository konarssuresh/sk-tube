import { isVideoEligible } from "@/features/videos/utils";
import { getEnv } from "@/lib/env";
import { AppError, AppErrorCode } from "@/lib/errors";

const ELIGIBLE_VIDEOS_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 50;
const DESCRIPTION_EXCERPT_LENGTH = 120;

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

function getYouTubeApiBase() {
  return process.env.YOUTUBE_API_BASE || "https://www.googleapis.com/youtube/v3";
}

async function youtubeFetch(endpoint, params) {
  const { YOUTUBE_API_KEY } = getEnv();
  const url = new URL(`${getYouTubeApiBase()}/${endpoint}`);

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
    if (response.status === 404) {
      throw new AppError(
        AppErrorCode.NOT_FOUND,
        "This channel is no longer accessible on YouTube.",
      );
    }

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

export function mapYouTubeVideoItem(video) {
  const thumbnailUrl = pickThumbnailUrl(video?.snippet?.thumbnails);
  const duration = video?.contentDetails?.duration;
  const publishedAt = video?.snippet?.publishedAt;
  const title = video?.snippet?.title;
  const videoId = video?.id;

  if (!videoId || !title || !thumbnailUrl || !duration || !publishedAt) {
    throw new AppError(
      AppErrorCode.UPSTREAM,
      "This video could not be loaded from YouTube. Please try again.",
    );
  }

  return {
    videoId,
    title,
    thumbnailUrl,
    duration,
    publishedAt,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export function mapYouTubePlaybackVideo(video) {
  const base = mapYouTubeVideoItem(video);

  return {
    ...base,
    embeddable: video?.status?.embeddable === true,
    youtubeChannelId: video?.snippet?.channelId ?? null,
    channelTitle: video?.snippet?.channelTitle ?? null,
  };
}

export function mapYouTubeSearchVideoItem(video) {
  const base = mapYouTubeVideoItem(video);

  return {
    ...base,
    channelTitle: video?.snippet?.channelTitle ?? null,
  };
}

function excerptDescription(text, maxLength = DESCRIPTION_EXCERPT_LENGTH) {
  if (!text || typeof text !== "string") {
    return "";
  }

  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function parseOptionalCount(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export function mapYouTubeDiscoveryChannelItem(item) {
  const thumbnailUrl = pickThumbnailUrl(item?.snippet?.thumbnails);
  const uploadsPlaylistId = item?.contentDetails?.relatedPlaylists?.uploads;

  if (!thumbnailUrl || !item?.snippet?.title || !item?.id || !uploadsPlaylistId) {
    throw new AppError(
      AppErrorCode.UPSTREAM,
      "This channel could not be loaded from YouTube. Please try again.",
    );
  }

  const statistics = item?.statistics ?? {};
  const subscriberCount = statistics.hiddenSubscriberCount
    ? null
    : parseOptionalCount(statistics.subscriberCount);

  return {
    youtubeChannelId: item.id,
    title: item.snippet.title,
    handle: formatHandle(item.snippet.customUrl),
    thumbnailUrl,
    description: excerptDescription(item.snippet.description),
    subscriberCount,
    videoCount: parseOptionalCount(statistics.videoCount),
    viewCount: parseOptionalCount(statistics.viewCount),
    uploadsPlaylistId,
  };
}

async function youtubeSearch(type, query, pageToken) {
  const params = {
    part: "snippet",
    type,
    q: query,
    maxResults: String(SEARCH_PAGE_SIZE),
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  return youtubeFetch("search", params);
}

async function fetchChannelDetails(channelIds) {
  if (channelIds.length === 0) {
    return [];
  }

  const payload = await youtubeFetch("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelIds.join(","),
  });

  return payload?.items ?? [];
}

function collectEligibleSearchVideos(searchItems, videoDetails, startIndex = 0) {
  const detailsById = new Map(videoDetails.map((video) => [video.id, video]));
  const eligibleVideos = [];

  for (let index = startIndex; index < searchItems.length; index += 1) {
    const searchItem = searchItems[index];
    const videoId = searchItem?.id?.videoId;

    if (!videoId) {
      continue;
    }

    const video = detailsById.get(videoId);

    if (!video || !isVideoEligible(video)) {
      continue;
    }

    eligibleVideos.push({
      index,
      video: mapYouTubeSearchVideoItem(video),
    });
  }

  return eligibleVideos;
}

export async function fetchSearchVideo(videoId) {
  const items = await fetchVideoDetails([videoId]);
  const video = items[0];

  if (!video || !isVideoEligible(video)) {
    throw new AppError(AppErrorCode.NOT_FOUND, "Video not found.");
  }

  return mapYouTubePlaybackVideo(video);
}

export async function fetchSearchEligibleVideos({ query, pageToken }) {
  const videos = [];
  let { pageToken: currentPageToken, startIndex } =
    decodeVideoFeedCursor(pageToken);

  while (videos.length < ELIGIBLE_VIDEOS_PAGE_SIZE) {
    const searchPayload = await youtubeSearch("video", query, currentPageToken);
    const searchItems = searchPayload?.items ?? [];

    if (searchItems.length === 0) {
      return {
        videos,
        nextCursor: null,
      };
    }

    const remainingItems = searchItems.slice(startIndex);
    const videoIds = remainingItems
      .map((item) => item?.id?.videoId)
      .filter(Boolean);
    const videoDetails = await fetchVideoDetails(videoIds);
    const eligibleEntries = collectEligibleSearchVideos(
      searchItems,
      videoDetails,
      startIndex,
    );

    for (const entry of eligibleEntries) {
      videos.push(entry.video);

      if (videos.length === ELIGIBLE_VIDEOS_PAGE_SIZE) {
        const hasMoreOnPage = entry.index < searchItems.length - 1;
        const nextSearchPageToken = searchPayload?.nextPageToken ?? null;

        if (hasMoreOnPage || nextSearchPageToken) {
          return {
            videos,
            nextCursor: hasMoreOnPage
              ? encodeVideoFeedCursor({
                  pageToken: currentPageToken ?? null,
                  startIndex: entry.index + 1,
                })
              : encodeVideoFeedCursor({
                  pageToken: nextSearchPageToken,
                  startIndex: 0,
                }),
          };
        }

        return {
          videos,
          nextCursor: null,
        };
      }
    }

    currentPageToken = searchPayload?.nextPageToken ?? undefined;
    startIndex = 0;

    if (!currentPageToken) {
      return {
        videos,
        nextCursor: null,
      };
    }
  }

  return {
    videos,
    nextCursor: null,
  };
}

export async function fetchSearchChannels({ query, pageToken }) {
  const searchPayload = await youtubeSearch("channel", query, pageToken);
  const searchItems = searchPayload?.items ?? [];

  if (searchItems.length === 0) {
    return {
      channels: [],
      nextCursor: null,
    };
  }

  const channelIds = searchItems
    .map((item) => item?.id?.channelId ?? item?.snippet?.channelId)
    .filter(Boolean);
  const channelDetails = await fetchChannelDetails(channelIds);
  const channels = channelDetails.map((item) =>
    mapYouTubeDiscoveryChannelItem(item),
  );

  return {
    channels,
    nextCursor: searchPayload?.nextPageToken ?? null,
  };
}

export async function fetchOwnedChannelVideo({ youtubeChannelId, videoId }) {
  const items = await fetchVideoDetails([videoId]);
  const video = items[0];

  if (!video) {
    throw new AppError(AppErrorCode.NOT_FOUND, "Video not found.");
  }

  if (video.snippet?.channelId !== youtubeChannelId) {
    throw new AppError(AppErrorCode.NOT_FOUND, "Video not found.");
  }

  if (!isVideoEligible(video)) {
    throw new AppError(AppErrorCode.NOT_FOUND, "Video not found.");
  }

  return mapYouTubePlaybackVideo(video);
}

async function fetchPlaylistItems(uploadsPlaylistId, pageToken) {
  const params = {
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: String(ELIGIBLE_VIDEOS_PAGE_SIZE),
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  return youtubeFetch("playlistItems", params);
}

async function fetchVideoDetails(videoIds) {
  if (videoIds.length === 0) {
    return [];
  }

  const payload = await youtubeFetch("videos", {
    part: "snippet,contentDetails,status",
    id: videoIds.join(","),
  });

  return payload?.items ?? [];
}

function collectEligibleVideos(playlistItems, videoDetails, startIndex = 0) {
  const detailsById = new Map(videoDetails.map((video) => [video.id, video]));
  const eligibleVideos = [];

  for (let index = startIndex; index < playlistItems.length; index += 1) {
    const playlistItem = playlistItems[index];
    const videoId = playlistItem?.contentDetails?.videoId;

    if (!videoId) {
      continue;
    }

    const video = detailsById.get(videoId);

    if (!video || !isVideoEligible(video)) {
      continue;
    }

    eligibleVideos.push({
      index,
      video: mapYouTubeVideoItem(video),
    });
  }

  return eligibleVideos;
}

function encodeVideoFeedCursor({ pageToken, startIndex }) {
  return Buffer.from(
    JSON.stringify({
      pageToken: pageToken ?? null,
      startIndex,
    }),
  ).toString("base64url");
}

function decodeVideoFeedCursor(cursor) {
  if (!cursor) {
    return { pageToken: undefined, startIndex: 0 };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    return {
      pageToken: parsed.pageToken ?? undefined,
      startIndex: Number.isInteger(parsed.startIndex) ? parsed.startIndex : 0,
    };
  } catch {
    return { pageToken: cursor, startIndex: 0 };
  }
}

export async function fetchEligibleChannelVideos({
  uploadsPlaylistId,
  pageToken,
}) {
  const videos = [];
  let { pageToken: currentPageToken, startIndex } =
    decodeVideoFeedCursor(pageToken);

  while (videos.length < ELIGIBLE_VIDEOS_PAGE_SIZE) {
    const playlistPayload = await fetchPlaylistItems(
      uploadsPlaylistId,
      currentPageToken,
    );
    const playlistItems = playlistPayload?.items ?? [];

    if (playlistItems.length === 0) {
      return {
        videos,
        nextCursor: null,
      };
    }

    const remainingItems = playlistItems.slice(startIndex);
    const videoIds = remainingItems
      .map((item) => item?.contentDetails?.videoId)
      .filter(Boolean);
    const videoDetails = await fetchVideoDetails(videoIds);
    const eligibleEntries = collectEligibleVideos(
      playlistItems,
      videoDetails,
      startIndex,
    );

    for (const entry of eligibleEntries) {
      videos.push(entry.video);

      if (videos.length === ELIGIBLE_VIDEOS_PAGE_SIZE) {
        const hasMoreOnPage = entry.index < playlistItems.length - 1;
        const nextPlaylistPageToken = playlistPayload?.nextPageToken ?? null;

        if (hasMoreOnPage || nextPlaylistPageToken) {
          return {
            videos,
            nextCursor: hasMoreOnPage
              ? encodeVideoFeedCursor({
                  pageToken: currentPageToken ?? null,
                  startIndex: entry.index + 1,
                })
              : encodeVideoFeedCursor({
                  pageToken: nextPlaylistPageToken,
                  startIndex: 0,
                }),
          };
        }

        return {
          videos,
          nextCursor: null,
        };
      }
    }

    currentPageToken = playlistPayload?.nextPageToken ?? undefined;
    startIndex = 0;

    if (!currentPageToken) {
      return {
        videos,
        nextCursor: null,
      };
    }
  }

  return {
    videos,
    nextCursor: null,
  };
}
