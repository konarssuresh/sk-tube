import { notFound } from "next/navigation";

import { loadOwnedChannel } from "@/features/channels/services/load-owned-channel";
import { ChannelVideoPage } from "@/features/videos/components/channel-video-page";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { AppError, AppErrorCode } from "@/lib/errors";

async function getOwnedChannelForPage(channelId, userId) {
  try {
    return await loadOwnedChannel(channelId, userId);
  } catch (error) {
    if (error instanceof AppError && error.code === AppErrorCode.NOT_FOUND) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }) {
  const user = await requireCurrentUser();
  const { channelId } = await params;

  try {
    const channel = await loadOwnedChannel(channelId, user.id);

    return {
      title: `${channel.title} — SKTube`,
    };
  } catch {
    return {
      title: "Channel — SKTube",
    };
  }
}

export default async function ChannelPage({ params }) {
  const user = await requireCurrentUser();
  const { channelId } = await params;
  const channel = await getOwnedChannelForPage(channelId, user.id);

  return <ChannelVideoPage channel={channel} />;
}
