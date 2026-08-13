import { NextResponse } from "next/server";

import { handleRoute } from "@/lib/api/handle-route-error";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { connectDB } from "@/lib/db";
import SavedChannel, { toSafeChannel } from "@/models/SavedChannel";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireCurrentUser();

    await connectDB();

    const channels = await SavedChannel.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      channels: channels.map(toSafeChannel),
    });
  });
}
