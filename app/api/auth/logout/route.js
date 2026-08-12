import { NextResponse } from "next/server";

import { handleRoute } from "@/lib/api/handle-route-error";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  return handleRoute(async () => {
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  });
}
