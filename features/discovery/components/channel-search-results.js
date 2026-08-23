"use client";

import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ChannelSearchCard } from "@/features/discovery/components/channel-search-card";
import { useSearchChannels } from "@/features/discovery/hooks/use-search-channels";
import { VideoFeedSkeletonRow } from "@/features/videos/components/video-feed-skeleton-row";

export function ChannelSearchResults({ query }) {
  const { channels, isLoading, isError, error, refetch } =
    useSearchChannels(query);

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
    <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {channels.map((channel) => (
        <li key={channel.youtubeChannelId}>
          <ChannelSearchCard channel={channel} />
        </li>
      ))}
    </ul>
  );
}
