import { VideoCard } from "@/features/videos/components/video-card";
import {
  appendPlaybackReturnFrom,
  appendSearchQueryToHref,
} from "@/features/videos/playback-back-link";
import { cn } from "@/lib/utils";

export function VideoFeedGrid({
  videos,
  channelId,
  channelTitle,
  variant,
  feedLastVisitedAt,
  searchQuery,
  className,
  ...props
}) {
  const isSearch = variant === "search";
  const isFeed = variant === "feed";

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      {videos.map((video) => (
        <li key={isFeed ? `${video.channelId}-${video.videoId}` : video.videoId}>
          <VideoCard
            video={video}
            channelId={isSearch ? undefined : isFeed ? video.channelId : channelId}
            channelTitle={
              isSearch ? undefined : isFeed ? video.channelTitle : channelTitle
            }
            playbackHref={
              isSearch
                ? appendSearchQueryToHref(
                    `/search/videos/${video.videoId}`,
                    searchQuery,
                  )
                : isFeed
                  ? appendPlaybackReturnFrom(
                      `/channels/${video.channelId}/videos/${video.videoId}`,
                      "home",
                    )
                  : appendPlaybackReturnFrom(
                      `/channels/${channelId}/videos/${video.videoId}`,
                      "channel",
                    )
            }
            showNewBadge={
              isFeed
                ? Boolean(
                    feedLastVisitedAt &&
                      new Date(video.publishedAt) > new Date(feedLastVisitedAt),
                  )
                : false
            }
          />
        </li>
      ))}
    </ul>
  );
}
