import { NextResponse } from "next/server";

import { authenticateWithGoogle } from "@/features/auth/services/authenticate-with-google";
import {
  GoogleAuthErrorCode,
  mapErrorToGoogleAuthCode,
} from "@/features/auth/google-auth-errors";
import { setSessionCookie } from "@/lib/auth/session";
import {
  verifyGoogleAuthCode,
  verifyGoogleOAuthStateCookie,
} from "@/lib/google-auth";

function redirectToLogin(request, errorCode) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", errorCode);
  return NextResponse.redirect(url);
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const oauthError = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (oauthError || !code) {
    return redirectToLogin(request, GoogleAuthErrorCode.GOOGLE_AUTH_FAILED);
  }

  const stateIsValid = await verifyGoogleOAuthStateCookie(state);

  if (!stateIsValid) {
    return redirectToLogin(request, GoogleAuthErrorCode.GOOGLE_AUTH_FAILED);
  }

  try {
    const profile = await verifyGoogleAuthCode(code);
    const user = await authenticateWithGoogle(profile);

    await setSessionCookie(String(user._id));

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    return redirectToLogin(request, mapErrorToGoogleAuthCode(error));
  }
}
