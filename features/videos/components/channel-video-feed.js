"use client";

import { useCallback } from "react";
import { Clapperboard } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { VideoFeedGrid } from "@/features/videos/components/video-feed-grid";
import { VideoFeedSentinel } from "@/features/videos/components/video-feed-sentinel";
import { VideoFeedSkeletonRow } from "@/features/videos/components/video-feed-skeleton-row";
import { useChannelVideos } from "@/features/videos/hooks/use-channel-videos";

export function ChannelVideoFeed({ channel }) {
  const {
    videos,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelVideos(channel.id);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <VideoFeedSkeletonRow label="Loading videos" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load videos."
        message={error?.message}
        onRetry={() => refetch()}
        className="min-h-[280px]"
      />
    );
  }

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<Clapperboard className="size-6" />}
        title="No supported videos right now"
        description="This channel does not have any eligible long-form uploads available at the moment."
      />
    );
  }

  return (
    <div className="space-y-8">
      <VideoFeedGrid videos={videos} channelTitle={channel.title} />

      {isFetchingNextPage ? (
        <VideoFeedSkeletonRow label="Loading more videos" />
      ) : null}

      {hasNextPage ? (
        <VideoFeedSentinel
          onVisible={handleLoadMore}
          disabled={isFetchingNextPage}
        />
      ) : (
        <p className="text-center text-sm text-muted">
          You&apos;ve reached the end of available videos.
        </p>
      )}
    </div>
  );
}
