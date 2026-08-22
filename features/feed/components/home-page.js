"use client";

import { useEffect, useRef } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ProtectedNav } from "@/components/shared/protected-nav";
import { FeedFiltersSheet } from "@/features/feed/components/feed-filters-sheet";
import { FeedResults } from "@/features/feed/components/feed-results";
import { useFeedVisitMutation } from "@/features/feed/hooks/use-feed-visit";
import { useChannels } from "@/features/channels/hooks/use-channels";
import { LogoutButton } from "@/features/auth/components/logout-button";

function sendVisitUpdate(visitStartedAtMs) {
  const payload = JSON.stringify({
    visitStartedAt: new Date(visitStartedAtMs).toISOString(),
  });

  fetch("/api/feed/visit", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Best-effort visit tracking.
  });
}

export function HomePage({ userName }) {
  const visitStartedAtRef = useRef(0);
  const visitRecordedRef = useRef(false);
  const { channels } = useChannels();
  const { mutate: recordVisit } = useFeedVisitMutation();

  useEffect(() => {
    visitStartedAtRef.current = Date.now();
    visitRecordedRef.current = false;

    function recordVisitOnce() {
      if (visitRecordedRef.current) {
        return;
      }

      visitRecordedRef.current = true;
      const visitStartedAt = new Date(visitStartedAtRef.current).toISOString();
      sendVisitUpdate(visitStartedAtRef.current);
      recordVisit(visitStartedAt);
    }

    function handlePageHide() {
      recordVisitOnce();
    }

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      recordVisitOnce();
    };
  }, [recordVisit]);

  return (
    <>
      <ProtectedNav className="mb-8" />

      <PageHeader
        eyebrow="Home"
        title="Latest from your channels"
        description={
          userName
            ? `Welcome back, ${userName}. Newest eligible uploads across your library.`
            : "Newest eligible uploads across your saved channels."
        }
        action={<LogoutButton />}
      />

      {channels.length > 0 ? (
        <FeedFiltersSheet channels={channels} className="mb-8" />
      ) : null}

      <p className="mb-8 text-[13px] text-subtle lg:hidden">
        Long-form videos only · Shorts, livestreams, unavailable videos, and
        videos under 2 minutes are hidden.
      </p>

      <FeedResults />
    </>
  );
}
