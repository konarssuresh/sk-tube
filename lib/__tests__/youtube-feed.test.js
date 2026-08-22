import { describe, expect, it, vi } from "vitest";

import {
  decodeFeedCursor,
  encodeFeedCursor,
  fetchMergedFeedVideos,
} from "@/lib/youtube-feed";

vi.mock("@/lib/youtube-client", () => ({
  fetchPlaylistItems: vi.fn(),
  fetchVideoDetails: vi.fn(),
  mapYouTubeVideoItem: vi.fn((video) => ({
    videoId: video.id,
    title: video.snippet.title,
    thumbnailUrl: "https://example.com/thumb.jpg",
    duration: video.contentDetails.duration,
    publishedAt: video.snippet.publishedAt,
    watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
  })),
}));

const { fetchPlaylistItems, fetchVideoDetails } = await import(
  "@/lib/youtube-client"
);

function video(id, publishedAt, duration = "PT12M") {
  return {
    id,
    snippet: {
      title: `Video ${id}`,
      publishedAt,
      channelTitle: "Channel",
      thumbnails: { high: { url: "https://example.com/thumb.jpg" } },
      liveBroadcastContent: "none",
    },
    contentDetails: { duration },
    status: { privacyStatus: "public" },
  };
}

describe("youtube-feed merge", () => {
  it("encodes and decodes feed cursors", () => {
    const cursor = encodeFeedCursor({
      ch1: { pageToken: "page-2", startIndex: 3, exhausted: false },
    });

    expect(decodeFeedCursor(cursor)).toEqual({
      ch1: { pageToken: "page-2", startIndex: 3, exhausted: false },
    });
  });

  it("merges videos across channels by published date", async () => {
    fetchPlaylistItems.mockImplementation(async (playlistId) => {
      if (playlistId === "PL-A") {
        return {
          items: [{ contentDetails: { videoId: "a-new" } }],
        };
      }

      return {
        items: [{ contentDetails: { videoId: "b-newest" } }],
      };
    });

    fetchVideoDetails.mockImplementation(async (ids) =>
      ids.map((id) => {
        if (id === "a-new") {
          return video(id, "2026-01-10T10:00:00.000Z");
        }

        return video(id, "2026-01-11T12:00:00.000Z");
      }),
    );

    const { videos } = await fetchMergedFeedVideos({
      channels: [
        { id: "ch-a", title: "A", uploadsPlaylistId: "PL-A" },
        { id: "ch-b", title: "B", uploadsPlaylistId: "PL-B" },
      ],
      filters: {},
      cursor: undefined,
    });

    expect(videos.map((item) => item.videoId)).toEqual(["b-newest", "a-new"]);
    expect(videos[0].channelId).toBe("ch-b");
    expect(videos[1].channelTitle).toBe("A");
  });
});
