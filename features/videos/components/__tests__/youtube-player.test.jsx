// @vitest-environment jsdom

import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { YoutubePlayer } from "@/features/videos/components/youtube-player";

function setDesktopEnvironment() {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  });
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  Object.defineProperty(window.navigator, "standalone", {
    configurable: true,
    value: false,
  });
}

function setMobileEnvironment() {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  });
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  Object.defineProperty(window.navigator, "standalone", {
    configurable: true,
    value: false,
  });
}

describe("YoutubePlayer", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    setDesktopEnvironment();
  });

  afterEach(() => {
    container.remove();
  });

  it("renders a privacy-enhanced iframe embed on desktop", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(
        createElement(YoutubePlayer, {
          videoId: "dQw4w9WgXcQ",
          appOrigin: "http://localhost:3000",
          title: "Test video",
        }),
      );
    });

    const iframe = container.querySelector("iframe");

    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute("src")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(iframe.getAttribute("src")).toContain("autoplay=1");

    root.unmount();
  });

  it("uses conservative playback (no autoplay) on mobile", async () => {
    setMobileEnvironment();

    const root = createRoot(container);

    await act(async () => {
      root.render(
        createElement(YoutubePlayer, {
          videoId: "dQw4w9WgXcQ",
          appOrigin: "http://localhost:3000",
          title: "Test video",
        }),
      );
    });

    const iframe = container.querySelector("iframe");
    const src = iframe.getAttribute("src");

    expect(src).toContain("autoplay=0");
    expect(src).not.toContain("mute=1");

    root.unmount();
  });
});
