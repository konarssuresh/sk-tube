import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, AppErrorCode } from "@/lib/errors";

const mockRequireCurrentUser = vi.fn();
const mockLoadOwnedChannel = vi.fn();
const mockFetchEligibleChannelVideos = vi.fn();

vi.mock("@/lib/auth/require-current-user", () => ({
  requireCurrentUser: (...args) => mockRequireCurrentUser(...args),
}));

vi.mock("@/features/channels/services/load-owned-channel", () => ({
  loadOwnedChannel: (...args) => mockLoadOwnedChannel(...args),
}));

vi.mock("@/lib/youtube-client", () => ({
  fetchEligibleChannelVideos: (...args) =>
    mockFetchEligibleChannelVideos(...args),
}));

const channel = {
  id: "507f1f77bcf86cd799439012",
  youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
  title: "Fireship",
  handle: "@Fireship",
  thumbnailUrl: "https://yt3.ggpht.com/high",
  uploadsPlaylistId: "UUBa659QWEk1AI4Tg--mrJ2A",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const videos = [
  {
    videoId: "video-1",
    title: "Eligible Video",
    thumbnailUrl: "https://i.ytimg.com/vi/video-1/hqdefault.jpg",
    duration: "PT2M",
    publishedAt: "2026-01-01T00:00:00.000Z",
    watchUrl: "https://www.youtube.com/watch?v=video-1",
  },
];

describe("GET /api/channels/[channelId]/videos", () => {
  beforeEach(() => {
    mockRequireCurrentUser.mockReset();
    mockLoadOwnedChannel.mockReset();
    mockFetchEligibleChannelVideos.mockReset();
    mockRequireCurrentUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    const { GET } = await import(
      "@/app/api/channels/[channelId]/videos/route"
    );

    mockRequireCurrentUser.mockRejectedValue(
      new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required."),
    );

    const response = await GET(
      new Request(
        "http://localhost:3000/api/channels/507f1f77bcf86cd799439012/videos",
      ),
      { params: Promise.resolve({ channelId: "507f1f77bcf86cd799439012" }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe(AppErrorCode.UNAUTHORIZED);
    expect(mockLoadOwnedChannel).not.toHaveBeenCalled();
  });

  it("returns 404 for missing or unowned channels", async () => {
    const { GET } = await import(
      "@/app/api/channels/[channelId]/videos/route"
    );

    mockLoadOwnedChannel.mockRejectedValue(
      new AppError(AppErrorCode.NOT_FOUND, "Channel not found."),
    );

    const response = await GET(
      new Request(
        "http://localhost:3000/api/channels/507f1f77bcf86cd799439012/videos",
      ),
      { params: Promise.resolve({ channelId: "507f1f77bcf86cd799439012" }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.message).toBe("Channel not found.");
  });

  it("returns mapped videos and nextCursor for an owned channel", async () => {
    const { GET } = await import(
      "@/app/api/channels/[channelId]/videos/route"
    );

    mockLoadOwnedChannel.mockResolvedValue(channel);
    mockFetchEligibleChannelVideos.mockResolvedValue({
      videos,
      nextCursor: "next-page",
    });

    const response = await GET(
      new Request(
        "http://localhost:3000/api/channels/507f1f77bcf86cd799439012/videos",
      ),
      { params: Promise.resolve({ channelId: "507f1f77bcf86cd799439012" }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockLoadOwnedChannel).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011",
    );
    expect(mockFetchEligibleChannelVideos).toHaveBeenCalledWith({
      uploadsPlaylistId: channel.uploadsPlaylistId,
      pageToken: undefined,
    });
    expect(payload).toEqual({
      videos,
      nextCursor: "next-page",
    });
  });

  it("passes the cursor query param through to the YouTube client", async () => {
    const { GET } = await import(
      "@/app/api/channels/[channelId]/videos/route"
    );

    mockLoadOwnedChannel.mockResolvedValue(channel);
    mockFetchEligibleChannelVideos.mockResolvedValue({
      videos,
      nextCursor: null,
    });

    await GET(
      new Request(
        "http://localhost:3000/api/channels/507f1f77bcf86cd799439012/videos?cursor=next-page",
      ),
      { params: Promise.resolve({ channelId: "507f1f77bcf86cd799439012" }) },
    );

    expect(mockFetchEligibleChannelVideos).toHaveBeenCalledWith({
      uploadsPlaylistId: channel.uploadsPlaylistId,
      pageToken: "next-page",
    });
  });

  it("rejects invalid channel IDs and blank cursors", async () => {
    const { GET } = await import(
      "@/app/api/channels/[channelId]/videos/route"
    );

    const invalidChannelResponse = await GET(
      new Request(
        "http://localhost:3000/api/channels/not-an-id/videos",
      ),
      { params: Promise.resolve({ channelId: "not-an-id" }) },
    );
    const blankCursorResponse = await GET(
      new Request(
        "http://localhost:3000/api/channels/507f1f77bcf86cd799439012/videos?cursor=%20%20",
      ),
      { params: Promise.resolve({ channelId: "507f1f77bcf86cd799439012" }) },
    );

    expect(invalidChannelResponse.status).toBe(400);
    expect(blankCursorResponse.status).toBe(400);
    expect(mockLoadOwnedChannel).not.toHaveBeenCalled();
  });
});
