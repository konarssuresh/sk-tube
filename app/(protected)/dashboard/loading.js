import { AnimatedPageFallback } from "@/components/shared/animated-page-fallback";
import { PageContainer } from "@/components/shared/page-container";
import { ChannelGridSkeleton } from "@/features/channels/components/channel-grid-skeleton";

export default function DashboardLoading() {
  return (
    <PageContainer>
      <AnimatedPageFallback>
        <div aria-hidden="true" className="mb-8 space-y-3">
          <div className="h-3 w-24 animate-shimmer rounded-md" />
          <div className="h-10 w-3/5 max-w-[360px] animate-shimmer rounded-md" />
          <div className="h-4 w-4/5 max-w-[420px] animate-shimmer rounded-md" />
        </div>
        <ChannelGridSkeleton />
      </AnimatedPageFallback>
    </PageContainer>
  );
}
