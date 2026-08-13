"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchChannelVideos } from "@/features/videos/api";
import { videoKeys } from "@/features/videos/query-keys";

export function useChannelVideos(channelId) {
  const query = useInfiniteQuery({
    queryKey: videoKeys.byChannel(channelId),
    queryFn: ({ pageParam }) => fetchChannelVideos(channelId, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const videos = query.data?.pages.flatMap((page) => page.videos) ?? [];

  return {
    videos,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
