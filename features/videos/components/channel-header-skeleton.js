import { cn } from "@/lib/utils";

export function ChannelHeaderSkeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn("mb-9 flex items-center gap-4 sm:gap-[18px]", className)}
      {...props}
    >
      <div className="size-[59px] shrink-0 animate-shimmer rounded-full sm:size-[76px]" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="h-7 w-3/5 max-w-[280px] animate-shimmer rounded-md sm:h-8" />
        <div className="h-4 w-2/5 max-w-[200px] animate-shimmer rounded-md" />
      </div>
    </div>
  );
}
