import { describe, expect, it } from "vitest";

import {
  excerptDescription,
  formatCount,
} from "@/features/discovery/utils";

describe("discovery utils", () => {
  describe("formatCount", () => {
    it("formats large counts compactly", () => {
      expect(formatCount(3_700_000)).toBe("3.7M");
      expect(formatCount(420_000)).toBe("420K");
      expect(formatCount(28_000_000)).toBe("28M");
      expect(formatCount(42)).toBe("42");
    });

    it("returns null for unavailable values", () => {
      expect(formatCount(null)).toBeNull();
      expect(formatCount(undefined)).toBeNull();
    });
  });

  describe("excerptDescription", () => {
    it("returns trimmed text when within the limit", () => {
      expect(excerptDescription("  Short description  ")).toBe(
        "Short description",
      );
    });

    it("truncates long descriptions with an ellipsis", () => {
      const longText = "a".repeat(150);

      expect(excerptDescription(longText, 120)).toBe(`${"a".repeat(120)}…`);
    });
  });
});
