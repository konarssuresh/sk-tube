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
const mockCreate = vi.fn();

vi.mock("@/models/User", () => ({
  default: {
    findOne: (...args) => mockFindOne(...args),
    create: (...args) => mockCreate(...args),
  },
}));

describe("authenticateWithGoogle", () => {
  beforeEach(() => {
    mockFindOne.mockReset();
    mockCreate.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("links Google to an existing password account", async () => {
    const { authenticateWithGoogle } = await import(
      "@/features/auth/services/authenticate-with-google"
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

    const result = await authenticateWithGoogle({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh",
    });

    expect(result.googleId).toBe("google-subject-123");
    expect(result.googleLinkedAt).toBeInstanceOf(Date);
    expect(user.save).toHaveBeenCalled();
  });

  it("returns an existing linked account when Google IDs match", async () => {
    const { authenticateWithGoogle } = await import(
      "@/features/auth/services/authenticate-with-google"
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

    const result = await authenticateWithGoogle({
      googleId: "google-subject-123",
      email: "user@example.com",
      name: "Suresh",
    });

    expect(result).toBe(user);
    expect(user.save).not.toHaveBeenCalled();
  });

  it("creates a new user when no account exists for the Google email", async () => {
    const { authenticateWithGoogle } = await import(
      "@/features/auth/services/authenticate-with-google"
    );

    const createdUser = {
      _id: "507f1f77bcf86cd799439099",
      name: "Suresh",
      email: "new@example.com",
      googleId: "google-subject-123",
      googleLinkedAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    mockFindOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockCreate.mockResolvedValue(createdUser);

    const result = await authenticateWithGoogle({
      googleId: "google-subject-123",
      email: "new@example.com",
      name: "Suresh",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      name: "Suresh",
      email: "new@example.com",
      googleId: "google-subject-123",
      googleLinkedAt: expect.any(Date),
    });
    expect(result).toBe(createdUser);
  });

  it("rejects conflicting Google IDs on the same account", async () => {
    const { authenticateWithGoogle } = await import(
      "@/features/auth/services/authenticate-with-google"
    );

    mockFindOne.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      googleId: "existing-google-id",
    });

    await expect(
      authenticateWithGoogle({
        googleId: "different-google-id",
        email: "user@example.com",
        name: "Suresh",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.DUPLICATE,
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    });
  });

  it("rejects Google IDs already linked to another user", async () => {
    const { authenticateWithGoogle } = await import(
      "@/features/auth/services/authenticate-with-google"
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
      authenticateWithGoogle({
        googleId: "google-subject-123",
        email: "user@example.com",
        name: "Suresh",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.DUPLICATE,
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    });
  });

  it("rejects creating a user when the Google ID belongs to another account", async () => {
    const { authenticateWithGoogle } = await import(
      "@/features/auth/services/authenticate-with-google"
    );

    mockFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439099",
        googleId: "google-subject-123",
      });

    await expect(
      authenticateWithGoogle({
        googleId: "google-subject-123",
        email: "new@example.com",
        name: "Suresh",
      }),
    ).rejects.toMatchObject({
      code: AppErrorCode.DUPLICATE,
      message: GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    });
  });
});
