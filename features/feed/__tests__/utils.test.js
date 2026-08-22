import { describe, expect, it } from "vitest";

import {
  DATE_PRESETS,
  DURATION_PRESETS,
  getDurationBoundsForPreset,
  getPublishedAfterForPreset,
  isNewFeedVideo,
} from "@/features/feed/utils";

describe("feed utils", () => {
  it("maps duration presets to inclusive bounds", () => {
    expect(getDurationBoundsForPreset(DURATION_PRESETS.short)).toEqual({
      maxDurationSeconds: 599,
    });
    expect(getDurationBoundsForPreset(DURATION_PRESETS.medium)).toEqual({
      minDurationSeconds: 600,
      maxDurationSeconds: 1800,
    });
    expect(getDurationBoundsForPreset(DURATION_PRESETS.long)).toEqual({
      minDurationSeconds: 1801,
    });
  });

  it("computes rolling published-after presets", () => {
    const now = new Date("2026-06-15T15:00:00.000Z");

    expect(
      getPublishedAfterForPreset(DATE_PRESETS.week, 0, now),
    ).toBe("2026-06-08T15:00:00.000Z");
    expect(
      getPublishedAfterForPreset(DATE_PRESETS.month, 0, now),
    ).toBe("2026-05-16T15:00:00.000Z");
  });

  it("computes local today boundary using timezone offset", () => {
    const now = new Date("2026-06-15T15:00:00.000Z");
    const offset = 300;
    const publishedAfter = getPublishedAfterForPreset(
      DATE_PRESETS.today,
      offset,
      now,
    );

    expect(publishedAfter).toBe("2026-06-15T05:00:00.000Z");
  });

  it("shows new markers only when feedLastVisitedAt is set", () => {
    expect(isNewFeedVideo("2026-06-16T00:00:00.000Z", null)).toBe(false);
    expect(
      isNewFeedVideo(
        "2026-06-16T00:00:00.000Z",
        "2026-06-15T00:00:00.000Z",
      ),
    ).toBe(true);
    expect(
      isNewFeedVideo(
        "2026-06-15T00:00:00.000Z",
        "2026-06-15T00:00:00.000Z",
      ),
    ).toBe(false);
  });
});
