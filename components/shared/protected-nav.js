"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", match: (pathname) => pathname === "/home" },
  {
    href: "/dashboard",
    label: "My Channels",
    match: (pathname) =>
      pathname === "/dashboard" || pathname.startsWith("/channels/"),
  },
  {
    href: "/search/videos",
    label: "Discover",
    match: (pathname) => pathname.startsWith("/search"),
  },
];

export function ProtectedNav({ className }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border border-border bg-[#101016] p-1",
        className,
      )}
      aria-label="Primary"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.match(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold no-underline transition-colors",
              isActive
                ? "bg-surface-raised text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
