import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppErrorCode } from "@/lib/errors";
import { resetEnvCache } from "@/lib/env";

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
  set: vi.fn(),
  get: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => undefined),
}));

const mockFindOne = vi.fn();
const mockCreate = vi.fn();
const mockFindById = vi.fn();

vi.mock("@/models/User", () => ({
  default: {
    findOne: (...args) => mockFindOne(...args),
    create: (...args) => mockCreate(...args),
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

const mockHash = vi.fn();
const mockCompare = vi.fn();

vi.mock("bcrypt", () => ({
  default: {
    hash: (...args) => mockHash(...args),
    compare: (...args) => mockCompare(...args),
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

function createRequest(body) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("auth route handlers", () => {
  beforeEach(() => {
    setEnv(VALID_ENV);
    resetEnvCache();
    mockCookieStore.set.mockReset();
    mockCookieStore.get.mockReset();
    mockFindOne.mockReset();
    mockCreate.mockReset();
    mockHash.mockReset();
    mockCompare.mockReset();
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

  it("registers a user, sets the session cookie, and returns a safe user", async () => {
    const { POST } = await import("@/app/api/auth/register/route");

    mockFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });
    mockHash.mockResolvedValue("hashed-password");
    mockCreate.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Suresh Konar",
      email: "user@example.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await POST(
      createRequest({
        name: "Suresh Konar",
        email: "user@example.com",
        password: "password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.user).toEqual({
      id: "507f1f77bcf86cd799439011",
      name: "Suresh Konar",
      email: "user@example.com",
      googleId: null,
      googleLinkedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(payload.user).not.toHaveProperty("passwordHash");
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sktube_session",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      }),
    );
  });

  it("rejects duplicate email registration", async () => {
    const { POST } = await import("@/app/api/auth/register/route");

    mockFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
        passwordHash: "hashed-password",
      }),
    });

    const response = await POST(
      createRequest({
        name: "Suresh Konar",
        email: "user@example.com",
        password: "password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe(AppErrorCode.DUPLICATE);
    expect(payload.message).toContain("already exists");
  });

  it("rejects duplicate email registration for Google-only accounts with guidance", async () => {
    const { POST } = await import("@/app/api/auth/register/route");

    mockFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
        googleId: "google-subject-123",
        passwordHash: null,
      }),
    });

    const response = await POST(
      createRequest({
        name: "Suresh Konar",
        email: "user@example.com",
        password: "password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe(AppErrorCode.DUPLICATE);
    expect(payload.message).toContain("Sign in with Google instead");
  });

  it("rejects invalid registration input", async () => {
    const { POST } = await import("@/app/api/auth/register/route");

    const response = await POST(
      createRequest({
        name: "",
        email: "not-an-email",
        password: "short",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe(AppErrorCode.VALIDATION);
    expect(payload.details?.length).toBeGreaterThan(0);
  });

  it("logs in with valid credentials and sets the session cookie", async () => {
    const { POST } = await import("@/app/api/auth/login/route");

    const user = {
      _id: "507f1f77bcf86cd799439011",
      name: "Suresh Konar",
      email: "user@example.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    mockFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    });
    mockCompare.mockResolvedValue(true);

    const response = await POST(
      createRequest({
        email: "user@example.com",
        password: "password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.user.email).toBe("user@example.com");
    expect(mockCookieStore.set).toHaveBeenCalled();
  });

  it("returns a generic error for unknown emails", async () => {
    const { POST } = await import("@/app/api/auth/login/route");

    mockFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const response = await POST(
      createRequest({
        email: "missing@example.com",
        password: "password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.message).toBe("Invalid email or password.");
  });

  it("returns a Google sign-in message for Google-only accounts", async () => {
    const { POST } = await import("@/app/api/auth/login/route");

    mockFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
        googleId: "google-subject-123",
        passwordHash: null,
      }),
    });

    const response = await POST(
      createRequest({
        email: "user@example.com",
        password: "password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.message).toBe("This account uses Google sign-in.");
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it("returns a generic error for incorrect passwords", async () => {
    const { POST } = await import("@/app/api/auth/login/route");

    mockFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
        passwordHash: "hashed-password",
      }),
    });
    mockCompare.mockResolvedValue(false);

    const response = await POST(
      createRequest({
        email: "user@example.com",
        password: "wrong-password",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.message).toBe("Invalid email or password.");
  });

  it("clears the session cookie on logout", async () => {
    const { POST } = await import("@/app/api/auth/logout/route");

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true });
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sktube_session",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
  });
});
