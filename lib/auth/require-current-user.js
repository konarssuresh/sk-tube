import { connectDB } from "@/lib/db";
import { AppError, AppErrorCode } from "@/lib/errors";
import User, { toSafeUser } from "@/models/User";

import {
  readSessionTokenFromCookies,
  verifySessionToken,
} from "@/lib/auth/session";

export async function requireCurrentUser() {
  const token = await readSessionTokenFromCookies();

  if (!token) {
    throw new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required.");
  }

  const { sub } = await verifySessionToken(token);

  await connectDB();

  const user = await User.findById(sub);

  if (!user) {
    throw new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required.");
  }

  return toSafeUser(user);
}
