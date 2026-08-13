import { describe, expect, it } from "vitest";

import {
  channelIdSchema,
  channelPreviewSchema,
  normalizeChannelInput,
  parseChannelId,
  parseChannelPreview,
} from "@/features/channels/schemas";
import { AppError, AppErrorCode } from "@/lib/errors";

describe("channel schemas", () => {
  it("accepts YouTube handles", () => {
    expect(normalizeChannelInput("@Fireship")).toEqual({
      type: "handle",
      value: "@Fireship",
      handle: "@Fireship",
    });
  });

  it("accepts supported channel URLs", () => {
    expect(
      normalizeChannelInput(
        "https://www.youtube.com/channel/UCBa659QWEk1AI4Tg--mrJ2A",
      ),
    ).toEqual({
      type: "channelUrl",
      value: "https://www.youtube.com/channel/UCBa659QWEk1AI4Tg--mrJ2A",
      youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
    });
  });

  it("rejects unsupported YouTube URLs", () => {
    const unsupported = [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://www.youtube.com/playlist?list=PL123",
      "https://www.youtube.com/@Fireship",
      "https://youtu.be/dQw4w9WgXcQ",
    ];

    for (const input of unsupported) {
      expect(() => normalizeChannelInput(input)).toThrow(AppError);
    }
  });

  it("rejects empty channel input", () => {
    try {
      normalizeChannelInput("   ");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(AppErrorCode.VALIDATION);
    }
  });

  it("validates saved channel IDs", () => {
    expect(parseChannelId("507f1f77bcf86cd799439011")).toBe(
      "507f1f77bcf86cd799439011",
    );
    expect(channelIdSchema.safeParse("not-an-id").success).toBe(false);
  });

  it("accepts valid channel previews", () => {
    expect(
      parseChannelPreview({
        youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
        title: "Fireship",
        handle: "@Fireship",
        thumbnailUrl: "https://yt3.ggpht.com/high",
        uploadsPlaylistId: "UUBa659QWEk1AI4Tg--mrJ2A",
      }),
    ).toEqual({
      youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
      title: "Fireship",
      handle: "@Fireship",
      thumbnailUrl: "https://yt3.ggpht.com/high",
      uploadsPlaylistId: "UUBa659QWEk1AI4Tg--mrJ2A",
    });
  });

  it("rejects incomplete channel previews", () => {
    expect(
      channelPreviewSchema.safeParse({
        youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
        title: "Fireship",
      }).success,
    ).toBe(false);
  });
});
