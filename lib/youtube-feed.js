import { isVideoEligible, parseIso8601Duration } from "@/features/videos/utils";
import {
  decodeVideoFeedCursor,
  encodeVideoFeedCursor,
  fetchPlaylistItems,
  fetchVideoDetails,
  mapYouTubeVideoItem,
} from "@/lib/youtube-client";

const FEED_PAGE_SIZE = 50;
const MAX_CHANNEL_FETCH_CONCURRENCY = 8;

function mapFeedVideoItem(video, channel) {
  const base = mapYouTubeVideoItem(video);

  return {
    ...base,
    channelId: channel.id,
    channelTitle: channel.title,
  };
}

function passesFeedFilters(video, filters) {
  const publishedAt = video?.snippet?.publishedAt;

  if (filters.publishedAfter) {
    if (!publishedAt || new Date(publishedAt) <= new Date(filters.publishedAfter)) {
      return false;
    }
  }

  const durationSeconds = parseIso8601Duration(video?.contentDetails?.duration);

  if (durationSeconds === null) {
    return false;
  }

  if (
    filters.minDurationSeconds !== undefined &&
    durationSeconds < filters.minDurationSeconds
  ) {
    return false;
  }

  if (
    filters.maxDurationSeconds !== undefined &&
    durationSeconds > filters.maxDurationSeconds
  ) {
    return false;
  }

  return true;
}

export function encodeFeedCursor(channelStates) {
  return Buffer.from(JSON.stringify({ channels: channelStates })).toString(
    "base64url",
  );
}

export function decodeFeedCursor(cursor) {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

    if (!parsed?.channels || typeof parsed.channels !== "object") {
      return null;
    }

    return parsed.channels;
  } catch {
    return null;
  }
}

function createInitialChannelState(channelId, cursorStates) {
  const saved = cursorStates?.[channelId];

  if (saved) {
    return {
      pageToken: saved.pageToken ?? undefined,
      startIndex: Number.isInteger(saved.startIndex) ? saved.startIndex : 0,
      exhausted: Boolean(saved.exhausted),
      playlistItems: null,
    };
  }

  return {
    pageToken: undefined,
    startIndex: 0,
    exhausted: false,
    playlistItems: null,
  };
}

function getChannelStateSnapshot(state) {
  return {
    pageToken: state.pageToken ?? null,
    startIndex: state.startIndex,
    exhausted: state.exhausted,
  };
}

async function ensurePlaylistPage(channel, state) {
  if (state.exhausted) {
    return false;
  }

  if (
    state.playlistItems &&
    state.startIndex < state.playlistItems.length
  ) {
    return true;
  }

  const playlistPayload = await fetchPlaylistItems(
    channel.uploadsPlaylistId,
    state.pageToken,
  );
  const playlistItems = playlistPayload?.items ?? [];

  if (playlistItems.length === 0) {
    state.exhausted = true;
    state.playlistItems = null;
    return false;
  }

  state.playlistItems = playlistItems;
  state.startIndex = 0;
  state.pageToken = playlistPayload?.nextPageToken ?? undefined;

  if (!playlistPayload?.nextPageToken && state.startIndex >= playlistItems.length) {
    state.exhausted = true;
  }

  return true;
}

async function fetchNextEligibleVideo(channel, state, filters) {
  while (!state.exhausted) {
    const hasPage = await ensurePlaylistPage(channel, state);

    if (!hasPage) {
      return null;
    }

    const playlistItems = state.playlistItems ?? [];
    const remainingItems = playlistItems.slice(state.startIndex);
    const videoIds = remainingItems
      .map((item) => item?.contentDetails?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      state.exhausted = true;
      state.playlistItems = null;
      continue;
    }

    const videoDetails = await fetchVideoDetails(videoIds);
    const detailsById = new Map(videoDetails.map((video) => [video.id, video]));

    for (let index = state.startIndex; index < playlistItems.length; index += 1) {
      const videoId = playlistItems[index]?.contentDetails?.videoId;

      if (!videoId) {
        continue;
      }

      const video = detailsById.get(videoId);

      if (
        !video ||
        !isVideoEligible(video) ||
        !passesFeedFilters(video, filters)
      ) {
        continue;
      }

      state.startIndex = index + 1;

      if (state.startIndex >= playlistItems.length && !state.pageToken) {
        state.exhausted = true;
      }

      return {
        video: mapFeedVideoItem(video, channel),
        publishedAt: video.snippet.publishedAt,
      };
    }

    state.playlistItems = null;

    if (!state.pageToken) {
      state.exhausted = true;
    }
  }

  return null;
}

async function runInBatches(items, batchSize, worker) {
  const results = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);
  }

  return results;
}

function hasMoreFeedResults(channelStates, channels) {
  return channels.some((channel) => {
    const state = channelStates[channel.id];

    return state && !state.exhausted;
  });
}

export async function fetchMergedFeedVideos({
  channels,
  filters,
  cursor,
}) {
  const decodedCursor = decodeFeedCursor(cursor);
  const channelStates = Object.fromEntries(
    channels.map((channel) => [
      channel.id,
      createInitialChannelState(channel.id, decodedCursor),
    ]),
  );

  const heads = new Map();

  await runInBatches(channels, MAX_CHANNEL_FETCH_CONCURRENCY, async (channel) => {
    const state = channelStates[channel.id];
    const next = await fetchNextEligibleVideo(channel, state, filters);

    if (next) {
      heads.set(channel.id, {
        channel,
        state,
        video: next.video,
        publishedAt: next.publishedAt,
      });
    }
  });

  const videos = [];

  while (videos.length < FEED_PAGE_SIZE && heads.size > 0) {
    let winnerId = null;
    let winnerPublishedAt = null;

    for (const [channelId, head] of heads.entries()) {
      if (
        winnerPublishedAt === null ||
        new Date(head.publishedAt) > new Date(winnerPublishedAt)
      ) {
        winnerId = channelId;
        winnerPublishedAt = head.publishedAt;
      }
    }

    const winner = heads.get(winnerId);
    videos.push(winner.video);

    const next = await fetchNextEligibleVideo(
      winner.channel,
      winner.state,
      filters,
    );

    if (next) {
      heads.set(winnerId, {
        channel: winner.channel,
        state: winner.state,
        video: next.video,
        publishedAt: next.publishedAt,
      });
    } else {
      heads.delete(winnerId);
    }
  }

  const nextChannelStates = Object.fromEntries(
    channels.map((channel) => [channel.id, getChannelStateSnapshot(channelStates[channel.id])]),
  );

  const nextCursor = hasMoreFeedResults(channelStates, channels)
    ? encodeFeedCursor(nextChannelStates)
    : null;

  return {
    videos,
    nextCursor,
  };
}
