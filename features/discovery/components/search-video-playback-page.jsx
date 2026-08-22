import Link from "next/link";

import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { EmbeddedPlaybackFallback } from "@/features/videos/components/embedded-playback-fallback";
import { YoutubePlayer } from "@/features/videos/components/youtube-player";
import { buildYoutubeWatchUrl } from "@/features/videos/player-utils";
import {
  formatPublishedDate,
  formatVideoDuration,
  parseIso8601Duration,
} from "@/features/videos/utils";

export function SearchVideoPlaybackPage({ video, channelTitle, appOrigin }) {
  const durationLabel = formatVideoDuration(
    parseIso8601Duration(video.duration),
  );
  const publishedLabel = formatPublishedDate(video.publishedAt);
  const watchUrl = buildYoutubeWatchUrl(video.videoId);

  return (
    <PageContainer className="mx-auto max-w-[900px] px-0 sm:px-5">
      <div className="px-5 sm:px-0">
        <Link
          href="/search/videos"
          className="mb-6 inline-flex text-sm text-muted no-underline transition-colors hover:text-foreground"
        >
          ← Back to Video Search
        </Link>
      </div>

      {video.embeddable ? (
        <YoutubePlayer
          videoId={video.videoId}
          appOrigin={appOrigin}
          title={`YouTube video player: ${video.title}`}
        />
      ) : (
        <div className="px-5 sm:px-0">
          <EmbeddedPlaybackFallback videoId={video.videoId} />
        </div>
      )}

      <div className="mt-[22px] flex flex-col items-start justify-between gap-[18px] px-5 sm:flex-row sm:px-0">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
            From Discover
            {channelTitle ? ` · ${channelTitle}` : ""}
            {publishedLabel ? ` · ${publishedLabel}` : ""}
          </p>
          <h1 className="mt-1 text-[clamp(23px,3.6vw,32px)] leading-tight font-bold tracking-[-0.04em]">
            {video.title}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {durationLabel ? `${durationLabel} · ` : ""}
            This channel is not in your library. You can still watch this
            eligible result in SKTube.
          </p>
        </div>

        <div className="flex w-full shrink-0 sm:w-auto">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href={watchUrl} target="_blank" rel="noopener noreferrer">
              Open on YouTube
            </a>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
