"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchSearchVideos } from "@/features/discovery/api";
import { discoveryKeys } from "@/features/discovery/query-keys";

export function useSearchVideos(query) {
  const trimmedQuery = query.trim();
  const queryResult = useInfiniteQuery({
    queryKey: discoveryKeys.videos(trimmedQuery),
    queryFn: ({ pageParam }) => fetchSearchVideos(trimmedQuery, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: trimmedQuery.length > 0,
  });

  const videos = queryResult.data?.pages.flatMap((page) => page.videos) ?? [];

  return {
    videos,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
  };
}
