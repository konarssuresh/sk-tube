"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchFeedVideos } from "@/features/feed/api";
import { feedKeys } from "@/features/feed/query-keys";
import { buildFeedQueryParams } from "@/features/feed/utils";
import { useChannels } from "@/features/channels/hooks/use-channels";
import { useFeedStore } from "@/stores/feed-store";

export function useHomeFeed() {
  const { channels, isLoading: channelsLoading } = useChannels();
  const selectedChannelIds = useFeedStore((state) => state.selectedChannelIds);
  const datePreset = useFeedStore((state) => state.datePreset);
  const durationPreset = useFeedStore((state) => state.durationPreset);
  const timezoneOffsetMinutes = useFeedStore(
    (state) => state.timezoneOffsetMinutes,
  );

  const filterState = {
    selectedChannelIds,
    datePreset,
    durationPreset,
    timezoneOffsetMinutes,
  };

  const searchParams = buildFeedQueryParams({
    channelIds: selectedChannelIds,
    datePreset,
    durationPreset,
    timezoneOffsetMinutes,
  });

  const queryResult = useInfiniteQuery({
    queryKey: feedKeys.videos(filterState),
    queryFn: ({ pageParam }) => fetchFeedVideos(searchParams, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !channelsLoading && channels.length > 0,
  });

  const videos =
    queryResult.data?.pages.flatMap((page) => page.videos) ?? [];
  const feedLastVisitedAt =
    queryResult.data?.pages[0]?.feedLastVisitedAt ?? null;

  return {
    videos,
    feedLastVisitedAt,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
  };
}
