// @vitest-environment jsdom

import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const playVideo = vi.fn();
const mute = vi.fn();
const getPlayerState = vi.fn();
const destroy = vi.fn();

let latestPlayerOptions;

class MockYoutubePlayer {
  constructor(_element, options) {
    latestPlayerOptions = options;
    this.options = options;
    options.events?.onReady?.({ target: this });
  }

  playVideo() {
    playVideo();
  }

  mute() {
    mute();
  }

  getPlayerState() {
    return getPlayerState();
  }

  destroy() {
    destroy();
  }
}

vi.mock("@/features/videos/youtube-iframe-api", () => ({
  loadYoutubeIframeApi: vi.fn(() =>
    Promise.resolve({
      Player: MockYoutubePlayer,
    }),
  ),
}));

import { YoutubePlayer } from "@/features/videos/components/youtube-player";

describe("YoutubePlayer", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    latestPlayerOptions = undefined;
    playVideo.mockReset();
    mute.mockReset();
    getPlayerState.mockReset();
    destroy.mockReset();
    getPlayerState.mockReturnValue(1);
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  afterEach(() => {
    container.remove();
    vi.clearAllTimers();
  });

  it("creates a YouTube player with enablejsapi and calls playVideo on ready", async () => {
    vi.useFakeTimers();

    const root = createRoot(container);

    await act(async () => {
      root.render(
        createElement(YoutubePlayer, {
          videoId: "dQw4w9WgXcQ",
          appOrigin: "http://localhost:3000",
          title: "Test video",
        }),
      );
      await Promise.resolve();
    });

    expect(latestPlayerOptions.videoId).toBe("dQw4w9WgXcQ");
    expect(latestPlayerOptions.host).toBe("https://www.youtube-nocookie.com");
    expect(latestPlayerOptions.playerVars).toMatchObject({
      autoplay: 1,
      enablejsapi: 1,
      origin: window.location.origin,
    });
    expect(playVideo).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(mute).not.toHaveBeenCalled();

    root.unmount();
    vi.useRealTimers();
  });

  it("retries with mute when playback has not started", async () => {
    vi.useFakeTimers();
    getPlayerState.mockReturnValue(5);

    const root = createRoot(container);

    await act(async () => {
      root.render(
        createElement(YoutubePlayer, {
          videoId: "dQw4w9WgXcQ",
          appOrigin: "http://localhost:3000",
          title: "Test video",
        }),
      );
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(mute).toHaveBeenCalledTimes(1);
    expect(playVideo).toHaveBeenCalledTimes(2);

    root.unmount();
    vi.useRealTimers();
  });

  it("starts muted on mobile user agents", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    });

    const root = createRoot(container);

    await act(async () => {
      root.render(
        createElement(YoutubePlayer, {
          videoId: "dQw4w9WgXcQ",
          appOrigin: "http://localhost:3000",
          title: "Test video",
        }),
      );
      await Promise.resolve();
    });

    expect(latestPlayerOptions.playerVars.mute).toBe(1);

    root.unmount();
  });
});
