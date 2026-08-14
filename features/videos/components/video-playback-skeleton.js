import { cn } from "@/lib/utils";

export function VideoPlaybackSkeleton({
  label = "Loading video",
  className,
  ...props
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(className)}
      {...props}
    >
      <div className="aspect-video w-full animate-shimmer rounded-none sm:rounded-xl" />
      <div className="mt-[22px] flex flex-col items-start justify-between gap-[18px] px-5 sm:flex-row sm:px-0">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-3 w-2/5 max-w-[220px] animate-shimmer rounded-md" />
          <div className="h-8 w-full max-w-[520px] animate-shimmer rounded-md" />
          <div className="h-4 w-4/5 max-w-[420px] animate-shimmer rounded-md" />
        </div>
        <div className="h-10 w-full animate-shimmer rounded-md sm:w-[168px]" />
      </div>
    </div>
  );
}
