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

const SavedChannel =
  mongoose.models.SavedChannel ||
  mongoose.model("SavedChannel", savedChannelSchema);

export default SavedChannel;
