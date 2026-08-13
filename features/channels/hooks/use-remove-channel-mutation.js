"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeChannel } from "@/features/channels/actions";
import { channelKeys } from "@/features/channels/query-keys";

export function useRemoveChannelMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: removeChannel,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: channelKeys.list() });
    },
  });

  return {
    removeChannel: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
