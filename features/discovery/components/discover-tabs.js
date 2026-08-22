"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/search/videos", label: "Videos" },
  { href: "/search/channels", label: "Channels" },
];

export function DiscoverTabs({ className }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "inline-flex w-full gap-1 rounded-xl border border-border bg-[#101016] p-1 sm:w-auto",
        className,
      )}
      aria-label="Discover views"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 text-sm font-semibold no-underline transition-colors sm:flex-none",
              isActive
                ? "bg-surface-raised text-foreground"
                : "text-muted hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
