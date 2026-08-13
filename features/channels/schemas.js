import { z } from "zod";

import { fromZodError } from "@/lib/errors";

const HANDLE_PATTERN = /^@[A-Za-z0-9._-]+$/;
const CHANNEL_URL_PATTERN =
  /^https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})$/i;

export const channelInputSchema = z
  .string()
  .trim()
  .min(1, "Enter a YouTube handle or supported channel URL.")
  .superRefine((value, ctx) => {
    if (HANDLE_PATTERN.test(value) || CHANNEL_URL_PATTERN.test(value)) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      message:
        "Use a YouTube handle such as @Fireship or a channel URL such as https://www.youtube.com/channel/UC...",
    });
  });

export const channelIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid channel ID.");

export const channelPreviewSchema = z.object({
  youtubeChannelId: z.string().trim().min(1, "Channel ID is required."),
  title: z.string().trim().min(1, "Channel title is required."),
  handle: z.string().trim().nullable(),
  thumbnailUrl: z.string().url("Channel thumbnail is required."),
  uploadsPlaylistId: z.string().trim().min(1, "Uploads playlist is required."),
});

export const addChannelInputSchema = z.object({
  input: channelInputSchema,
});

export function normalizeChannelInput(input) {
  const result = channelInputSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  const value = result.data;

  if (HANDLE_PATTERN.test(value)) {
    return {
      type: "handle",
      value,
      handle: value,
    };
  }

  const match = value.match(CHANNEL_URL_PATTERN);

  return {
    type: "channelUrl",
    value,
    youtubeChannelId: match[1],
  };
}

export function parseChannelInput(input) {
  return normalizeChannelInput(input);
}

export function parseChannelId(input) {
  const result = channelIdSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseChannelPreview(input) {
  const result = channelPreviewSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseAddChannelInput(input) {
  const result = addChannelInputSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return normalizeChannelInput(result.data.input);
}
