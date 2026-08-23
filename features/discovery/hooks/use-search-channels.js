"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSearchChannels } from "@/features/discovery/api";
import { discoveryKeys } from "@/features/discovery/query-keys";

export function useSearchChannels(query) {
  const trimmedQuery = query.trim();
  const queryResult = useQuery({
    queryKey: discoveryKeys.channels(trimmedQuery),
    queryFn: () => fetchSearchChannels(trimmedQuery),
    enabled: trimmedQuery.length > 0,
  });

  return {
    channels: queryResult.data?.channels ?? [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
