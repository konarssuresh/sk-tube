import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { parseLoginInput } from "@/features/auth/schemas";
import { handleRoute } from "@/lib/api/handle-route-error";
import { setSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { AppError, AppErrorCode } from "@/lib/errors";
import User, { toSafeUser } from "@/models/User";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const GOOGLE_SIGN_IN_MESSAGE = "This account uses Google sign-in.";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json();
    const { email, password } = parseLoginInput(body);

    await connectDB();

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      throw new AppError(
        AppErrorCode.UNAUTHORIZED,
        INVALID_CREDENTIALS_MESSAGE,
      );
    }

    if (!user.passwordHash) {
      throw new AppError(AppErrorCode.UNAUTHORIZED, GOOGLE_SIGN_IN_MESSAGE);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(
        AppErrorCode.UNAUTHORIZED,
        INVALID_CREDENTIALS_MESSAGE,
      );
    }

    await setSessionCookie(String(user._id));

    return NextResponse.json({ user: toSafeUser(user) });
  });
}
