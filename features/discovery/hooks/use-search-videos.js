"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSearchVideos } from "@/features/discovery/api";
import { discoveryKeys } from "@/features/discovery/query-keys";

export function useSearchVideos(query) {
  const trimmedQuery = query.trim();
  const queryResult = useQuery({
    queryKey: discoveryKeys.videos(trimmedQuery),
    queryFn: () => fetchSearchVideos(trimmedQuery),
    enabled: trimmedQuery.length > 0,
  });

  return {
    videos: queryResult.data?.videos ?? [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
