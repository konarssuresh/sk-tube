import { AnimatedPageFallback } from "@/components/shared/animated-page-fallback";
import { PageContainer } from "@/components/shared/page-container";
import { ChannelHeaderSkeleton } from "@/features/videos/components/channel-header-skeleton";
import { VideoFeedSkeletonRow } from "@/features/videos/components/video-feed-skeleton-row";

export default function ChannelLoading() {
  return (
    <PageContainer>
      <AnimatedPageFallback>
        <div
          aria-hidden="true"
          className="mb-6 h-4 w-40 animate-shimmer rounded-md"
        />
        <ChannelHeaderSkeleton />
        <VideoFeedSkeletonRow label="Loading videos" />
      </AnimatedPageFallback>
    </PageContainer>
  );
}
