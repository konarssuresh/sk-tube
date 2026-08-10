import { z } from "zod";

import { fromZodError } from "@/lib/errors";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export function parseRegisterInput(input) {
  const result = registerSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseLoginInput(input) {
  const result = loginSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}
