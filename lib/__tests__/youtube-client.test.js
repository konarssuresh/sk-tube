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
