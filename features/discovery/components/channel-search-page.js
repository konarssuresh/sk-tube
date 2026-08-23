"use client";

import { useState } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { ChannelSearchResults } from "@/features/discovery/components/channel-search-results";
import { DiscoverTabs } from "@/features/discovery/components/discover-tabs";
import { DiscoverSearchForm } from "@/features/discovery/components/discover-search-form";
import { ProtectedNav } from "@/components/shared/protected-nav";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useSearchChannels } from "@/features/discovery/hooks/use-search-channels";

export function ChannelSearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { isLoading: isSearching } = useSearchChannels(submittedQuery);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmittedQuery(inputValue.trim());
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/home"
          className="inline-flex text-sm text-muted no-underline transition-colors hover:text-foreground"
        >
          ← Back to Home
        </Link>
      </div>

      <ProtectedNav className="mb-8" />

      <PageHeader
        eyebrow="Discover"
        title="Find your next creator."
        description="Search YouTube channels, compare their details, then add only the ones you want."
        action={<LogoutButton />}
      />

      <DiscoverTabs className="mb-8" />

      <DiscoverSearchForm
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onSubmit={handleSubmit}
        placeholder="Search channel names or @handles"
        ariaLabel="Search channels"
        isSearching={isSearching}
        className="mb-2"
      />

      <p className="mb-8 text-[13px] text-subtle">
        Channel metrics are shown when YouTube makes them publicly available ·
        Up to 5 channels per search
      </p>

      <ChannelSearchResults query={submittedQuery} />
    </>
  );
}
