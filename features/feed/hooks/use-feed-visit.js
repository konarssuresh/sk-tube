"use client";

import { useMutation } from "@tanstack/react-query";

import { patchFeedVisit } from "@/features/feed/api";

export function useFeedVisitMutation() {
  return useMutation({
    mutationFn: patchFeedVisit,
  });
}
