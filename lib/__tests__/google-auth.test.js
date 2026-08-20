import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetEnvCache } from "@/lib/env";
import { GoogleAuthErrorCode } from "@/features/auth/google-auth-errors";

const VALID_ENV = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/sktube",
  SESSION_SECRET: "x".repeat(32),
  YOUTUBE_API_KEY: "youtube-key",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

const googleAuthMocks = vi.hoisted(() => ({
  generateAuthUrl: vi.fn(),
  getToken: vi.fn(),
  verifyIdToken: vi.fn(),
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class OAuth2Client {
    generateAuthUrl(...args) {
      return googleAuthMocks.generateAuthUrl(...args);
    }

    getToken(...args) {
      return googleAuthMocks.getToken(...args);
    }

    verifyIdToken(...args) {
      return googleAuthMocks.verifyIdToken(...args);
    }
  },
}));

function setEnv(values) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("google-auth", () => {
  beforeEach(() => {
    setEnv(VALID_ENV);
    resetEnvCache();
    googleAuthMocks.generateAuthUrl.mockReset();
    googleAuthMocks.getToken.mockReset();
    googleAuthMocks.verifyIdToken.mockReset();
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
    vi.clearAllMocks();
  });

  it("creates a Google auth URL with the provided state", async () => {
    const { createGoogleAuthUrl } = await import("@/lib/google-auth");

    googleAuthMocks.generateAuthUrl.mockReturnValue("https://accounts.google.com/o/oauth2");

    expect(createGoogleAuthUrl("state-123")).toBe(
      "https://accounts.google.com/o/oauth2",
    );
    expect(googleAuthMocks.generateAuthUrl).toHaveBeenCalledWith({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
      state: "state-123",
    });
  });

  it("verifies an auth code and returns a normalized profile", async () => {
    const { verifyGoogleAuthCode } = await import("@/lib/google-auth");

    googleAuthMocks.getToken.mockResolvedValue({ tokens: { id_token: "id-token" } });
    googleAuthMocks.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-subject-123",
        email: "User@Example.com",
        given_name: "Suresh",
      }),
    });

    await expect(verifyGoogleAuthCode("auth-code")).resolves.toEqual({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh",
    });
  });

  it("falls back to the full name when given_name is missing", async () => {
    const { verifyGoogleAuthCode } = await import("@/lib/google-auth");

    googleAuthMocks.getToken.mockResolvedValue({ tokens: { id_token: "id-token" } });
    googleAuthMocks.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-subject-123",
        email: "user@example.com",
        name: "Suresh Konar",
      }),
    });

    await expect(verifyGoogleAuthCode("auth-code")).resolves.toEqual({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh Konar",
    });
  });

  it("does not reject profiles solely because email_verified is false", async () => {
    const { verifyGoogleAuthCode } = await import("@/lib/google-auth");

    googleAuthMocks.getToken.mockResolvedValue({ tokens: { id_token: "id-token" } });
    googleAuthMocks.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-subject-123",
        email: "user@example.com",
        given_name: "Suresh",
        email_verified: false,
      }),
    });

    await expect(verifyGoogleAuthCode("auth-code")).resolves.toEqual({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh",
    });
  });

  it("rejects auth codes without an ID token", async () => {
    const { verifyGoogleAuthCode } = await import("@/lib/google-auth");
    const { GoogleAuthErrorMessage } = await import(
      "@/features/auth/google-auth-errors"
    );

    googleAuthMocks.getToken.mockResolvedValue({ tokens: {} });

    await expect(verifyGoogleAuthCode("auth-code")).rejects.toMatchObject({
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_AUTH_FAILED],
    });
  });

  it("rejects profiles without a usable name", async () => {
    const { verifyGoogleAuthCode } = await import("@/lib/google-auth");
    const { GoogleAuthErrorMessage } = await import(
      "@/features/auth/google-auth-errors"
    );

    googleAuthMocks.getToken.mockResolvedValue({ tokens: { id_token: "id-token" } });
    googleAuthMocks.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-subject-123",
        email: "user@example.com",
      }),
    });

    await expect(verifyGoogleAuthCode("auth-code")).rejects.toMatchObject({
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_AUTH_FAILED],
    });
  });
});
