import { NextResponse } from "next/server";

import { parseSearchCursor, parseSearchQuery } from "@/features/discovery/schemas";
import { handleRoute } from "@/lib/api/handle-route-error";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { fetchSearchEligibleVideos } from "@/lib/youtube-client";

export async function GET(request) {
  return handleRoute(async () => {
    await requireCurrentUser();
    const { searchParams } = new URL(request.url);
    const query = parseSearchQuery(searchParams.get("q"));
    const cursor = parseSearchCursor(searchParams.get("cursor"));

    const { videos, nextCursor } = await fetchSearchEligibleVideos({
      query,
      pageToken: cursor,
    });

    return NextResponse.json({ videos, nextCursor });
  });
}
