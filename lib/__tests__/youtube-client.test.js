import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppErrorCode } from "@/lib/errors";
import { resetEnvCache } from "@/lib/env";

const VALID_ENV = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/sktube",
  SESSION_SECRET: "x".repeat(32),
  YOUTUBE_API_KEY: "youtube-key",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

function setEnv(values) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function createChannelItem(overrides = {}) {
  return {
    id: "UCBa659QWEk1AI4Tg--mrJ2A",
    snippet: {
      title: "Fireship",
      customUrl: "Fireship",
      thumbnails: {
        default: { url: "https://yt3.ggpht.com/default" },
        medium: { url: "https://yt3.ggpht.com/medium" },
        high: { url: "https://yt3.ggpht.com/high" },
      },
    },
    contentDetails: {
      relatedPlaylists: {
        uploads: "UUBa659QWEk1AI4Tg--mrJ2A",
      },
    },
    ...overrides,
  };
}

describe("youtube-client", () => {
  beforeEach(() => {
    setEnv(VALID_ENV);
    resetEnvCache();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    resetEnvCache();
    setEnv({
      MONGODB_URI: undefined,
      SESSION_SECRET: undefined,
      YOUTUBE_API_KEY: undefined,
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      GOOGLE_REDIRECT_URI: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
    });
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("maps YouTube channel items to the safe preview shape", async () => {
    const { mapYouTubeChannelItem } = await import("@/lib/youtube-client");

    expect(mapYouTubeChannelItem(createChannelItem())).toEqual({
      youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
      title: "Fireship",
      handle: "@Fireship",
      thumbnailUrl: "https://yt3.ggpht.com/high",
      uploadsPlaylistId: "UUBa659QWEk1AI4Tg--mrJ2A",
    });
  });

  it("keeps an existing @ prefix on handles", async () => {
    const { mapYouTubeChannelItem } = await import("@/lib/youtube-client");

    expect(
      mapYouTubeChannelItem(
        createChannelItem({
          snippet: {
            ...createChannelItem().snippet,
            customUrl: "@Fireship",
          },
        }),
      ).handle,
    ).toBe("@Fireship");
  });

  it("resolves channels by handle", async () => {
    const { resolveChannelPreview } = await import("@/lib/youtube-client");

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [createChannelItem()] }),
    });

    const preview = await resolveChannelPreview({
      type: "handle",
      value: "@Fireship",
      handle: "@Fireship",
    });

    expect(fetch.mock.calls[0][0]).toContain("forHandle=Fireship");
    expect(preview.title).toBe("Fireship");
  });

  it("resolves channels by canonical channel ID", async () => {
    const { resolveChannelPreview } = await import("@/lib/youtube-client");

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [createChannelItem()] }),
    });

    const preview = await resolveChannelPreview({
      type: "channelUrl",
      value: "https://www.youtube.com/channel/UCBa659QWEk1AI4Tg--mrJ2A",
      youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
    });

    expect(fetch.mock.calls[0][0]).toContain("id=UCBa659QWEk1AI4Tg--mrJ2A");
    expect(preview.youtubeChannelId).toBe("UCBa659QWEk1AI4Tg--mrJ2A");
  });

  it("returns not found when YouTube has no matching channel", async () => {
    const { resolveChannelPreview } = await import("@/lib/youtube-client");

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });

    await expect(
      resolveChannelPreview({
        type: "handle",
        value: "@missing",
        handle: "@missing",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.NOT_FOUND,
      message: "Channel not found.",
    });
  });

  it("returns upstream errors for failed YouTube requests", async () => {
    const { resolveChannelPreview } = await import("@/lib/youtube-client");

    fetch.mockResolvedValue({
      ok: false,
      status: 503,
    });

    await expect(
      resolveChannelPreview({
        type: "handle",
        value: "@Fireship",
        handle: "@Fireship",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.UPSTREAM,
    });
  });

  it("returns upstream errors when uploads playlist data is missing", async () => {
    const { mapYouTubeChannelItem } = await import("@/lib/youtube-client");

    expect(() =>
      mapYouTubeChannelItem(
        createChannelItem({
          contentDetails: {
            relatedPlaylists: {},
          },
        }),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: AppErrorCode.UPSTREAM,
      }),
    );
  });
});

function createVideoItem(overrides = {}) {
  return {
    id: "video-1",
    snippet: {
      title: "Eligible Video",
      publishedAt: "2026-01-01T00:00:00.000Z",
      liveBroadcastContent: "none",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/video-1/hqdefault.jpg" },
      },
    },
    contentDetails: {
      duration: "PT2M",
    },
    status: {
      privacyStatus: "public",
    },
    ...overrides,
  };
}

function createPlaylistItem(videoId) {
  return {
    contentDetails: {
      videoId,
    },
  };
}

