import { VideoCard } from "@/features/videos/components/video-card";
import { cn } from "@/lib/utils";

export function VideoFeedGrid({
  videos,
  channelId,
  channelTitle,
  variant,
  className,
  ...props
}) {
  const isSearch = variant === "search";

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      {videos.map((video) => (
        <li key={video.videoId}>
          <VideoCard
            video={video}
            channelId={isSearch ? undefined : channelId}
            channelTitle={isSearch ? undefined : channelTitle}
            playbackHref={
              isSearch ? `/search/videos/${video.videoId}` : undefined
            }
          />
        </li>
      ))}
    </ul>
  );
}
