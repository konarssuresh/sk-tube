import { NextResponse } from "next/server";

import { loadOwnedChannel } from "@/features/channels/services/load-owned-channel";
import { parseChannelId } from "@/features/channels/schemas";
import { parseVideoCursor } from "@/features/videos/schemas";
import { handleRoute } from "@/lib/api/handle-route-error";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { fetchEligibleChannelVideos } from "@/lib/youtube-client";

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const { channelId } = await params;
    const parsedChannelId = parseChannelId(channelId);
    const { searchParams } = new URL(request.url);
    const cursor = parseVideoCursor(searchParams.get("cursor"));

    const channel = await loadOwnedChannel(parsedChannelId, user.id);
    const { videos, nextCursor } = await fetchEligibleChannelVideos({
      uploadsPlaylistId: channel.uploadsPlaylistId,
      pageToken: cursor,
    });

    return NextResponse.json({ videos, nextCursor });
  });
}
