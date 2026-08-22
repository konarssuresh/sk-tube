import { NextResponse } from "next/server";

import {
  parseFeedChannelIds,
  parseFeedCursor,
  parseMaxDurationSeconds,
  parseMinDurationSeconds,
  parsePublishedAfter,
} from "@/features/feed/schemas";
import { handleRoute } from "@/lib/api/handle-route-error";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { connectDB } from "@/lib/db";
import { fetchMergedFeedVideos } from "@/lib/youtube-feed";
import SavedChannel, { toSafeChannel } from "@/models/SavedChannel";
import User from "@/models/User";

export async function GET(request) {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(request.url);
    const cursor = parseFeedCursor(searchParams.get("cursor"));
    const channelIds = parseFeedChannelIds(searchParams.get("channelIds"));
    const publishedAfter = parsePublishedAfter(searchParams.get("publishedAfter"));
    const minDurationSeconds = parseMinDurationSeconds(
      searchParams.get("minDurationSeconds"),
    );
    const maxDurationSeconds = parseMaxDurationSeconds(
      searchParams.get("maxDurationSeconds"),
    );

    await connectDB();

    const userRecord = await User.findById(user.id)
      .select("feedLastVisitedAt")
      .lean();

    const savedChannels = await SavedChannel.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    let selectedChannels = savedChannels.map((channel) => toSafeChannel(channel));

    if (channelIds?.length) {
      const allowedIds = new Set(selectedChannels.map((channel) => channel.id));
      const invalidId = channelIds.find((id) => !allowedIds.has(id));

      if (invalidId) {
        const { AppError, AppErrorCode } = await import("@/lib/errors");
        throw new AppError(AppErrorCode.VALIDATION, "Invalid channel filter.");
      }

      const selectedSet = new Set(channelIds);
      selectedChannels = selectedChannels.filter((channel) =>
        selectedSet.has(channel.id),
      );
    }

    if (selectedChannels.length === 0) {
      return NextResponse.json({
        videos: [],
        nextCursor: null,
        feedLastVisitedAt: userRecord?.feedLastVisitedAt?.toISOString() ?? null,
      });
    }

    const feedChannels = selectedChannels.map((channel) => ({
      id: channel.id,
      title: channel.title,
      uploadsPlaylistId: channel.uploadsPlaylistId,
    }));

    const { videos, nextCursor } = await fetchMergedFeedVideos({
      channels: feedChannels,
      filters: {
        publishedAfter,
        minDurationSeconds,
        maxDurationSeconds,
      },
      cursor,
    });

    return NextResponse.json({
      videos,
      nextCursor,
      feedLastVisitedAt: userRecord?.feedLastVisitedAt?.toISOString() ?? null,
    });
  });
}
