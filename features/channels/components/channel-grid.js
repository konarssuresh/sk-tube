import { ChannelCard } from "@/features/channels/components/channel-card";
import { cn } from "@/lib/utils";

export function ChannelGrid({ channels, onRemove, className, ...props }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
      {...props}
    >
      {channels.map((channel) => (
        <li key={channel.id}>
          <ChannelCard channel={channel} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  );
}
