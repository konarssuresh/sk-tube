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

describe("fetchOwnedChannelVideo", () => {
  const CHANNEL_ID = "UCBa659QWEk1AI4Tg--mrJ2A";
  const VIDEO_ID = "abcdefghijk";

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

  it("returns playback video details when the video belongs to the channel", async () => {
    const { fetchOwnedChannelVideo } = await import("@/lib/youtube-client");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          createVideoItem({
            id: VIDEO_ID,
            snippet: {
              ...createVideoItem().snippet,
              channelId: CHANNEL_ID,
            },
            status: {
              privacyStatus: "public",
              embeddable: true,
            },
          }),
        ],
      }),
    });

    await expect(
      fetchOwnedChannelVideo({
        youtubeChannelId: CHANNEL_ID,
        videoId: VIDEO_ID,
      }),
    ).resolves.toEqual({
      videoId: VIDEO_ID,
      title: "Eligible Video",
      thumbnailUrl: "https://i.ytimg.com/vi/video-1/hqdefault.jpg",
      duration: "PT2M",
      publishedAt: "2026-01-01T00:00:00.000Z",
      watchUrl: `https://www.youtube.com/watch?v=${VIDEO_ID}`,
      embeddable: true,
      youtubeChannelId: CHANNEL_ID,
      channelTitle: null,
    });
  });

  it("returns embeddable false without rejecting the video", async () => {
    const { fetchOwnedChannelVideo } = await import("@/lib/youtube-client");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          createVideoItem({
            id: VIDEO_ID,
            snippet: {
              ...createVideoItem().snippet,
              channelId: CHANNEL_ID,
            },
            status: {
              privacyStatus: "public",
              embeddable: false,
            },
          }),
        ],
      }),
    });

    const result = await fetchOwnedChannelVideo({
      youtubeChannelId: CHANNEL_ID,
      videoId: VIDEO_ID,
    });

    expect(result.embeddable).toBe(false);
  });

  it("rejects a video that does not belong to the saved channel", async () => {
    const { fetchOwnedChannelVideo } = await import("@/lib/youtube-client");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          createVideoItem({
            id: VIDEO_ID,
            snippet: {
              ...createVideoItem().snippet,
              channelId: "UCotherchannel",
            },
            status: {
              privacyStatus: "public",
              embeddable: true,
            },
          }),
        ],
      }),
    });

    await expect(
      fetchOwnedChannelVideo({
        youtubeChannelId: CHANNEL_ID,
        videoId: VIDEO_ID,
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.NOT_FOUND,
      message: "Video not found.",
    });
  });

  it("rejects ineligible videos", async () => {
    const { fetchOwnedChannelVideo } = await import("@/lib/youtube-client");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          createVideoItem({
            id: VIDEO_ID,
            snippet: {
              ...createVideoItem().snippet,
              channelId: CHANNEL_ID,
            },
            contentDetails: {
              duration: "PT30S",
            },
            status: {
              privacyStatus: "public",
              embeddable: true,
            },
          }),
        ],
      }),
    });

    await expect(
      fetchOwnedChannelVideo({
        youtubeChannelId: CHANNEL_ID,
        videoId: VIDEO_ID,
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.NOT_FOUND,
      message: "Video not found.",
    });
  });
});

