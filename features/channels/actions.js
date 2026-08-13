"use server";

import {
  parseAddChannelInput,
  parseChannelId,
  parseChannelPreview,
} from "@/features/channels/schemas";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { connectDB } from "@/lib/db";
import {
  AppError,
  AppErrorCode,
  duplicateKeyAppError,
  isMongoDuplicateKeyError,
} from "@/lib/errors";
import { resolveChannelPreview } from "@/lib/youtube-client";
import SavedChannel, { toSafeChannel } from "@/models/SavedChannel";

const DUPLICATE_CHANNEL_MESSAGE = "This channel is already in your library.";

export async function previewChannel(input) {
  await requireCurrentUser();

  const normalizedInput = parseAddChannelInput(input);
  const preview = await resolveChannelPreview(normalizedInput);

  return { preview };
}

export async function addChannel(preview) {
  const user = await requireCurrentUser();
  const channelPreview = parseChannelPreview(preview);

  await connectDB();

  const existingChannel = await SavedChannel.findOne({
    userId: user.id,
    youtubeChannelId: channelPreview.youtubeChannelId,
  });

  if (existingChannel) {
    throw duplicateKeyAppError(DUPLICATE_CHANNEL_MESSAGE);
  }

  try {
    const created = await SavedChannel.create({
      userId: user.id,
      youtubeChannelId: channelPreview.youtubeChannelId,
      title: channelPreview.title,
      handle: channelPreview.handle,
      thumbnailUrl: channelPreview.thumbnailUrl,
      uploadsPlaylistId: channelPreview.uploadsPlaylistId,
    });

    return { channel: toSafeChannel(created) };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      throw duplicateKeyAppError(DUPLICATE_CHANNEL_MESSAGE);
    }

    throw error;
  }
}

export async function removeChannel(channelId) {
  const user = await requireCurrentUser();
  const id = parseChannelId(channelId);

  await connectDB();

  const result = await SavedChannel.deleteOne({ _id: id, userId: user.id });

  if (result.deletedCount === 0) {
    throw new AppError(AppErrorCode.NOT_FOUND, "Channel not found.");
  }

  return { success: true };
}
