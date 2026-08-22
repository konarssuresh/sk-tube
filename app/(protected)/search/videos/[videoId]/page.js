import { notFound } from "next/navigation";

import { SearchVideoPlaybackPage } from "@/features/discovery/components/search-video-playback-page";
import { loadSearchVideo } from "@/features/videos/services/load-search-video";
import { getEnv } from "@/lib/env";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { AppError, AppErrorCode } from "@/lib/errors";

async function getPlaybackData(videoId) {
  try {
    return await loadSearchVideo(videoId);
  } catch (error) {
    if (error instanceof AppError && error.code === AppErrorCode.NOT_FOUND) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }) {
  await requireCurrentUser();
  const { videoId } = await params;

  try {
    const { video, channelTitle } = await loadSearchVideo(videoId);

    return {
      title: channelTitle
        ? `${video.title} — ${channelTitle} — SKTube`
        : `${video.title} — SKTube`,
    };
  } catch {
    return {
      title: "Video — SKTube",
    };
  }
}

export default async function SearchVideoPlaybackRoute({ params }) {
  await requireCurrentUser();
  const { videoId } = await params;
  const { video, channelTitle } = await getPlaybackData(videoId);
  const { NEXT_PUBLIC_APP_URL } = getEnv();

  return (
    <SearchVideoPlaybackPage
      video={video}
      channelTitle={channelTitle}
      appOrigin={NEXT_PUBLIC_APP_URL}
    />
  );
}
