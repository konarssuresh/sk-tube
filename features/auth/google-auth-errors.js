export const GoogleAuthErrorCode = {
  NO_ACCOUNT: "no_account",
  GOOGLE_CONFLICT: "google_conflict",
  EMAIL_UNVERIFIED: "email_unverified",
  GOOGLE_AUTH_FAILED: "google_auth_failed",
};

export const GoogleAuthErrorMessage = {
  [GoogleAuthErrorCode.NO_ACCOUNT]:
    "Create an email/password account first, then sign in with Google using the same email.",
  [GoogleAuthErrorCode.GOOGLE_CONFLICT]:
    "This Google account cannot be linked. Try another sign-in method.",
  [GoogleAuthErrorCode.EMAIL_UNVERIFIED]:
    "Google sign-in requires a verified email address.",
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
