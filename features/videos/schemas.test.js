import { describe, expect, it } from "vitest";

import { parseVideoCursor } from "@/features/videos/schemas";
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
