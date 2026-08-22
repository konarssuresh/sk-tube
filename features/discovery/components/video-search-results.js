"use client";

import { useCallback } from "react";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { VideoFeedGrid } from "@/features/videos/components/video-feed-grid";
import { VideoFeedSentinel } from "@/features/videos/components/video-feed-sentinel";
import { VideoFeedSkeletonRow } from "@/features/videos/components/video-feed-skeleton-row";
import { useSearchVideos } from "@/features/discovery/hooks/use-search-videos";

export function VideoSearchResults({ query }) {
  const {
    videos,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchVideos(query);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!query.trim()) {
    return null;
  }

  if (isLoading) {
    return <VideoFeedSkeletonRow label="Loading results" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load video results."
        message={error?.message}
        onRetry={() => refetch()}
        className="min-h-[280px]"
      />
    );
  }

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-6" />}
        title="No eligible videos found."
        description="Try a broader search or a different topic."
      />
    );
  }

  return (
    <div className="space-y-8">
      <VideoFeedGrid videos={videos} variant="search" />

      {isFetchingNextPage ? (
        <VideoFeedSkeletonRow label="Loading more results" />
      ) : null}

      {hasNextPage ? (
        <VideoFeedSentinel
          onVisible={handleLoadMore}
          disabled={isFetchingNextPage}
        />
      ) : (
        <p className="text-center text-sm text-muted">
          You&apos;ve reached the end of available results.
        </p>
      )}
    </div>
  );
}
