import crypto from "node:crypto";

import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";
import { AppError, AppErrorCode } from "@/lib/errors";
import {
  GoogleAuthErrorCode,
  GoogleAuthErrorMessage,
} from "@/features/auth/google-auth-errors";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
const GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;
const GOOGLE_SCOPES = ["openid", "email", "profile"];

function getGoogleOAuthStateCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
  };
}

export function createGoogleOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    getEnv();

  return new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
  });
}

export function createOAuthState() {
  return crypto.randomUUID();
}

export function createGoogleAuthUrl(state) {
  const client = createGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: "online",
    scope: GOOGLE_SCOPES,
    prompt: "select_account",
    state,
  });
}

export async function setGoogleOAuthStateCookie(state) {
  const cookieStore = await cookies();

  cookieStore.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    state,
    getGoogleOAuthStateCookieOptions(),
  );
}

export async function verifyGoogleOAuthStateCookie(requestState) {
  if (!requestState) {
    return false;
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, "", {
    ...getGoogleOAuthStateCookieOptions(),
    maxAge: 0,
  });

  return Boolean(storedState && storedState === requestState);
}

export async function verifyGoogleAuthCode(code) {
  const client = createGoogleOAuthClient();
  const { GOOGLE_CLIENT_ID } = getEnv();

  try {
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      throw new AppError(
        AppErrorCode.UPSTREAM,
        GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_AUTH_FAILED],
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new AppError(
        AppErrorCode.UPSTREAM,
        GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_AUTH_FAILED],
      );
    }

    if (!payload.email_verified) {
      throw new AppError(
        AppErrorCode.UNAUTHORIZED,
        GoogleAuthErrorMessage[GoogleAuthErrorCode.EMAIL_UNVERIFIED],
      );
    }

    return {
      googleId: payload.sub,
      email: payload.email.trim().toLowerCase(),
      emailVerified: true,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      AppErrorCode.UPSTREAM,
      GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_AUTH_FAILED],
    );
  }
}
