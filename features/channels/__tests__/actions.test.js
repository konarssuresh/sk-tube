import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, AppErrorCode } from "@/lib/errors";

const mockRequireCurrentUser = vi.fn();
const mockDeleteOne = vi.fn();
const mockFindOne = vi.fn();
const mockCreate = vi.fn();
const mockResolveChannelPreview = vi.fn();

vi.mock("@/lib/auth/require-current-user", () => ({
  requireCurrentUser: (...args) => mockRequireCurrentUser(...args),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => undefined),
}));

vi.mock("@/lib/youtube-client", () => ({
  resolveChannelPreview: (...args) => mockResolveChannelPreview(...args),
}));

vi.mock("@/models/SavedChannel", () => ({
  default: {
    deleteOne: (...args) => mockDeleteOne(...args),
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

const preview = {
  youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
  title: "Fireship",
  handle: "@Fireship",
  thumbnailUrl: "https://yt3.ggpht.com/high",
  uploadsPlaylistId: "UUBa659QWEk1AI4Tg--mrJ2A",
};

describe("channel actions", () => {
  beforeEach(() => {
    mockRequireCurrentUser.mockReset();
    mockDeleteOne.mockReset();
    mockFindOne.mockReset();
    mockCreate.mockReset();
    mockResolveChannelPreview.mockReset();
    mockRequireCurrentUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("previewChannel", () => {
    it("rejects unauthenticated calls", async () => {
      const { previewChannel } = await import("@/features/channels/actions");

      mockRequireCurrentUser.mockRejectedValue(
        new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required."),
      );

      await expect(
        previewChannel({ input: "@Fireship" }),
      ).rejects.toMatchObject({
        code: AppErrorCode.UNAUTHORIZED,
      });
      expect(mockResolveChannelPreview).not.toHaveBeenCalled();
    });

    it("rejects invalid input", async () => {
      const { previewChannel } = await import("@/features/channels/actions");

      await expect(
        previewChannel({ input: "https://www.youtube.com/watch?v=test" }),
      ).rejects.toMatchObject({
        code: AppErrorCode.VALIDATION,
      });
      expect(mockResolveChannelPreview).not.toHaveBeenCalled();
    });

    it("returns a mapped preview", async () => {
      const { previewChannel } = await import("@/features/channels/actions");

      mockResolveChannelPreview.mockResolvedValue(preview);

      const result = await previewChannel({ input: "@Fireship" });

      expect(mockResolveChannelPreview).toHaveBeenCalledWith({
        type: "handle",
        value: "@Fireship",
        handle: "@Fireship",
      });
      expect(result).toEqual({ preview });
    });
  });

  describe("addChannel", () => {
    it("rejects duplicate channels before insert", async () => {
      const { addChannel } = await import("@/features/channels/actions");

      mockFindOne.mockResolvedValue({ _id: "507f1f77bcf86cd799439012" });

      await expect(addChannel(preview)).rejects.toMatchObject({
        code: AppErrorCode.DUPLICATE,
        message: "This channel is already in your library.",
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("creates a saved channel and returns the safe shape", async () => {
      const { addChannel } = await import("@/features/channels/actions");

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        _id: "507f1f77bcf86cd799439012",
        userId: "507f1f77bcf86cd799439011",
        ...preview,
        createdAt: new Date("2026-02-02T00:00:00.000Z"),
        updatedAt: new Date("2026-02-02T00:00:00.000Z"),
      });

      const result = await addChannel(preview);

      expect(mockCreate).toHaveBeenCalledWith({
        userId: "507f1f77bcf86cd799439011",
        ...preview,
      });
      expect(result.channel).toEqual({
        id: "507f1f77bcf86cd799439012",
        ...preview,
        createdAt: new Date("2026-02-02T00:00:00.000Z"),
        updatedAt: new Date("2026-02-02T00:00:00.000Z"),
      });
    });

    it("maps Mongo duplicate key errors to duplicate app errors", async () => {
      const { addChannel } = await import("@/features/channels/actions");

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockRejectedValue({
        name: "MongoServerError",
        code: 11000,
      });

      await expect(addChannel(preview)).rejects.toMatchObject({
        code: AppErrorCode.DUPLICATE,
        message: "This channel is already in your library.",
      });
    });
  });

  describe("removeChannel", () => {
    it("rejects unauthenticated calls", async () => {
      const { removeChannel } = await import("@/features/channels/actions");

      mockRequireCurrentUser.mockRejectedValue(
        new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required."),
      );

      await expect(removeChannel("507f1f77bcf86cd799439012")).rejects.toMatchObject({
        code: AppErrorCode.UNAUTHORIZED,
      });
      expect(mockDeleteOne).not.toHaveBeenCalled();
    });

    it("rejects invalid channel IDs", async () => {
      const { removeChannel } = await import("@/features/channels/actions");

      await expect(removeChannel("not-an-object-id")).rejects.toMatchObject({
        code: AppErrorCode.VALIDATION,
      });
      expect(mockDeleteOne).not.toHaveBeenCalled();
    });

    it("removes a channel owned by the current user", async () => {
      const { removeChannel } = await import("@/features/channels/actions");

      mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await removeChannel("507f1f77bcf86cd799439012");

      expect(result).toEqual({ success: true });
      expect(mockDeleteOne).toHaveBeenCalledWith({
        _id: "507f1f77bcf86cd799439012",
        userId: "507f1f77bcf86cd799439011",
      });
    });

    it("returns not found when the channel is missing or belongs to another user", async () => {
      const { removeChannel } = await import("@/features/channels/actions");

      mockDeleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(removeChannel("507f1f77bcf86cd799439012")).rejects.toMatchObject({
        code: AppErrorCode.NOT_FOUND,
        message: "Channel not found.",
      });
    });
  });
});
