import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GoogleAuthErrorCode } from "@/features/auth/google-auth-errors";
import { AppError, AppErrorCode } from "@/lib/errors";

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

const mockCreateGoogleAuthUrl = vi.fn();
const mockCreateOAuthState = vi.fn();
const mockSetGoogleOAuthStateCookie = vi.fn();
const mockVerifyGoogleOAuthStateCookie = vi.fn();
const mockVerifyGoogleAuthCode = vi.fn();
const mockSetSessionCookie = vi.fn();
const mockAuthenticateWithGoogle = vi.fn();

vi.mock("@/lib/google-auth", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    createGoogleAuthUrl: (...args) => mockCreateGoogleAuthUrl(...args),
    createOAuthState: (...args) => mockCreateOAuthState(...args),
    setGoogleOAuthStateCookie: (...args) =>
      mockSetGoogleOAuthStateCookie(...args),
    verifyGoogleOAuthStateCookie: (...args) =>
      mockVerifyGoogleOAuthStateCookie(...args),
    verifyGoogleAuthCode: (...args) => mockVerifyGoogleAuthCode(...args),
  };
});

vi.mock("@/lib/auth/session", () => ({
  setSessionCookie: (...args) => mockSetSessionCookie(...args),
}));

vi.mock("@/features/auth/services/authenticate-with-google", () => ({
  authenticateWithGoogle: (...args) => mockAuthenticateWithGoogle(...args),
}));

describe("google auth routes", () => {
  beforeEach(() => {
    mockCookieStore.set.mockReset();
    mockCookieStore.get.mockReset();
    mockCreateGoogleAuthUrl.mockReset();
    mockCreateOAuthState.mockReset();
    mockSetGoogleOAuthStateCookie.mockReset();
    mockVerifyGoogleOAuthStateCookie.mockReset();
    mockVerifyGoogleAuthCode.mockReset();
    mockSetSessionCookie.mockReset();
    mockAuthenticateWithGoogle.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts Google OAuth with a state cookie", async () => {
    const { GET } = await import("@/app/api/auth/google/route");

    mockCreateOAuthState.mockReturnValue("oauth-state-123");
    mockCreateGoogleAuthUrl.mockReturnValue(
      "https://accounts.google.com/o/oauth2",
    );

    const response = await GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://accounts.google.com/o/oauth2",
    );
    expect(mockSetGoogleOAuthStateCookie).toHaveBeenCalledWith("oauth-state-123");
  });

  it("completes callback by authenticating the user and setting the session cookie", async () => {
    const { GET } = await import("@/app/api/auth/google/callback/route");

    mockVerifyGoogleOAuthStateCookie.mockResolvedValue(true);
    mockVerifyGoogleAuthCode.mockResolvedValue({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh",
    });
    mockAuthenticateWithGoogle.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/google/callback?code=auth-code&state=oauth-state-123",
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
    expect(mockAuthenticateWithGoogle).toHaveBeenCalledWith({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh",
    });
    expect(mockSetSessionCookie).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
  });

  it("redirects to login when OAuth state is invalid", async () => {
    const { GET } = await import("@/app/api/auth/google/callback/route");

    mockVerifyGoogleOAuthStateCookie.mockResolvedValue(false);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/google/callback?code=auth-code&state=bad-state",
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      `http://localhost:3000/login?error=${GoogleAuthErrorCode.GOOGLE_AUTH_FAILED}`,
    );
  });

  it("redirects to login when Google authentication fails", async () => {
    const { GET } = await import("@/app/api/auth/google/callback/route");

    mockVerifyGoogleOAuthStateCookie.mockResolvedValue(true);
    mockVerifyGoogleAuthCode.mockResolvedValue({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh",
    });
    mockAuthenticateWithGoogle.mockRejectedValue(
      new AppError(
        AppErrorCode.DUPLICATE,
        "This Google account cannot be linked. Try another sign-in method.",
      ),
    );

    const request = new NextRequest(
      "http://localhost:3000/api/auth/google/callback?code=auth-code&state=oauth-state-123",
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      `http://localhost:3000/login?error=${GoogleAuthErrorCode.GOOGLE_CONFLICT}`,
    );
  });
});
