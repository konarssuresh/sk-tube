import { NextResponse } from "next/server";

import { parseVisitStartedAt } from "@/features/feed/schemas";
import { handleRoute } from "@/lib/api/handle-route-error";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { connectDB } from "@/lib/db";
import { AppError, AppErrorCode } from "@/lib/errors";
import User from "@/models/User";

const MAX_VISIT_AGE_MS = 24 * 60 * 60 * 1000;

export async function PATCH(request) {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const body = await request.json();
    const visitStartedAt = parseVisitStartedAt(body?.visitStartedAt);
    const visitDate = new Date(visitStartedAt);
    const now = Date.now();

    if (visitDate.getTime() > now) {
      throw new AppError(AppErrorCode.VALIDATION, "Visit timestamp is invalid.");
    }

    if (now - visitDate.getTime() > MAX_VISIT_AGE_MS) {
      throw new AppError(AppErrorCode.VALIDATION, "Visit timestamp is invalid.");
    }

    await connectDB();

    await User.updateOne(
      { _id: user.id },
      { $set: { feedLastVisitedAt: visitDate } },
    );

    return NextResponse.json({ success: true });
  });
}
