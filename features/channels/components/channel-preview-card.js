import Image from "next/image";

import { cn } from "@/lib/utils";

export function ChannelPreviewCard({ preview, className }) {
  if (!preview) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex gap-3.5 rounded-[13px] border border-border bg-[#111117] p-3.5",
        className,
      )}
    >
      <div className="relative size-[66px] shrink-0 overflow-hidden rounded-full bg-[#1a1a22]">
        <Image
          src={preview.thumbnailUrl}
          alt=""
          fill
          sizes="66px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
          YouTube channel
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold tracking-[-0.02em]">
          {preview.title}
        </h3>
        {preview.handle ? (
          <p className="mt-1 truncate text-sm text-muted">{preview.handle}</p>
        ) : null}
      </div>
    </div>
  );
}
