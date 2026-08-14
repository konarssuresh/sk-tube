import { describe, expect, it } from "vitest";

import { parseVideoCursor, parseVideoId } from "@/features/videos/schemas";
import { AppError } from "@/lib/errors";

describe("video cursor schema", () => {
  it("returns undefined for missing cursors", () => {
    expect(parseVideoCursor(undefined)).toBeUndefined();
    expect(parseVideoCursor("")).toBeUndefined();
    expect(parseVideoCursor(null)).toBeUndefined();
  });

  it("accepts non-empty cursor strings", () => {
    expect(parseVideoCursor("next-page-token")).toBe("next-page-token");
  });

  it("rejects blank cursor strings", () => {
    expect(() => parseVideoCursor("   ")).toThrow(AppError);
  });
});

describe("video id schema", () => {
  it("accepts valid YouTube video IDs", () => {
    expect(parseVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseVideoId("e2e-video-0")).toBe("e2e-video-0");
  });

  it("rejects invalid video IDs", () => {
    expect(() => parseVideoId("short")).toThrow(AppError);
    expect(() => parseVideoId("")).toThrow(AppError);
    expect(() => parseVideoId("invalid id!")).toThrow(AppError);
  });
});
