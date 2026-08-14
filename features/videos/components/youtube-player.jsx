"use client";

import { useEffect, useRef } from "react";

import {
  getYoutubeNoCookieHost,
  getYoutubePlayerVars,
  resolvePlayerOrigin,
  shouldUseMutedAutoplay,
} from "@/features/videos/player-utils";
import { loadYoutubeIframeApi } from "@/features/videos/youtube-iframe-api";

const PLAYBACK_CHECK_DELAY_MS = 800;

const YT_PLAYER_STATE = {
  PLAYING: 1,
  BUFFERING: 3,
};

function isPlayingOrBuffering(state) {
  return (
    state === YT_PLAYER_STATE.PLAYING || state === YT_PLAYER_STATE.BUFFERING
  );
}

function getMutedAutoplayPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return shouldUseMutedAutoplay({
    userAgent: window.navigator.userAgent,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    narrowViewport: window.matchMedia("(max-width: 639px)").matches,
  });
}

export function YoutubePlayer({ videoId, appOrigin, title }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let playbackCheckTimeoutId;

    async function initPlayer() {
      const YT = await loadYoutubeIframeApi();

      if (cancelled || !containerRef.current) {
        return;
      }

      const origin = resolvePlayerOrigin(appOrigin);
      const useMutedAutoplay = getMutedAutoplayPreference();
      const playerVars = getYoutubePlayerVars({
        appOrigin: origin,
        useMutedAutoplay,
      });

      const player = new YT.Player(containerRef.current, {
        host: getYoutubeNoCookieHost(),
        videoId,
        playerVars,
        events: {
          onReady: (event) => {
            const target = event.target;
            target.playVideo();

            playbackCheckTimeoutId = window.setTimeout(() => {
              if (cancelled) {
                return;
              }

              const state = target.getPlayerState();

              if (!isPlayingOrBuffering(state)) {
                target.mute();
                target.playVideo();
              }
            }, PLAYBACK_CHECK_DELAY_MS);
          },
        },
      });

      playerRef.current = player;
    }

    initPlayer().catch(() => {
      // Playback can still be started manually through YouTube controls.
    });

    return () => {
      cancelled = true;

      if (playbackCheckTimeoutId) {
        window.clearTimeout(playbackCheckTimeoutId);
      }

      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId, appOrigin]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-none border-x-0 border-[#353542] bg-[#08080c] shadow-[var(--shadow)] sm:rounded-[15px] sm:border">
      <div
        ref={containerRef}
        title={title}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
