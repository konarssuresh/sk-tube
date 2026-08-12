import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppErrorCode } from "@/lib/errors";
import {
  GoogleAuthErrorCode,
  GoogleAuthErrorMessage,
} from "@/features/auth/google-auth-errors";

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => undefined),
}));

const mockFindOne = vi.fn();

vi.mock("@/models/User", () => ({
  default: {
    findOne: (...args) => mockFindOne(...args),
  },
}));

describe("linkGoogleAccount", () => {
  beforeEach(() => {
    mockFindOne.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("links Google to an existing password account", async () => {
    const { linkGoogleAccount } = await import(
      "@/features/auth/services/link-google-account"
    );

    const user = {
      _id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      googleId: null,
      save: vi.fn().mockResolvedValue(undefined),
    };

    mockFindOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);

    const result = await linkGoogleAccount({
      googleId: "google-subject-123",
      email: "user@example.com",
    });

    expect(result.googleId).toBe("google-subject-123");
    expect(result.googleLinkedAt).toBeInstanceOf(Date);
    expect(user.save).toHaveBeenCalled();
  });

  it("returns an existing linked account when Google IDs match", async () => {
    const { linkGoogleAccount } = await import(
      "@/features/auth/services/link-google-account"
    );

    const user = {
      _id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      googleId: "google-subject-123",
      save: vi.fn(),
    };

    mockFindOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);

    const result = await linkGoogleAccount({
      googleId: "google-subject-123",
      email: "user@example.com",
    });

    expect(result).toBe(user);
    expect(user.save).not.toHaveBeenCalled();
  });

  it("rejects unknown emails without creating a user", async () => {
    const { linkGoogleAccount } = await import(
      "@/features/auth/services/link-google-account"
    );

    mockFindOne.mockResolvedValueOnce(null);

    await expect(
      linkGoogleAccount({
        googleId: "google-subject-123",
        email: "missing@example.com",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.UNAUTHORIZED,
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.NO_ACCOUNT],
    });
  });

  it("rejects conflicting Google IDs on the same account", async () => {
    const { linkGoogleAccount } = await import(
      "@/features/auth/services/link-google-account"
    );

    mockFindOne.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      googleId: "existing-google-id",
    });

    await expect(
      linkGoogleAccount({
        googleId: "different-google-id",
        email: "user@example.com",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.DUPLICATE,
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    });
  });

  it("rejects Google IDs already linked to another user", async () => {
    const { linkGoogleAccount } = await import(
      "@/features/auth/services/link-google-account"
    );

    mockFindOne
      .mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
        googleId: null,
        save: vi.fn(),
      })
      .mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439099",
        googleId: "google-subject-123",
      });

    await expect(
      linkGoogleAccount({
        googleId: "google-subject-123",
        email: "user@example.com",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.DUPLICATE,
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    });
  });
});
