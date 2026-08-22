import { z } from "zod";

import { fromZodError } from "@/lib/errors";

export const feedCursorSchema = z
  .string()
  .trim()
  .min(1, "Cursor must be a non-empty string.");

export const feedChannelIdsSchema = z
  .string()
  .trim()
  .min(1, "Channel IDs must not be empty.");

export const publishedAfterSchema = z
  .string()
  .trim()
  .datetime({ offset: true });

export const durationBoundSchema = z.coerce
  .number()
  .int()
  .nonnegative("Duration must be zero or greater.");

export const visitStartedAtSchema = z
  .string()
  .trim()
  .datetime({ offset: true });

export function parseFeedCursor(input) {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  const result = feedCursorSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseFeedChannelIds(input) {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  const result = feedChannelIdsSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function parsePublishedAfter(input) {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  const result = publishedAfterSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseMinDurationSeconds(input) {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  const result = durationBoundSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseMaxDurationSeconds(input) {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  const result = durationBoundSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

export function parseVisitStartedAt(input) {
  const result = visitStartedAtSchema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}
