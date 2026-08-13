"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  formatPublishedDate,
  formatVideoDuration,
  parseIso8601Duration,
} from "@/features/videos/utils";
import { cn } from "@/lib/utils";

const DESKTOP_NEW_TAB_QUERY = "(pointer: fine) and (min-width: 640px)";

function useDesktopNewTab() {
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_NEW_TAB_QUERY);
    const update = () => setOpenInNewTab(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return openInNewTab;
}

export function VideoCard({ video, channelTitle, className }) {
  const durationLabel = formatVideoDuration(
    parseIso8601Duration(video.duration),
  );
  const publishedLabel = formatPublishedDate(video.publishedAt);
  const openInNewTab = useDesktopNewTab();

  return (
    <a
      href={video.watchUrl}
      {...(openInNewTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn("group block text-inherit no-underline", className)}
    >
      <article>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#1a1a22]">
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {durationLabel ? (
            <span className="absolute right-2 bottom-2 rounded-[5px] bg-black/78 px-1.5 py-0.5 text-[11px] font-extrabold text-white">
              {durationLabel}
            </span>
          ) : null}
        </div>
        <div className="pt-2.5">
          <h2 className="line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.02em]">
            {video.title}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted">
            {channelTitle}
            {publishedLabel ? ` · ${publishedLabel}` : ""}
          </p>
        </div>
      </article>
    </a>
  );
}
