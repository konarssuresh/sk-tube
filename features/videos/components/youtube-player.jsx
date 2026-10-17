"use client";

import { useLayoutEffect, useState } from "react";

import {
  buildYoutubeEmbedUrl,
  readYoutubeEmbedPreferences,
  resolvePlayerOrigin,
} from "@/features/videos/player-utils";

const PLAYER_SURFACE_CLASS =
  "relative aspect-video overflow-hidden rounded-none border-x-0 border-[#353542] bg-[#08080c] shadow-[var(--shadow)] sm:rounded-[15px] sm:border";

export function YoutubePlayer({ videoId, appOrigin, title }) {
  const [embedUrl, setEmbedUrl] = useState(null);

  useLayoutEffect(() => {
    const { useConservativePlayback } = readYoutubeEmbedPreferences();

    setEmbedUrl(
      buildYoutubeEmbedUrl({
        videoId,
        appOrigin: resolvePlayerOrigin(appOrigin),
        useConservativePlayback,
      }),
    );
  }, [videoId, appOrigin]);

  return (
    <div className={PLAYER_SURFACE_CLASS}>
      {embedUrl ? (
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[#08080c]"
          aria-busy="true"
          aria-label="Loading video player"
        />
      )}
    </div>
  );
}
