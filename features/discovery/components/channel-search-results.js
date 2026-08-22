"use client";

import { useCallback } from "react";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ChannelSearchCard } from "@/features/discovery/components/channel-search-card";
import { useSearchChannels } from "@/features/discovery/hooks/use-search-channels";
import { VideoFeedSentinel } from "@/features/videos/components/video-feed-sentinel";
import { VideoFeedSkeletonRow } from "@/features/videos/components/video-feed-skeleton-row";

export function ChannelSearchResults({ query }) {
  const {
    channels,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchChannels(query);

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
    return <VideoFeedSkeletonRow label="Loading channels" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load channel results."
        message={error?.message}
        onRetry={() => refetch()}
        className="min-h-[280px]"
      />
    );
  }

  if (channels.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-6" />}
        title="No channels found."
        description="Try a creator name, topic, or exact handle."
      />
    );
  }

  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {channels.map((channel) => (
          <li key={channel.youtubeChannelId}>
            <ChannelSearchCard channel={channel} />
          </li>
        ))}
      </ul>

      {isFetchingNextPage ? (
        <VideoFeedSkeletonRow label="Loading more channels" />
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
