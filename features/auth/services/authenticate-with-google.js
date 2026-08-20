import { connectDB } from "@/lib/db";
import {
  AppError,
  AppErrorCode,
  duplicateKeyAppError,
  isMongoDuplicateKeyError,
} from "@/lib/errors";
import {
  GoogleAuthErrorCode,
  GoogleAuthErrorMessage,
} from "@/features/auth/google-auth-errors";
import User from "@/models/User";

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function authenticateWithGoogle({ googleId, email, name }) {
  const normalizedEmail = normalizeEmail(email);

  await connectDB();

  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    const existingGoogleUser = await User.findOne({ googleId });

    if (
      existingGoogleUser &&
      String(existingGoogleUser._id) !== String(user._id)
    ) {
      throw new AppError(
        AppErrorCode.DUPLICATE,
        GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
      );
    }

    if (user.googleId) {
      if (user.googleId !== googleId) {
        throw new AppError(
          AppErrorCode.DUPLICATE,
          GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
        );
      }

      return user;
    }

    user.googleId = googleId;
    user.googleLinkedAt = new Date();

    try {
      await user.save();
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw duplicateKeyAppError(
          GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
        );
      }

      throw error;
    }

    return user;
  }

  const existingGoogleUser = await User.findOne({ googleId });

  if (existingGoogleUser) {
    throw new AppError(
      AppErrorCode.DUPLICATE,
      GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
    );
  }

  try {
    return await User.create({
      name,
      email: normalizedEmail,
      googleId,
      googleLinkedAt: new Date(),
    });
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      throw duplicateKeyAppError(
        GoogleAuthErrorMessage[GoogleAuthErrorCode.GOOGLE_CONFLICT],
      );
    }

    throw error;
  }
}
