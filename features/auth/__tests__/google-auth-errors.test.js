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
    expect(getGoogleAuthErrorMessage(GoogleAuthErrorCode.NO_ACCOUNT)).toBe(
      GoogleAuthErrorMessage[GoogleAuthErrorCode.NO_ACCOUNT],
    );
  });

  it("maps AppError messages to Google auth error codes", () => {
    const error = new AppError(
      AppErrorCode.UNAUTHORIZED,
      GoogleAuthErrorMessage[GoogleAuthErrorCode.NO_ACCOUNT],
    );

    expect(mapErrorToGoogleAuthCode(error)).toBe(
      GoogleAuthErrorCode.NO_ACCOUNT,
    );
  });

  it("falls back to a generic Google auth failure code", () => {
    expect(mapErrorToGoogleAuthCode(new Error("unexpected"))).toBe(
      GoogleAuthErrorCode.GOOGLE_AUTH_FAILED,
    );
  });
});