describe("discovery search client", () => {
  const DISCOVERY_CHANNEL_ID = "UCdiscoverychannel";

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

  it("maps discovery channel items and hides hidden subscriber counts", async () => {
    const { mapYouTubeDiscoveryChannelItem } = await import(
      "@/lib/youtube-client"
    );

    expect(
      mapYouTubeDiscoveryChannelItem({
        id: DISCOVERY_CHANNEL_ID,
        snippet: {
          title: "Frontend Masters",
          customUrl: "FrontendMasters",
          description: "In-depth web development courses and talks.",
          thumbnails: {
            high: { url: "https://yt3.ggpht.com/discovery" },
          },
        },
        statistics: {
          hiddenSubscriberCount: true,
          subscriberCount: "420000",
          videoCount: "1200",
          viewCount: "28000000",
        },
        contentDetails: {
          relatedPlaylists: {
            uploads: "UUdiscoverychannel",
          },
        },
      }),
    ).toEqual({
      youtubeChannelId: DISCOVERY_CHANNEL_ID,
      title: "Frontend Masters",
      handle: "@FrontendMasters",
      thumbnailUrl: "https://yt3.ggpht.com/discovery",
      description: "In-depth web development courses and talks.",
      subscriberCount: null,
      videoCount: 1200,
      viewCount: 28000000,
      uploadsPlaylistId: "UUdiscoverychannel",
    });
  });

  it("maps search video items with channel titles", async () => {
    const { mapYouTubeSearchVideoItem } = await import("@/lib/youtube-client");

    expect(
      mapYouTubeSearchVideoItem(
        createVideoItem({
          snippet: {
            ...createVideoItem().snippet,
            channelTitle: "Fireship",
          },
        }),
      ),
    ).toMatchObject({
      videoId: "video-1",
      channelTitle: "Fireship",
    });
  });

  it("filters ineligible videos out of search results", async () => {
    const { fetchSearchEligibleVideos } = await import("@/lib/youtube-client");

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            { id: { videoId: "eligible-1" } },
            { id: { videoId: "short-1" } },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            createVideoItem({
              id: "eligible-1",
              snippet: {
                ...createVideoItem().snippet,
                channelTitle: "Fireship",
              },
            }),
            createVideoItem({
              id: "short-1",
              contentDetails: { duration: "PT30S" },
              snippet: {
                ...createVideoItem().snippet,
                channelTitle: "Fireship",
              },
            }),
          ],
        }),
      });

    const result = await fetchSearchEligibleVideos({ query: "react" });

    expect(result.videos).toHaveLength(1);
    expect(result.videos[0].videoId).toBe("eligible-1");
    expect(result.videos[0].channelTitle).toBe("Fireship");
  });

  it("loads eligible search videos without ownership checks", async () => {
    const { fetchSearchVideo } = await import("@/lib/youtube-client");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          createVideoItem({
            id: "search-video-1",
            snippet: {
              ...createVideoItem().snippet,
              channelId: "UCotherchannel",
              channelTitle: "Other Channel",
            },
            status: {
              privacyStatus: "public",
              embeddable: true,
            },
          }),
        ],
      }),
    });

    await expect(fetchSearchVideo("search-video-1")).resolves.toMatchObject({
      videoId: "search-video-1",
      channelTitle: "Other Channel",
      embeddable: true,
    });
  });

  it("rejects ineligible search videos", async () => {
    const { fetchSearchVideo } = await import("@/lib/youtube-client");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          createVideoItem({
            id: "short-video",
            contentDetails: { duration: "PT30S" },
          }),
        ],
      }),
    });

    await expect(fetchSearchVideo("short-video")).rejects.toMatchObject({
      code: AppErrorCode.NOT_FOUND,
      message: "Video not found.",
    });
  });

  it("returns mapped channel search results", async () => {
    const { fetchSearchChannels } = await import("@/lib/youtube-client");

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{ id: { channelId: DISCOVERY_CHANNEL_ID } }],
          nextPageToken: "channel-page-2",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: DISCOVERY_CHANNEL_ID,
              snippet: {
                title: "Frontend Masters",
                customUrl: "FrontendMasters",
                description: "In-depth web development courses.",
                thumbnails: {
                  high: { url: "https://yt3.ggpht.com/discovery" },
                },
              },
              statistics: {
                subscriberCount: "420000",
                videoCount: "1200",
                viewCount: "28000000",
              },
              contentDetails: {
                relatedPlaylists: {
                  uploads: "UUdiscoverychannel",
                },
              },
            },
          ],
        }),
      });

    const result = await fetchSearchChannels({ query: "frontend" });

    expect(result.nextCursor).toBe("channel-page-2");
    expect(result.channels[0]).toMatchObject({
      youtubeChannelId: DISCOVERY_CHANNEL_ID,
      title: "Frontend Masters",
      handle: "@FrontendMasters",
    });
  });
});
