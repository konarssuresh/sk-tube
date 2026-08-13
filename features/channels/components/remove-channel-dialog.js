"use client";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";

export function RemoveChannelDialog({
  channel,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Remove channel"
      title="Remove this channel?"
      description={
        channel
          ? `“${channel.title}” will be removed from your library. You can add it again later.`
          : undefined
      }
      confirmLabel={isPending ? "Removing…" : "Remove channel"}
      cancelLabel="Keep channel"
      confirmVariant="danger"
      confirmDisabled={isPending}
      onConfirm={onConfirm}
    />
  );
}
