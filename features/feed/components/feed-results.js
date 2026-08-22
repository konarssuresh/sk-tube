"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Compass, Library, SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { useChannels } from "@/features/channels/hooks/use-channels";
import { FeedFiltersDesktop } from "@/features/feed/components/feed-filters";
import { useHomeFeed } from "@/features/feed/hooks/use-home-feed";
import { useFeedStore } from "@/stores/feed-store";
import { VideoFeedGrid } from "@/features/videos/components/video-feed-grid";
import { VideoFeedSentinel } from "@/features/videos/components/video-feed-sentinel";
import { VideoFeedSkeletonRow } from "@/features/videos/components/video-feed-skeleton-row";

export function FeedResults() {
  const resetFilters = useFeedStore((state) => state.resetFilters);
  const { channels, isLoading: channelsLoading } = useChannels();
  const {
    videos,
    feedLastVisitedAt,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeFeed();

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (channelsLoading) {
    return <VideoFeedSkeletonRow label="Loading your feed" />;
  }

  if (channels.length === 0) {
    return (
      <EmptyState
        icon={<Library className="size-6" />}
        title="Your library is empty"
        description="Add channels to see a unified feed of their latest long-form uploads here."
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="primary">
              <Link href="/dashboard">Add a channel</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search/videos">
                <Compass className="size-4" aria-hidden="true" />
                Open Discover
              </Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <FeedFiltersDesktop channels={channels} />

      {isLoading ? (
        <VideoFeedSkeletonRow label="Loading your feed" />
      ) : null}

      {isError ? (
        <ErrorState
          title="Could not load your feed."
          message={error?.message}
          onRetry={() => refetch()}
          className="min-h-[280px]"
        />
      ) : null}

      {!isLoading && !isError && videos.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title="No videos match these filters"
          description="Try broader channel, date, or duration filters."
          action={
            <Button type="button" variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && videos.length > 0 ? (
        <>
          <VideoFeedGrid
            videos={videos}
            variant="feed"
            feedLastVisitedAt={feedLastVisitedAt}
          />

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
              You&apos;ve reached the end of available results.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
