import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, AppErrorCode } from "@/lib/errors";

const mockRequireCurrentUser = vi.fn();
const mockFetchMergedFeedVideos = vi.fn();
const mockSavedChannelFind = vi.fn();
const mockUserFindById = vi.fn();

vi.mock("@/lib/auth/require-current-user", () => ({
  requireCurrentUser: (...args) => mockRequireCurrentUser(...args),
}));

vi.mock("@/lib/youtube-feed", () => ({
  fetchMergedFeedVideos: (...args) => mockFetchMergedFeedVideos(...args),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/SavedChannel", () => ({
  default: {
    find: (...args) => mockSavedChannelFind(...args),
  },
  toSafeChannel: (channel) => ({
    id: String(channel._id),
    youtubeChannelId: channel.youtubeChannelId,
    title: channel.title,
    handle: channel.handle,
    thumbnailUrl: channel.thumbnailUrl,
    uploadsPlaylistId: channel.uploadsPlaylistId,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
  }),
}));

vi.mock("@/models/User", () => ({
  default: {
    findById: (...args) => mockUserFindById(...args),
  },
}));

const feedVideos = [
  {
    videoId: "video-1",
    title: "Home Video",
    thumbnailUrl: "https://i.ytimg.com/vi/video-1/hqdefault.jpg",
    duration: "PT12M",
    publishedAt: "2026-01-02T00:00:00.000Z",
    watchUrl: "https://www.youtube.com/watch?v=video-1",
    channelId: "507f1f77bcf86cd799439012",
    channelTitle: "Fireship",
  },
];

describe("GET /api/feed/videos", () => {
  beforeEach(() => {
    mockRequireCurrentUser.mockReset();
    mockFetchMergedFeedVideos.mockReset();
    mockSavedChannelFind.mockReset();
    mockUserFindById.mockReset();

    mockRequireCurrentUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
    });
    mockUserFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          feedLastVisitedAt: new Date("2026-01-01T00:00:00.000Z"),
        }),
      }),
    });
    mockSavedChannelFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: "507f1f77bcf86cd799439012",
            youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
            title: "Fireship",
            handle: "@Fireship",
            thumbnailUrl: "https://example.com/thumb.jpg",
            uploadsPlaylistId: "UUBa659QWEk1AI4Tg--mrJ2A",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]),
      }),
    });
    mockFetchMergedFeedVideos.mockResolvedValue({
      videos: feedVideos,
      nextCursor: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    const { GET } = await import("@/app/api/feed/videos/route");

    mockRequireCurrentUser.mockRejectedValue(
      new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required."),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/feed/videos"),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe(AppErrorCode.UNAUTHORIZED);
  });

  it("returns merged videos and feedLastVisitedAt", async () => {
    const { GET } = await import("@/app/api/feed/videos/route");

    const response = await GET(
      new Request("http://localhost:3000/api/feed/videos"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.videos).toEqual(feedVideos);
    expect(payload.feedLastVisitedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(mockFetchMergedFeedVideos).toHaveBeenCalled();
  });
});
