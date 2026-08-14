"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import {
  formatPublishedDate,
  formatVideoDuration,
  parseIso8601Duration,
} from "@/features/videos/utils";
import { cn } from "@/lib/utils";

export function VideoCard({ video, channelId, channelTitle, className }) {
  const durationLabel = formatVideoDuration(
    parseIso8601Duration(video.duration),
  );
  const publishedLabel = formatPublishedDate(video.publishedAt);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link
      href={`/channels/${channelId}/videos/${video.videoId}`}
      className={cn("group block text-inherit no-underline", className)}
    >
      <motion.article
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
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
      </motion.article>
    </Link>
  );
}
