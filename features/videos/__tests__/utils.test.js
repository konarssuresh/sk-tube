import { describe, expect, it } from "vitest";

import {
  formatPublishedDate,
  formatVideoDuration,
  isVideoEligible,
  parseIso8601Duration,
} from "@/features/videos/utils";

function createVideo(overrides = {}) {
  return {
    status: {
      privacyStatus: "public",
    },
    snippet: {
      liveBroadcastContent: "none",
    },
    contentDetails: {
      duration: "PT2M",
    },
    ...overrides,
  };
}

describe("parseIso8601Duration", () => {
  it("parses hour, minute, and second components", () => {
    expect(parseIso8601Duration("PT1H2M3S")).toBe(3723);
  });

  it("parses minute and second only durations", () => {
    expect(parseIso8601Duration("PT2M")).toBe(120);
    expect(parseIso8601Duration("PT45S")).toBe(45);
  });

  it("returns null for invalid durations", () => {
    expect(parseIso8601Duration("")).toBeNull();
    expect(parseIso8601Duration("PT")).toBeNull();
    expect(parseIso8601Duration("invalid")).toBeNull();
  });
});

describe("isVideoEligible", () => {
  it("includes videos that are exactly two minutes long", () => {
    expect(
      isVideoEligible(
        createVideo({
          contentDetails: { duration: "PT2M" },
        }),
      ),
    ).toBe(true);
  });

  it("excludes videos shorter than two minutes", () => {
    expect(
      isVideoEligible(
        createVideo({
          contentDetails: { duration: "PT1M59S" },
        }),
      ),
    ).toBe(false);
  });

  it("excludes live and upcoming broadcasts", () => {
    expect(
      isVideoEligible(
        createVideo({
          snippet: { liveBroadcastContent: "live" },
        }),
      ),
    ).toBe(false);

    expect(
      isVideoEligible(
        createVideo({
          snippet: { liveBroadcastContent: "upcoming" },
        }),
      ),
    ).toBe(false);
  });

  it("excludes archived livestreams and non-public videos", () => {
    expect(
      isVideoEligible(
        createVideo({
          contentDetails: { duration: "P0D" },
        }),
      ),
    ).toBe(false);

    expect(
      isVideoEligible(
        createVideo({
          status: { privacyStatus: "private" },
        }),
      ),
    ).toBe(false);

    expect(isVideoEligible(null)).toBe(false);
  });
});

describe("formatVideoDuration", () => {
  it("formats seconds into display durations", () => {
    expect(formatVideoDuration(45)).toBe("0:45");
    expect(formatVideoDuration(120)).toBe("2:00");
    expect(formatVideoDuration(3723)).toBe("1:02:03");
  });
});

describe("formatPublishedDate", () => {
  it("returns a relative label for recent dates", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    expect(formatPublishedDate(twoDaysAgo.toISOString())).toMatch(/day/);
  });

  it("returns an absolute label for older dates", () => {
    expect(formatPublishedDate("2020-01-15T00:00:00.000Z")).toMatch(/Jan/);
  });
});
