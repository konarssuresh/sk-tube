export const GoogleAuthErrorCode = {
  GOOGLE_CONFLICT: "google_conflict",
  GOOGLE_AUTH_FAILED: "google_auth_failed",
};

export const GoogleAuthErrorMessage = {
  [GoogleAuthErrorCode.GOOGLE_CONFLICT]:
    "This Google account cannot be linked. Try another sign-in method.",
  [GoogleAuthErrorCode.GOOGLE_AUTH_FAILED]:
    "Google sign-in failed. Please try again.",
};

const MESSAGE_TO_CODE = Object.fromEntries(
  Object.entries(GoogleAuthErrorMessage).map(([code, message]) => [message, code]),
);

export function getGoogleAuthErrorMessage(errorCode) {
  return GoogleAuthErrorMessage[errorCode] ?? null;
}

export function mapErrorToGoogleAuthCode(error) {
  if (error?.googleAuthCode) {
    return error.googleAuthCode;
  }

  if (error?.message && MESSAGE_TO_CODE[error.message]) {
    return MESSAGE_TO_CODE[error.message];
  }

  return GoogleAuthErrorCode.GOOGLE_AUTH_FAILED;
}
