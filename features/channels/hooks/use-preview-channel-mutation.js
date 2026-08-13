"use client";

import { useMutation } from "@tanstack/react-query";

import { previewChannel } from "@/features/channels/actions";

export function usePreviewChannelMutation() {
  const mutation = useMutation({
    mutationFn: previewChannel,
  });

  return {
    previewChannel: mutation.mutateAsync,
    preview: mutation.data?.preview ?? null,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
