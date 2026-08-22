"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { ChannelSearchResults } from "@/features/discovery/components/channel-search-results";
import { DiscoverSearchInput } from "@/features/discovery/components/discover-search-input";
import { DiscoverTabs } from "@/features/discovery/components/discover-tabs";
import { LogoutButton } from "@/features/auth/components/logout-button";

const SEARCH_DEBOUNCE_MS = 300;

export function ChannelSearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [inputValue]);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex text-sm text-muted no-underline transition-colors hover:text-foreground"
        >
          ← Back to My Channels
        </Link>
      </div>

      <PageHeader
        eyebrow="Discover"
        title="Find your next creator."
        description="Search YouTube channels, compare their details, then add only the ones you want."
        action={<LogoutButton />}
      />

      <DiscoverTabs className="mb-8" />

      <DiscoverSearchInput
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Search channel names or @handles"
        ariaLabel="Search channels"
        className="mb-2"
      />

      <p className="mb-8 text-[13px] text-subtle">
        Channel metrics are shown when YouTube makes them publicly available.
      </p>

      <ChannelSearchResults query={debouncedQuery} />
    </>
  );
}
