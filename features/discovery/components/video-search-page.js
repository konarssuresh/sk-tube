"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DiscoverSearchInput } from "@/features/discovery/components/discover-search-input";
import { DiscoverTabs } from "@/features/discovery/components/discover-tabs";
import { VideoSearchResults } from "@/features/discovery/components/video-search-results";
import { LogoutButton } from "@/features/auth/components/logout-button";

const SEARCH_DEBOUNCE_MS = 300;

export function VideoSearchPage() {
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
        title="Find videos worth watching."
        description="Search YouTube and play eligible long-form videos without adding their channels first."
        action={<LogoutButton />}
      />

      <DiscoverTabs className="mb-8" />

      <DiscoverSearchInput
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Search videos, topics, or creators"
        ariaLabel="Search videos"
        className="mb-2"
      />

      <p className="mb-8 text-[13px] text-subtle">
        Long-form videos only · Shorts, livestreams, unavailable videos, and
        videos under 2 minutes are hidden.
      </p>

      <VideoSearchResults query={debouncedQuery} />
    </>
  );
}
