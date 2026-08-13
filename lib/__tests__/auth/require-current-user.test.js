import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppErrorCode } from "@/lib/errors";
import { resetEnvCache } from "@/lib/env";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth/session";

const VALID_ENV = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/sktube",
  SESSION_SECRET: "x".repeat(32),
  YOUTUBE_API_KEY: "youtube-key",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => undefined),
}));

const mockFindById = vi.fn();

vi.mock("@/models/User", () => ({
  default: {
    findById: (...args) => mockFindById(...args),
  },
  toSafeUser: (user) => ({
    id: String(user._id ?? user.id),
    name: user.name,
    email: user.email,
    googleId: user.googleId ?? null,
    googleLinkedAt: user.googleLinkedAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }),
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

describe("requireCurrentUser", () => {
  beforeEach(() => {
    setEnv(VALID_ENV);
    resetEnvCache();
    mockCookieStore.get.mockReset();
    mockFindById.mockReset();
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

  it("rejects a missing session cookie", async () => {
    const { requireCurrentUser } = await import(
      "@/lib/auth/require-current-user"
    );

    mockCookieStore.get.mockReturnValue(undefined);

    await expect(requireCurrentUser()).rejects.toMatchObject({
      code: AppErrorCode.UNAUTHORIZED,
    });
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it("rejects an invalid session token", async () => {
    const { requireCurrentUser } = await import(
      "@/lib/auth/require-current-user"
    );

    mockCookieStore.get.mockReturnValue({
      name: SESSION_COOKIE_NAME,
      value: "not-a-jwt",
    });

    await expect(requireCurrentUser()).rejects.toMatchObject({
      code: AppErrorCode.UNAUTHORIZED,
    });
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it("rejects a valid token when the user no longer exists", async () => {
    const { requireCurrentUser } = await import(
      "@/lib/auth/require-current-user"
    );

    const token = await createSessionToken("507f1f77bcf86cd799439011");
    mockCookieStore.get.mockReturnValue({
      name: SESSION_COOKIE_NAME,
      value: token,
    });
    mockFindById.mockResolvedValue(null);

    await expect(requireCurrentUser()).rejects.toMatchObject({
      code: AppErrorCode.UNAUTHORIZED,
    });
  });

  it("returns a safe user for a valid session", async () => {
    const { requireCurrentUser } = await import(
      "@/lib/auth/require-current-user"
    );

    const token = await createSessionToken("507f1f77bcf86cd799439011");
    mockCookieStore.get.mockReturnValue({
      name: SESSION_COOKIE_NAME,
      value: token,
    });
    mockFindById.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Suresh Konar",
      email: "user@example.com",
      passwordHash: "hashed-password",
      googleId: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const user = await requireCurrentUser();

    expect(user).toEqual({
      id: "507f1f77bcf86cd799439011",
      name: "Suresh Konar",
      email: "user@example.com",
      googleId: null,
      googleLinkedAt: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(user).not.toHaveProperty("passwordHash");
  });
});
