"use client";

import { useEffect, useRef, useState } from "react";

import {
  buildYoutubeEmbedUrl,
  getYoutubeNoCookieHost,
  getYoutubePlayerVars,
  resolvePlayerOrigin,
  shouldUseNativeYoutubeEmbed,
  shouldUseMutedAutoplay,
} from "@/features/videos/player-utils";
import { loadYoutubeIframeApi } from "@/features/videos/youtube-iframe-api";

const PLAYBACK_CHECK_DELAY_MS = 800;

const YT_PLAYER_STATE = {
  PLAYING: 1,
  BUFFERING: 3,
};

const PLAYER_SURFACE_CLASS =
  "relative aspect-video overflow-hidden rounded-none border-x-0 border-[#353542] bg-[#08080c] shadow-[var(--shadow)] sm:rounded-[15px] sm:border";

function isPlayingOrBuffering(state) {
  return (
    state === YT_PLAYER_STATE.PLAYING || state === YT_PLAYER_STATE.BUFFERING
  );
}

function readEmbedPreferences() {
  if (typeof window === "undefined") {
    return { useNativeEmbed: true, useMutedAutoplay: true };
  }

  const useMutedAutoplay = shouldUseMutedAutoplay({
    userAgent: window.navigator.userAgent,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    narrowViewport: window.matchMedia("(max-width: 639px)").matches,
  });

  const useNativeEmbed = shouldUseNativeYoutubeEmbed({
    userAgent: window.navigator.userAgent,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    narrowViewport: window.matchMedia("(max-width: 639px)").matches,
    installedPwa:
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true,
  });

  return { useNativeEmbed, useMutedAutoplay };
}

function YoutubeNativeEmbed({ videoId, appOrigin, title }) {
  const [embedUrl, setEmbedUrl] = useState(null);

  useEffect(() => {
    const origin = resolvePlayerOrigin(appOrigin);
    const { useMutedAutoplay } = readEmbedPreferences();

    setEmbedUrl(
      buildYoutubeEmbedUrl({
        videoId,
        appOrigin: origin,
        useMutedAutoplay,
      }),
    );
  }, [videoId, appOrigin]);

  return (
    <div className={PLAYER_SURFACE_CLASS}>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="absolute inset-0 bg-[#08080c]" aria-hidden="true" />
      )}
    </div>
  );
}

function YoutubeApiPlayer({ videoId, appOrigin, title }) {
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
      const playerVars = getYoutubePlayerVars({
        appOrigin: origin,
        useMutedAutoplay: false,
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
    <div className={PLAYER_SURFACE_CLASS}>
      <div
        ref={containerRef}
        title={title}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

export function YoutubePlayer({ videoId, appOrigin, title }) {
  const [useNativeEmbed, setUseNativeEmbed] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return readEmbedPreferences().useNativeEmbed;
  });

  useEffect(() => {
    setUseNativeEmbed(readEmbedPreferences().useNativeEmbed);
  }, []);

  if (useNativeEmbed) {
    return (
      <YoutubeNativeEmbed
        videoId={videoId}
        appOrigin={appOrigin}
        title={title}
      />
    );
  }

  return (
    <YoutubeApiPlayer videoId={videoId} appOrigin={appOrigin} title={title} />
  );
}
