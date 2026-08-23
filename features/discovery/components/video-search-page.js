"use client";

import { useState } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DiscoverSearchForm } from "@/features/discovery/components/discover-search-form";
import { DiscoverTabs } from "@/features/discovery/components/discover-tabs";
import { ProtectedNav } from "@/components/shared/protected-nav";
import { VideoSearchResults } from "@/features/discovery/components/video-search-results";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useSearchVideos } from "@/features/discovery/hooks/use-search-videos";

export function VideoSearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { isLoading: isSearching } = useSearchVideos(submittedQuery);

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
        title="Find videos worth watching."
        description="Search YouTube and play eligible long-form videos without adding their channels first."
        action={<LogoutButton />}
      />

      <DiscoverTabs className="mb-8" />

      <DiscoverSearchForm
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onSubmit={handleSubmit}
        placeholder="Search videos, topics, or creators"
        ariaLabel="Search videos"
        isSearching={isSearching}
        className="mb-2"
      />

      <p className="mb-8 text-[13px] text-subtle">
        Long-form videos only · Shorts, livestreams, unavailable videos, and
        videos under 3 minutes are hidden · Up to 10 results per search
      </p>

      <VideoSearchResults query={submittedQuery} />
    </>
  );
}
