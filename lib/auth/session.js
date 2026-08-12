import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";
import { AppError, AppErrorCode } from "@/lib/errors";

export const SESSION_COOKIE_NAME = "sktube_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function getSessionSecret() {
  const { SESSION_SECRET } = getEnv();
  return new TextEncoder().encode(SESSION_SECRET);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function createSessionToken(userId) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token) {
  if (!token) {
    throw new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required.");
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub) {
      throw new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required.");
    }

    return { sub: payload.sub };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required.");
  }
}

export async function setSessionCookie(userId) {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export function readSessionTokenFromRequest(request) {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function readSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function hasValidSession(request) {
  const token = readSessionTokenFromRequest(request);

  if (!token) {
    return false;
  }

  try {
    await verifySessionToken(token);
    return true;
  } catch {
    return false;
  }
}
