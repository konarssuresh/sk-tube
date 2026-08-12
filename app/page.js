import { redirect } from "next/navigation";

import {
  readSessionTokenFromCookies,
  verifySessionToken,
} from "@/lib/auth/session";

export default async function HomePage() {
  const token = await readSessionTokenFromCookies();

  if (token) {
    try {
      await verifySessionToken(token);
      redirect("/dashboard");
    } catch {
      redirect("/login");
    }
  }

  redirect("/login");
}
