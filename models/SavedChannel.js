import mongoose from "mongoose";

const savedChannelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    youtubeChannelId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
    },
    uploadsPlaylistId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

savedChannelSchema.index({ userId: 1, youtubeChannelId: 1 }, { unique: true });
savedChannelSchema.index({ userId: 1, createdAt: -1 });

export function toSafeChannel(channel) {
  if (!channel) {
    return null;
  }

  const plainChannel =
    typeof channel.toObject === "function" ? channel.toObject() : { ...channel };

  return {
    id: String(plainChannel._id ?? plainChannel.id),
    youtubeChannelId: plainChannel.youtubeChannelId,
    title: plainChannel.title,
    handle: plainChannel.handle ?? null,
    thumbnailUrl: plainChannel.thumbnailUrl,
    uploadsPlaylistId: plainChannel.uploadsPlaylistId,
    createdAt: plainChannel.createdAt,
    updatedAt: plainChannel.updatedAt,
  };
}

const SavedChannel =
  mongoose.models.SavedChannel ||
  mongoose.model("SavedChannel", savedChannelSchema);

export default SavedChannel;
