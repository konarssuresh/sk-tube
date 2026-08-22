import { z } from "zod";

import { fromZodError } from "@/lib/errors";

export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, "Search query must not be empty.");

export const searchCursorSchema = z
  .string()
  .trim()
  .min(1, "Cursor must be a non-empty string.");

export function parseSearchQuery(input) {
  const result = searchQuerySchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseSearchCursor(input) {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  const result = searchCursorSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}
