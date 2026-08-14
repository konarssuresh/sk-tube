import { notFound } from "next/navigation";

import { VideoPlaybackPage } from "@/features/videos/components/video-playback-page";
import { loadOwnedChannelVideo } from "@/features/videos/services/load-owned-channel-video";
import { getEnv } from "@/lib/env";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { AppError, AppErrorCode } from "@/lib/errors";

async function getPlaybackData(channelId, videoId, userId) {
  try {
    return await loadOwnedChannelVideo(channelId, videoId, userId);
  } catch (error) {
    if (error instanceof AppError && error.code === AppErrorCode.NOT_FOUND) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }) {
  const user = await requireCurrentUser();
  const { channelId, videoId } = await params;

  try {
    const { channel, video } = await loadOwnedChannelVideo(
      channelId,
      videoId,
      user.id,
    );

    return {
      title: `${video.title} — ${channel.title} — SKTube`,
    };
  } catch {
    return {
      title: "Video — SKTube",
    };
  }
}

export default async function VideoPlaybackRoute({ params }) {
  const user = await requireCurrentUser();
  const { channelId, videoId } = await params;
  const { channel, video } = await getPlaybackData(channelId, videoId, user.id);
  const { NEXT_PUBLIC_APP_URL } = getEnv();

  return (
    <VideoPlaybackPage
      channel={channel}
      video={video}
      appOrigin={NEXT_PUBLIC_APP_URL}
    />
  );
}
