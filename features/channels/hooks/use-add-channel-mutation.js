"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addChannel } from "@/features/channels/actions";
import { channelKeys } from "@/features/channels/query-keys";
import { useUiStore } from "@/stores/ui-store";

export function useAddChannelMutation() {
  const queryClient = useQueryClient();
  const closeAddChannelDialog = useUiStore((state) => state.closeAddChannelDialog);

  const mutation = useMutation({
    mutationFn: addChannel,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: channelKeys.list() });
      closeAddChannelDialog();
    },
  });

  return {
    addChannel: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
