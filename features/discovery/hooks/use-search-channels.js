"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchSearchChannels } from "@/features/discovery/api";
import { discoveryKeys } from "@/features/discovery/query-keys";

export function useSearchChannels(query) {
  const trimmedQuery = query.trim();
  const queryResult = useInfiniteQuery({
    queryKey: discoveryKeys.channels(trimmedQuery),
    queryFn: ({ pageParam }) => fetchSearchChannels(trimmedQuery, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: trimmedQuery.length > 0,
  });

  const channels =
    queryResult.data?.pages.flatMap((page) => page.channels) ?? [];

  return {
    channels,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
  };
}
