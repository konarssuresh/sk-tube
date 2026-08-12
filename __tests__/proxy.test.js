import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";

import { resetEnvCache } from "@/lib/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const VALID_ENV = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/sktube",
  SESSION_SECRET: "x".repeat(32),
  YOUTUBE_API_KEY: "youtube-key",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

function setEnv(values) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function createRequest(pathname, cookieValue) {
  const request = new NextRequest(`http://localhost:3000${pathname}`);

  if (cookieValue !== undefined) {
    request.cookies.set(SESSION_COOKIE_NAME, cookieValue);
  }

  return request;
}

describe("proxy", () => {
  beforeEach(() => {
    setEnv(VALID_ENV);
    resetEnvCache();
  });

  afterEach(() => {
    resetEnvCache();
    setEnv({
      MONGODB_URI: undefined,
      SESSION_SECRET: undefined,
      YOUTUBE_API_KEY: undefined,
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      GOOGLE_REDIRECT_URI: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
    });
    vi.resetModules();
  });

  it("redirects unauthenticated users away from protected pages", async () => {
    const { proxy } = await import("@/proxy");

    const response = await proxy(createRequest("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects authenticated users away from login and register", async () => {
    const { proxy } = await import("@/proxy");
    const { createSessionToken } = await import("@/lib/auth/session");
    const token = await createSessionToken("507f1f77bcf86cd799439011");

    const loginResponse = await proxy(createRequest("/login", token));
    const registerResponse = await proxy(createRequest("/register", token));

    expect(loginResponse.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
    expect(registerResponse.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
  });

  it("treats invalid session cookies as unauthenticated", async () => {
    const { proxy } = await import("@/proxy");

    const response = await proxy(createRequest("/dashboard", "invalid-token"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("treats expired session cookies as unauthenticated", async () => {
    const { proxy } = await import("@/proxy");
    const secret = new TextEncoder().encode(VALID_ENV.SESSION_SECRET);
    const expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("507f1f77bcf86cd799439011")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret);

    const response = await proxy(createRequest("/dashboard", expiredToken));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });
});
