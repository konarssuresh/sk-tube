import { afterEach, describe, expect, it } from "vitest";

import { getEnv, getSessionEnv, resetEnvCache } from "@/lib/env";

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

describe("getEnv", () => {
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

  it("returns validated environment variables", () => {
    setEnv(VALID_ENV);

    expect(getEnv()).toEqual(VALID_ENV);
  });

  it("throws a clear error when required variables are missing", () => {
    setEnv({
      ...VALID_ENV,
      SESSION_SECRET: "short",
      YOUTUBE_API_KEY: undefined,
    });

    expect(() => getEnv()).toThrowError(
      /Invalid environment configuration/,
    );
    expect(() => getEnv()).toThrowError(/SESSION_SECRET/);
    expect(() => getEnv()).toThrowError(/YOUTUBE_API_KEY/);
  });
});

describe("getSessionEnv", () => {
  afterEach(() => {
    resetEnvCache();
    setEnv({
      SESSION_SECRET: undefined,
      YOUTUBE_API_KEY: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
    });
  });

  it("returns validated session environment variables", () => {
    setEnv({ SESSION_SECRET: "x".repeat(32) });

    expect(getSessionEnv()).toEqual({
      SESSION_SECRET: "x".repeat(32),
    });
  });

  it("throws a clear error when SESSION_SECRET is missing or too short", () => {
    setEnv({ SESSION_SECRET: "short" });

    expect(() => getSessionEnv()).toThrowError(
      /Invalid environment configuration/,
    );
    expect(() => getSessionEnv()).toThrowError(/SESSION_SECRET/);
  });

  it("does not require unrelated server secrets", () => {
    setEnv({ SESSION_SECRET: "x".repeat(32) });

    expect(() => getSessionEnv()).not.toThrow();
  });
});
