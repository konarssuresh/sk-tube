"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { DiscoverSearchForm } from "@/features/discovery/components/discover-search-form";
import { DiscoverTabs } from "@/features/discovery/components/discover-tabs";
import { ProtectedNav } from "@/components/shared/protected-nav";
import { VideoSearchResults } from "@/features/discovery/components/video-search-results";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useSearchVideos } from "@/features/discovery/hooks/use-search-videos";

function readSearchQueryFromParams(searchParams) {
  const value = searchParams.get("q");
  return typeof value === "string" ? value.trim() : "";
}

export function VideoSearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = readSearchQueryFromParams(searchParams);
  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [submittedQuery, setSubmittedQuery] = useState(queryFromUrl);
  const { isLoading: isSearching } = useSearchVideos(submittedQuery);

  useEffect(() => {
    setInputValue(queryFromUrl);
    setSubmittedQuery(queryFromUrl);
  }, [queryFromUrl]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedQuery = inputValue.trim();
    setSubmittedQuery(trimmedQuery);

    const nextParams = new URLSearchParams();
    if (trimmedQuery) {
      nextParams.set("q", trimmedQuery);
    }

    const nextUrl = nextParams.toString()
      ? `${pathname}?${nextParams.toString()}`
      : pathname;
    router.replace(nextUrl, { scroll: false });
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
