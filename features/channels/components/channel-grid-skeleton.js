import { ChannelCardSkeleton } from "@/features/channels/components/channel-card-skeleton";
import { cn } from "@/lib/utils";

export function ChannelGridSkeleton({
  label = "Loading your channels",
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
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li>
          <ChannelCardSkeleton />
        </li>
        <li className="hidden sm:block">
          <ChannelCardSkeleton />
        </li>
        <li className="hidden lg:block">
          <ChannelCardSkeleton />
        </li>
        <li className="hidden xl:block">
          <ChannelCardSkeleton />
        </li>
      </ul>
    </div>
  );
}
