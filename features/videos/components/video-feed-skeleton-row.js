import { VideoCardSkeleton } from "@/features/videos/components/video-card-skeleton";
import { cn } from "@/lib/utils";

export function VideoFeedSkeletonRow({
  label = "Loading videos",
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
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <VideoCardSkeleton />
        </li>
        <li className="hidden sm:block">
          <VideoCardSkeleton />
        </li>
        <li className="hidden lg:block">
          <VideoCardSkeleton />
        </li>
      </ul>
    </div>
  );
}
