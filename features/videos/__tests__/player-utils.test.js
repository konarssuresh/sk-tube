import { describe, expect, it } from "vitest";

import {
  buildYoutubeEmbedUrl,
  buildYoutubeWatchUrl,
  getYoutubePlayerVars,
  resolvePlayerOrigin,
  shouldUseMutedAutoplay,
} from "@/features/videos/player-utils";

describe("player utils", () => {
  it("builds a YouTube watch URL", () => {
    expect(buildYoutubeWatchUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  it("builds a privacy-enhanced embed URL with required params", () => {
    const embedUrl = buildYoutubeEmbedUrl({
      videoId: "dQw4w9WgXcQ",
      appOrigin: "http://localhost:3000",
    });

    const url = new URL(embedUrl);

    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe("/embed/dQw4w9WgXcQ");
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("enablejsapi")).toBe("1");
    expect(url.searchParams.get("playsinline")).toBe("1");
    expect(url.searchParams.get("rel")).toBe("0");
    expect(url.searchParams.get("origin")).toBe("http://localhost:3000");
  });

  it("includes mute in player vars when muted autoplay is requested", () => {
    expect(
      getYoutubePlayerVars({
        appOrigin: "http://localhost:3000",
        useMutedAutoplay: true,
      }),
    ).toEqual({
      autoplay: 1,
      playsinline: 1,
      rel: 0,
      origin: "http://localhost:3000",
      enablejsapi: 1,
      mute: 1,
    });
  });

  it("detects mobile user agents for muted autoplay", () => {
    expect(
      shouldUseMutedAutoplay({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      }),
    ).toBe(true);

    expect(
      shouldUseMutedAutoplay({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      }),
    ).toBe(false);
  });

  it("prefers the browser origin when available", () => {
    const originalWindow = globalThis.window;

    globalThis.window = {
      location: {
        origin: "https://sktube.example",
      },
    };

    expect(resolvePlayerOrigin("http://localhost:3000")).toBe(
      "https://sktube.example",
    );

    globalThis.window = originalWindow;
  });
});
