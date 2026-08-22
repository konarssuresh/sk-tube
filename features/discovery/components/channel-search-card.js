"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAddChannelMutation } from "@/features/channels/hooks/use-add-channel-mutation";
import { formatCount } from "@/features/discovery/utils";
import { cn } from "@/lib/utils";

export function ChannelSearchCard({ channel, className }) {
  const { addChannel, isPending, error, reset } = useAddChannelMutation();
  const [isSaved, setIsSaved] = useState(channel.isSaved);

  async function handleAdd() {
    reset();

    try {
      await addChannel({
        youtubeChannelId: channel.youtubeChannelId,
        title: channel.title,
        handle: channel.handle,
        thumbnailUrl: channel.thumbnailUrl,
        uploadsPlaylistId: channel.uploadsPlaylistId,
      });
      setIsSaved(true);
    } catch {
      // Error is surfaced through mutation state.
    }
  }

  const subscriberLabel = formatCount(channel.subscriberCount);
  const videoLabel = formatCount(channel.videoCount);
  const viewLabel = formatCount(channel.viewCount);

  return (
    <article
      className={cn(
        "grid grid-cols-[auto_1fr] gap-3.5 rounded-[var(--radius-md)] border border-border bg-surface p-[17px] sm:gap-3.5",
        className,
      )}
    >
      <div className="relative size-[55px] shrink-0 overflow-hidden rounded-full bg-[#1a1a22]">
        <Image
          src={channel.thumbnailUrl}
          alt=""
          fill
          sizes="55px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        <h3 className="text-base font-semibold tracking-[-0.02em]">
          {channel.title}
        </h3>
        {channel.handle ? (
          <p className="mt-1 text-[13px] text-muted">{channel.handle}</p>
        ) : null}
        {channel.description ? (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted">
            {channel.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
          {subscriberLabel ? (
            <span>
              <strong className="font-semibold text-foreground">
                {subscriberLabel}
              </strong>{" "}
              subscribers
            </span>
          ) : null}
          {videoLabel ? (
            <span>
              <strong className="font-semibold text-foreground">
                {videoLabel}
              </strong>{" "}
              videos
            </span>
          ) : null}
          {viewLabel ? (
            <span>
              <strong className="font-semibold text-foreground">
                {viewLabel}
              </strong>{" "}
              views
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {isSaved ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Check className="size-4" aria-hidden="true" />
              In your library
            </span>
          ) : (
            <span className="text-sm text-subtle">Not yet saved</span>
          )}

          <Button
            type="button"
            variant={isSaved ? "outline" : "primary"}
            disabled={isSaved || isPending}
            onClick={handleAdd}
            className="w-full sm:ml-auto sm:w-auto"
          >
            {isSaved ? "Added" : "Add to library"}
          </Button>
        </div>

        {error ? (
          <p className="mt-2 text-sm text-[#ffafb4]" role="alert">
            {error.message}
          </p>
        ) : null}
      </div>
    </article>
  );
}