describe("youtube-client video feed", () => {
  beforeEach(() => {
    setEnv(VALID_ENV);
    resetEnvCache();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    resetEnvCache();
    setEnv({
      MONGODB_URI: undefined,
      SESSION_SECRET: undefined,
      YOUTUBE_API_KEY: undefined,
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      GOOGLE_REDIRECT_URI: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
    });
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("maps YouTube video items to the safe feed shape", async () => {
    const { mapYouTubeVideoItem } = await import("@/lib/youtube-client");

    expect(mapYouTubeVideoItem(createVideoItem())).toEqual({
      videoId: "video-1",
      title: "Eligible Video",
      thumbnailUrl: "https://i.ytimg.com/vi/video-1/hqdefault.jpg",
      duration: "PT2M",
      publishedAt: "2026-01-01T00:00:00.000Z",
      watchUrl: "https://www.youtube.com/watch?v=video-1",
    });
  });

  it("filters eligible videos and returns a cursor for the next playlist page", async () => {
    const { fetchEligibleChannelVideos } = await import("@/lib/youtube-client");

    const firstPageItems = Array.from({ length: 50 }, (_, index) =>
      createPlaylistItem(`video-${index}`),
    );

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: firstPageItems,
          nextPageToken: "page-2",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: firstPageItems.map((item) =>
            createVideoItem({
              id: item.contentDetails.videoId,
              snippet: {
                ...createVideoItem().snippet,
                title: item.contentDetails.videoId,
              },
            }),
          ),
        }),
      });

    const firstBatch = await fetchEligibleChannelVideos({
      uploadsPlaylistId: "UUplaylist",
    });

    expect(firstBatch.videos).toHaveLength(50);
    expect(firstBatch.nextCursor).toBeTruthy();
    expect(fetch.mock.calls[0][0]).toContain("playlistItems");

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [createPlaylistItem("video-50")],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            createVideoItem({
              id: "video-50",
              snippet: {
                ...createVideoItem().snippet,
                title: "video-50",
              },
            }),
          ],
        }),
      });

    const secondBatch = await fetchEligibleChannelVideos({
      uploadsPlaylistId: "UUplaylist",
      pageToken: firstBatch.nextCursor,
    });

    expect(secondBatch.videos).toHaveLength(1);
    expect(secondBatch.videos[0].videoId).toBe("video-50");
    expect(fetch.mock.calls[2][0]).toContain("pageToken=page-2");
  });

  it("excludes shorts and livestreams from eligible results", async () => {
    const { fetchEligibleChannelVideos } = await import("@/lib/youtube-client");

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            createPlaylistItem("short"),
            createPlaylistItem("live"),
            createPlaylistItem("eligible"),
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            createVideoItem({
              id: "short",
              contentDetails: { duration: "PT30S" },
            }),
            createVideoItem({
              id: "live",
              snippet: {
                ...createVideoItem().snippet,
                liveBroadcastContent: "live",
              },
            }),
            createVideoItem({ id: "eligible" }),
          ],
        }),
      });

    const result = await fetchEligibleChannelVideos({
      uploadsPlaylistId: "UUplaylist",
    });

    expect(result.videos).toHaveLength(1);
    expect(result.videos[0].videoId).toBe("eligible");
    expect(result.nextCursor).toBeNull();
  });

  it("continues through ineligible YouTube pages until 50 eligible videos are collected", async () => {
    const { fetchEligibleChannelVideos } = await import("@/lib/youtube-client");

    const ineligibleItems = Array.from({ length: 50 }, (_, index) =>
      createPlaylistItem(`short-${index}`),
    );
    const eligibleItems = Array.from({ length: 50 }, (_, index) =>
      createPlaylistItem(`eligible-${index}`),
    );

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: ineligibleItems,
          nextPageToken: "page-2",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: ineligibleItems.map((item) =>
            createVideoItem({
              id: item.contentDetails.videoId,
              contentDetails: { duration: "PT30S" },
            }),
          ),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: eligibleItems,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: eligibleItems.map((item) =>
            createVideoItem({
              id: item.contentDetails.videoId,
              snippet: {
                ...createVideoItem().snippet,
                title: item.contentDetails.videoId,
              },
            }),
          ),
        }),
      });

    const result = await fetchEligibleChannelVideos({
      uploadsPlaylistId: "UUplaylist",
    });

    expect(result.videos).toHaveLength(50);
    expect(result.videos[0].videoId).toBe("eligible-0");
    expect(result.videos[49].videoId).toBe("eligible-49");
    expect(result.nextCursor).toBeNull();
    expect(fetch.mock.calls[2][0]).toContain("pageToken=page-2");
  });

  it("maps a missing uploads playlist to an unavailable-channel error", async () => {
    const { fetchEligibleChannelVideos } = await import("@/lib/youtube-client");

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(
      fetchEligibleChannelVideos({
        uploadsPlaylistId: "UUmissing",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.NOT_FOUND,
      message: "This channel is no longer accessible on YouTube.",
    });
  });
});
