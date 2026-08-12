import { NextResponse } from "next/server";

import {
  createGoogleAuthUrl,
  createOAuthState,
  setGoogleOAuthStateCookie,
} from "@/lib/google-auth";

export async function GET() {
  const state = createOAuthState();
  await setGoogleOAuthStateCookie(state);

  return NextResponse.redirect(createGoogleAuthUrl(state));
}
