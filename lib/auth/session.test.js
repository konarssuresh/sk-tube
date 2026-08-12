import { afterEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";

import { resetEnvCache } from "@/lib/env";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";

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

describe("session", () => {
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
  });

  it("creates and verifies a session token with the user id as sub", async () => {
    setEnv(VALID_ENV);

    const token = await createSessionToken("507f1f77bcf86cd799439011");
    const payload = await verifySessionToken(token);

    expect(payload.sub).toBe("507f1f77bcf86cd799439011");
  });

  it("rejects tampered tokens", async () => {
    setEnv(VALID_ENV);

    const token = await createSessionToken("507f1f77bcf86cd799439011");
    const tamperedToken = `${token.slice(0, -1)}x`;

    await expect(verifySessionToken(tamperedToken)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects tokens signed with a different secret", async () => {
    setEnv(VALID_ENV);

    const token = await createSessionToken("507f1f77bcf86cd799439011");

    setEnv({
      ...VALID_ENV,
      SESSION_SECRET: "y".repeat(32),
    });
    resetEnvCache();

    await expect(verifySessionToken(token)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects missing tokens", async () => {
    setEnv(VALID_ENV);

    await expect(verifySessionToken(null)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects expired tokens", async () => {
    setEnv(VALID_ENV);

    const secret = new TextEncoder().encode(VALID_ENV.SESSION_SECRET);
    const expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("507f1f77bcf86cd799439011")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret);

    await expect(verifySessionToken(expiredToken)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("exports the expected session cookie name", () => {
    expect(SESSION_COOKIE_NAME).toBe("sktube_session");
  });
});
