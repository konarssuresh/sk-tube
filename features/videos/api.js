async function getJson(url) {
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      payload?.message ?? "Something went wrong. Please try again.",
    );
    error.code = payload?.code ?? "INTERNAL";
    error.details = payload?.details;
    throw error;
  }

  return payload;
}

export async function fetchChannelVideos(channelId, cursor) {
  const searchParams = new URLSearchParams();

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  const query = searchParams.toString();
  const url = query
    ? `/api/channels/${channelId}/videos?${query}`
    : `/api/channels/${channelId}/videos`;

  return getJson(url);
}
