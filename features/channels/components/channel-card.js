"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChannelCard({ channel, onRemove, className }) {
  function handleRemoveClick(event) {
    event.preventDefault();
    event.stopPropagation();
    onRemove(channel);
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised transition-colors hover:border-[#4a4a58]",
        className,
      )}
    >
      <Link href={`/channels/${channel.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-[#1a1a22]">
          <Image
            src={channel.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="p-4 pr-14">
          <h2 className="line-clamp-2 text-sm font-semibold tracking-[-0.02em] text-foreground">
            {channel.title}
          </h2>
          {channel.handle ? (
            <p className="mt-1 truncate text-xs text-muted">{channel.handle}</p>
          ) : null}
        </div>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-3 bottom-3 text-muted hover:bg-surface-hover hover:text-[#ffafb4]"
        aria-label={`Remove ${channel.title}`}
        onClick={handleRemoveClick}
      >
        <Trash2 className="flex-shrink-0 size-4" aria-hidden="true" />
      </Button>
    </article>
  );
}
