import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { parseRegisterInput } from "@/features/auth/schemas";
import { handleRoute } from "@/lib/api/handle-route-error";
import { setSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { duplicateKeyAppError, isMongoDuplicateKeyError } from "@/lib/errors";
import User, { toSafeUser } from "@/models/User";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json();
    const { name, email, password } = parseRegisterInput(body);

    await connectDB();

    const existingUser = await User.findOne({ email }).select("+passwordHash");

    if (existingUser) {
      if (existingUser.googleId && !existingUser.passwordHash) {
        throw duplicateKeyAppError(
          "An account with this email already exists. Sign in with Google instead.",
        );
      }

      throw duplicateKeyAppError("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;

    try {
      user = await User.create({ name, email, passwordHash });
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw duplicateKeyAppError(
          "An account with this email already exists.",
        );
      }

      throw error;
    }

    await setSessionCookie(String(user._id));

    return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  });
}
