import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { AppError, AppErrorCode } from "@/lib/errors";

export default async function ProtectedLayout({ children }) {
  try {
    await requireCurrentUser();
  } catch (error) {
    if (error instanceof AppError && error.code === AppErrorCode.UNAUTHORIZED) {
      redirect("/login");
    }

    throw error;
  }

  return children;
}
