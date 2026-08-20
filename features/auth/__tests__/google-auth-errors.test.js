import { describe, expect, it } from "vitest";

import {
  getGoogleAuthErrorMessage,
  GoogleAuthErrorCode,
  GoogleAuthErrorMessage,
  mapErrorToGoogleAuthCode,
} from "@/features/auth/google-auth-errors";
import { AppError, AppErrorCode } from "@/lib/errors";

describe("google auth errors", () => {
  it("returns user-facing messages for known error codes", () => {
    expect(getGoogleAuthErrorMessage(GoogleAuthErrorCode.GOOGLE_CONFLICT)).toBe(
      GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    );
  });

  it("maps AppError messages to Google auth error codes", () => {
    const error = new AppError(
      AppErrorCode.DUPLICATE,
      GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    );

    expect(mapErrorToGoogleAuthCode(error)).toBe(
      GoogleAuthErrorCode.GOOGLE_CONFLICT,
    );
  });

  it("falls back to a generic Google auth failure code", () => {
    expect(mapErrorToGoogleAuthCode(new Error("unexpected"))).toBe(
      GoogleAuthErrorCode.GOOGLE_AUTH_FAILED,
    );
  });
});
