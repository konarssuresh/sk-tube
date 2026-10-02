"use client";

import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { VideoFeedGrid } from "@/features/videos/components/video-feed-grid";
import { VideoFeedSkeletonRow } from "@/features/videos/components/video-feed-skeleton-row";
import { useSearchVideos } from "@/features/discovery/hooks/use-search-videos";

export function VideoSearchResults({ query }) {
  const { videos, isLoading, isError, error, refetch } = useSearchVideos(query);

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
    <VideoFeedGrid videos={videos} variant="search" searchQuery={query} />
  );
}
