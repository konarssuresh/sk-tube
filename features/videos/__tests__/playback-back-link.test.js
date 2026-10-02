import { describe, expect, it } from "vitest";

import {
  appendPlaybackReturnFrom,
  appendSearchQueryToHref,
  buildSearchVideosPageHref,
  parsePlaybackReturnFrom,
  resolveOwnedChannelPlaybackBack,
} from "@/features/videos/playback-back-link";

describe("playback-back-link", () => {
  describe("parsePlaybackReturnFrom", () => {
    it("treats channel as channel and everything else as home", () => {
      expect(parsePlaybackReturnFrom("channel")).toBe("channel");
      expect(parsePlaybackReturnFrom("home")).toBe("home");
      expect(parsePlaybackReturnFrom(undefined)).toBe("home");
      expect(parsePlaybackReturnFrom("search")).toBe("home");
    });
  });

  describe("appendPlaybackReturnFrom", () => {
    it("appends from query params for home and channel entry points", () => {
      expect(
        appendPlaybackReturnFrom("/channels/ch1/videos/v1", "home"),
      ).toBe("/channels/ch1/videos/v1?from=home");
      expect(
        appendPlaybackReturnFrom("/channels/ch1/videos/v1", "channel"),
      ).toBe("/channels/ch1/videos/v1?from=channel");
    });
  });

  describe("resolveOwnedChannelPlaybackBack", () => {
    it("returns channel back target when from=channel", () => {
      expect(
        resolveOwnedChannelPlaybackBack({
          from: "channel",
          channelId: "ch1",
          channelTitle: "Fireship",
        }),
      ).toEqual({
        href: "/channels/ch1",
        label: "← Back to Fireship videos",
      });
    });

    it("defaults to home when from is missing or home", () => {
      expect(
        resolveOwnedChannelPlaybackBack({
          channelId: "ch1",
          channelTitle: "Fireship",
        }),
      ).toEqual({
        href: "/home",
        label: "← Back to Home",
      });
    });
  });

  describe("search return href helpers", () => {
    it("builds search page href with encoded query", () => {
      expect(buildSearchVideosPageHref("modern react")).toBe(
        "/search/videos?q=modern%20react",
      );
      expect(buildSearchVideosPageHref("  ")).toBe("/search/videos");
    });

    it("appends q to playback href", () => {
      expect(appendSearchQueryToHref("/search/videos/v1", "cats")).toBe(
        "/search/videos/v1?q=cats",
      );
    });
  });
});
