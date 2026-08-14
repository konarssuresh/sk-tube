import { cn } from "@/lib/utils";

export function ChannelCardSkeleton({ className }) {
  return (
    <article
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised",
        className,
      )}
    >
      <div className="aspect-video animate-shimmer" />
      <div className="space-y-2 p-4 pr-14">
        <div className="h-4 w-full animate-shimmer rounded-md" />
        <div className="h-3 w-2/5 animate-shimmer rounded-md" />
      </div>
    </article>
  );
}
