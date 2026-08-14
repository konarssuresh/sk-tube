import { describe, expect, it } from "vitest";

import {
  buildYoutubeEmbedUrl,
  buildYoutubeWatchUrl,
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
    expect(url.searchParams.get("playsinline")).toBe("1");
    expect(url.searchParams.get("rel")).toBe("0");
    expect(url.searchParams.get("origin")).toBe("http://localhost:3000");
  });
});
