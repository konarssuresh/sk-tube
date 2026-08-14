import { AnimatedPageFallback } from "@/components/shared/animated-page-fallback";
import { PageContainer } from "@/components/shared/page-container";
import { VideoPlaybackSkeleton } from "@/features/videos/components/video-playback-skeleton";

export default function VideoPlaybackLoading() {
  return (
    <PageContainer className="mx-auto max-w-[900px] px-0 sm:px-5">
      <AnimatedPageFallback>
        <div className="px-5 sm:px-0">
          <div
            aria-hidden="true"
            className="mb-6 h-4 w-48 animate-shimmer rounded-md"
          />
        </div>
        <VideoPlaybackSkeleton />
      </AnimatedPageFallback>
    </PageContainer>
  );
}
