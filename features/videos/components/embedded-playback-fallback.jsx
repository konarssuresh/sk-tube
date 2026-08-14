import { ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { buildYoutubeWatchUrl } from "@/features/videos/player-utils";

export function EmbeddedPlaybackFallback({ videoId }) {
  const watchUrl = buildYoutubeWatchUrl(videoId);

  return (
    <EmptyState
      icon={<ExternalLink className="size-6" />}
      title="This video can't play here."
      description="YouTube does not allow this video to be embedded in SKTube. You can still watch it directly on YouTube."
      action={
        <Button asChild variant="primary">
          <a href={watchUrl} target="_blank" rel="noopener noreferrer">
            Open on YouTube
          </a>
        </Button>
      }
      className="min-h-[280px]"
    />
  );
}
