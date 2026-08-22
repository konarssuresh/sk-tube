import { describe, expect, it } from "vitest";

import { AppErrorCode } from "@/lib/errors";

describe("discovery schemas", () => {
  it("parses a non-empty search query", async () => {
    const { parseSearchQuery } = await import("@/features/discovery/schemas");

    expect(parseSearchQuery("modern react")).toBe("modern react");
    expect(parseSearchQuery("  trimmed  ")).toBe("trimmed");
  });

  it("rejects empty search queries", async () => {
    const { parseSearchQuery } = await import("@/features/discovery/schemas");

    expect(() => parseSearchQuery("")).toThrowError(
      expect.objectContaining({ code: AppErrorCode.VALIDATION }),
    );
    expect(() => parseSearchQuery("   ")).toThrowError(
      expect.objectContaining({ code: AppErrorCode.VALIDATION }),
    );
    expect(() => parseSearchQuery(null)).toThrowError(
      expect.objectContaining({ code: AppErrorCode.VALIDATION }),
    );
  });

  it("parses opaque search cursors", async () => {
    const { parseSearchCursor } = await import("@/features/discovery/schemas");

    expect(parseSearchCursor(undefined)).toBeUndefined();
    expect(parseSearchCursor("")).toBeUndefined();
    expect(parseSearchCursor("next-page")).toBe("next-page");
  });

  it("rejects blank search cursors", async () => {
    const { parseSearchCursor } = await import("@/features/discovery/schemas");

    expect(() => parseSearchCursor("   ")).toThrowError(
      expect.objectContaining({ code: AppErrorCode.VALIDATION }),
    );
  });
});
