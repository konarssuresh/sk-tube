import { loadOwnedChannel } from "@/features/channels/services/load-owned-channel";
import { parseVideoId } from "@/features/videos/schemas";
import { fetchOwnedChannelVideo } from "@/lib/youtube-client";

export async function loadOwnedChannelVideo(channelId, videoId, userId) {
  const channel = await loadOwnedChannel(channelId, userId);
  const parsedVideoId = parseVideoId(videoId);
  const video = await fetchOwnedChannelVideo({
    youtubeChannelId: channel.youtubeChannelId,
    videoId: parsedVideoId,
  });

  return { channel, video };
}
