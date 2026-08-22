"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, Library, Plus, SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { ChannelGridSkeleton } from "@/features/channels/components/channel-grid-skeleton";
import { Button } from "@/components/ui/button";
import { ChannelGrid } from "@/features/channels/components/channel-grid";
import { ChannelSearchInput } from "@/features/channels/components/channel-search-input";
import { AddChannelDialog } from "@/features/channels/components/add-channel-dialog";
import { RemoveChannelDialog } from "@/features/channels/components/remove-channel-dialog";
import { useChannels } from "@/features/channels/hooks/use-channels";
import { useRemoveChannelMutation } from "@/features/channels/hooks/use-remove-channel-mutation";
import { filterChannelsBySearch } from "@/features/channels/utils";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useUiStore } from "@/stores/ui-store";

export function ChannelDashboard({ userName }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelToRemove, setChannelToRemove] = useState(null);
  const openAddChannelDialog = useUiStore((state) => state.openAddChannelDialog);
  const { channels, isLoading, isError, error, refetch } = useChannels();
  const { removeChannel, isPending } = useRemoveChannelMutation();

  const filteredChannels = useMemo(
    () => filterChannelsBySearch(channels, searchQuery),
    [channels, searchQuery],
  );

  const hasSearchQuery = searchQuery.trim().length > 0;

  async function handleConfirmRemove() {
    if (!channelToRemove) {
      return;
    }

    try {
      await removeChannel(channelToRemove.id);
      setChannelToRemove(null);
    } catch {
      // Keep the dialog open so the user can retry or cancel.
    }
  }

  function renderContent() {
    if (isLoading) {
      return <ChannelGridSkeleton className="min-h-[340px]" />;
    }

    if (isError) {
      return (
        <ErrorState
          title="Could not load your channels."
          message={error?.message}
          onRetry={() => refetch()}
          className="min-h-[340px]"
        />
      );
    }

    if (channels.length === 0) {
      return (
        <EmptyState
          icon={<Library className="size-6" />}
          title="Your library is empty"
          description="Save the YouTube channels you care about and browse their latest long-form uploads in one place."
          action={
            <Button type="button" variant="primary" onClick={openAddChannelDialog}>
              <Plus className="size-4" aria-hidden="true" />
              Add Channel
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        <ChannelSearchInput
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        {filteredChannels.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="No channels match your search"
            description="Try a different channel name or handle."
          />
        ) : (
          <ChannelGrid
            channels={filteredChannels}
            onRemove={setChannelToRemove}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Your library"
        title={`Welcome, ${userName}`}
        description={
          hasSearchQuery && !isLoading && !isError && channels.length > 0
            ? `Showing ${filteredChannels.length} of ${channels.length} saved channels.`
            : "Browse, search, and manage your saved YouTube channels."
        }
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button asChild variant="outline">
              <Link href="/search/videos">
                <Compass className="size-4" aria-hidden="true" />
                Discover
              </Link>
            </Button>
            <Button type="button" variant="primary" onClick={openAddChannelDialog}>
              <Plus className="size-4" aria-hidden="true" />
              Add Channel
            </Button>
            <LogoutButton />
          </div>
        }
      />

      {renderContent()}

      <AddChannelDialog />

      <RemoveChannelDialog
        channel={channelToRemove}
        open={Boolean(channelToRemove)}
        onOpenChange={(open) => {
          if (!open) {
            setChannelToRemove(null);
          }
        }}
        onConfirm={handleConfirmRemove}
        isPending={isPending}
      />
    </>
  );
}
