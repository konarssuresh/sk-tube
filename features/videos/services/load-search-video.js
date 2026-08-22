import { parseVideoId } from "@/features/videos/schemas";
import { fetchSearchVideo } from "@/lib/youtube-client";

export async function loadSearchVideo(videoId) {
  const parsedVideoId = parseVideoId(videoId);
  const video = await fetchSearchVideo(parsedVideoId);

  return {
    video,
    channelTitle: video.channelTitle,
  };
}
