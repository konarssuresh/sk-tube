"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export function VideoFeedSentinel({
  onVisible,
  disabled = false,
  className,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const element = sentinelRef.current;

    if (!element || disabled) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible();
        }
      },
      {
        rootMargin: "200px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [disabled, onVisible]);

  return (
    <div
      ref={sentinelRef}
      className={cn("h-px w-full", className)}
      aria-hidden="true"
    />
  );
}
