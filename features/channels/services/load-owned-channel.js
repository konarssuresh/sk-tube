import { parseChannelId } from "@/features/channels/schemas";
import { connectDB } from "@/lib/db";
import { AppError, AppErrorCode } from "@/lib/errors";
import SavedChannel, { toSafeChannel } from "@/models/SavedChannel";

export async function loadOwnedChannel(channelId, userId) {
  const id = parseChannelId(channelId);

  await connectDB();

  const channel = await SavedChannel.findOne({ _id: id, userId });

  if (!channel) {
    throw new AppError(AppErrorCode.NOT_FOUND, "Channel not found.");
  }

  return toSafeChannel(channel);
}
