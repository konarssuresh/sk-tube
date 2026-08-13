import Image from "next/image";
import Link from "next/link";

import { PageContainer } from "@/components/shared/page-container";
import { ChannelVideoFeed } from "@/features/videos/components/channel-video-feed";

export function ChannelVideoPage({ channel }) {
  return (
    <PageContainer>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex text-sm text-muted no-underline transition-colors hover:text-foreground"
      >
        ← Back to My Channels
      </Link>

      <div className="mb-9 flex items-center gap-4 sm:gap-[18px]">
        <div className="relative size-[59px] shrink-0 overflow-hidden rounded-full bg-[#1a1a22] sm:size-[76px]">
          <Image
            src={channel.thumbnailUrl}
            alt=""
            fill
            sizes="76px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-[25px] font-bold tracking-[-0.04em] sm:text-[31px]">
            {channel.title}
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-base">
            {channel.handle ? `${channel.handle} · ` : ""}
            Latest long-form uploads
          </p>
        </div>
      </div>

      <ChannelVideoFeed channel={channel} />
    </PageContainer>
  );
}
