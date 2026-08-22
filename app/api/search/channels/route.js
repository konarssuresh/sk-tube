import { NextResponse } from "next/server";

import { parseSearchCursor, parseSearchQuery } from "@/features/discovery/schemas";
import { handleRoute } from "@/lib/api/handle-route-error";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { connectDB } from "@/lib/db";
import { fetchSearchChannels } from "@/lib/youtube-client";
import SavedChannel from "@/models/SavedChannel";

export async function GET(request) {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(request.url);
    const query = parseSearchQuery(searchParams.get("q"));
    const cursor = parseSearchCursor(searchParams.get("cursor"));

    const { channels, nextCursor } = await fetchSearchChannels({
      query,
      pageToken: cursor,
    });

    if (channels.length === 0) {
      return NextResponse.json({ channels: [], nextCursor });
    }

    await connectDB();

    const youtubeChannelIds = channels.map((channel) => channel.youtubeChannelId);
    const savedChannels = await SavedChannel.find({
      userId: user.id,
      youtubeChannelId: { $in: youtubeChannelIds },
    })
      .select("youtubeChannelId")
      .lean();
    const savedChannelIds = new Set(
      savedChannels.map((channel) => channel.youtubeChannelId),
    );

    const channelsWithSavedState = channels.map((channel) => ({
      ...channel,
      isSaved: savedChannelIds.has(channel.youtubeChannelId),
    }));

    return NextResponse.json({
      channels: channelsWithSavedState,
      nextCursor,
    });
  });
}
