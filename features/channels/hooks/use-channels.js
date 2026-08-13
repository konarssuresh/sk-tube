"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchChannels } from "@/features/channels/api";
import { channelKeys } from "@/features/channels/query-keys";

export function useChannels() {
  const query = useQuery({
    queryKey: channelKeys.list(),
    queryFn: fetchChannels,
  });

  return {
    channels: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
