import { z } from "zod";

import { formatEnvError } from "@/lib/env/format-env-error";

const sessionEnvSchema = z.object({
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
});

let cachedSessionEnv = null;

export function getSessionEnv() {
  if (cachedSessionEnv) {
    return cachedSessionEnv;
  }

  const result = sessionEnvSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(formatEnvError(result.error));
  }

  cachedSessionEnv = result.data;
  return cachedSessionEnv;
}

export function resetSessionEnvCache() {
  cachedSessionEnv = null;
}
