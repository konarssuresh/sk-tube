import { z } from "zod";

import { fromZodError } from "@/lib/errors";

export const videoCursorSchema = z
  .string()
  .trim()
  .min(1, "Cursor must be a non-empty string.");

export function parseVideoCursor(input) {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  const result = videoCursorSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}
