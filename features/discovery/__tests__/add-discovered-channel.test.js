import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppErrorCode } from "@/lib/errors";

const mockRequireCurrentUser = vi.fn();
const mockFindOne = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/auth/require-current-user", () => ({
  requireCurrentUser: (...args) => mockRequireCurrentUser(...args),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => undefined),
}));

vi.mock("@/models/SavedChannel", () => ({
  default: {
    findOne: (...args) => mockFindOne(...args),
    create: (...args) => mockCreate(...args),
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

const discoveryPreview = {
  youtubeChannelId: "UCdiscoverychannel",
  title: "Frontend Masters",
  handle: "@FrontendMasters",
  thumbnailUrl: "https://yt3.ggpht.com/discovery",
  uploadsPlaylistId: "UUdiscoverychannel",
};

describe("add discovered channel", () => {
  beforeEach(() => {
    mockRequireCurrentUser.mockReset();
    mockFindOne.mockReset();
    mockCreate.mockReset();
    mockRequireCurrentUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("adds a discovered channel through the existing action", async () => {
    const { addChannel } = await import("@/features/channels/actions");

    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      _id: "507f1f77bcf86cd799439099",
      ...discoveryPreview,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const result = await addChannel(discoveryPreview);

    expect(mockCreate).toHaveBeenCalledWith({
      userId: "507f1f77bcf86cd799439011",
      ...discoveryPreview,
    });
    expect(result.channel.youtubeChannelId).toBe("UCdiscoverychannel");
  });

  it("rejects duplicate discovered channels", async () => {
    const { addChannel } = await import("@/features/channels/actions");

    mockFindOne.mockResolvedValue({ _id: "507f1f77bcf86cd799439012" });

    await expect(addChannel(discoveryPreview)).rejects.toMatchObject({
      code: AppErrorCode.DUPLICATE,
      message: "This channel is already in your library.",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
