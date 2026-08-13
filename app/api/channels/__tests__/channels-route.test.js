import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, AppErrorCode } from "@/lib/errors";

const mockRequireCurrentUser = vi.fn();

vi.mock("@/lib/auth/require-current-user", () => ({
  requireCurrentUser: (...args) => mockRequireCurrentUser(...args),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => undefined),
}));

const mockFind = vi.fn();

vi.mock("@/models/SavedChannel", () => ({
  default: {
    find: (...args) => mockFind(...args),
  },
  toSafeChannel: (channel) => ({
    id: String(channel._id ?? channel.id),
    youtubeChannelId: channel.youtubeChannelId,
    title: channel.title,
    handle: channel.handle ?? null,
    thumbnailUrl: channel.thumbnailUrl,
    uploadsPlaylistId: channel.uploadsPlaylistId,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
  }),
}));

describe("GET /api/channels", () => {
  beforeEach(() => {
    mockRequireCurrentUser.mockReset();
    mockFind.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    const { GET } = await import("@/app/api/channels/route");

    mockRequireCurrentUser.mockRejectedValue(
      new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required."),
    );

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe(AppErrorCode.UNAUTHORIZED);
    expect(mockFind).not.toHaveBeenCalled();
  });

  it("returns the authenticated user's channels ordered newest first", async () => {
    const { GET } = await import("@/app/api/channels/route");

    mockRequireCurrentUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      name: "Suresh Konar",
      email: "user@example.com",
    });

    const channels = [
      {
        _id: "507f1f77bcf86cd799439012",
        youtubeChannelId: "UCnewest",
        title: "Newest Channel",
        handle: "@newest",
        thumbnailUrl: "https://yt3.ggpht.com/newest",
        uploadsPlaylistId: "UUnewest",
        createdAt: new Date("2026-02-02T00:00:00.000Z"),
        updatedAt: new Date("2026-02-02T00:00:00.000Z"),
      },
      {
        _id: "507f1f77bcf86cd799439013",
        youtubeChannelId: "UColder",
        title: "Older Channel",
        handle: null,
        thumbnailUrl: "https://yt3.ggpht.com/older",
        uploadsPlaylistId: "UUolder",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ];

    const mockLean = vi.fn().mockResolvedValue(channels);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    mockFind.mockReturnValue({ sort: mockSort });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({
      userId: "507f1f77bcf86cd799439011",
    });
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(payload.channels).toEqual([
      {
        id: "507f1f77bcf86cd799439012",
        youtubeChannelId: "UCnewest",
        title: "Newest Channel",
        handle: "@newest",
        thumbnailUrl: "https://yt3.ggpht.com/newest",
        uploadsPlaylistId: "UUnewest",
        createdAt: "2026-02-02T00:00:00.000Z",
        updatedAt: "2026-02-02T00:00:00.000Z",
      },
      {
        id: "507f1f77bcf86cd799439013",
        youtubeChannelId: "UColder",
        title: "Older Channel",
        handle: null,
        thumbnailUrl: "https://yt3.ggpht.com/older",
        uploadsPlaylistId: "UUolder",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });
});
