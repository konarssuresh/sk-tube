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

export async function fetchSearchVideos(query, cursor) {
  const searchParams = new URLSearchParams({ q: query });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return getJson(`/api/search/videos?${searchParams.toString()}`);
}

export async function fetchSearchChannels(query, cursor) {
  const searchParams = new URLSearchParams({ q: query });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return getJson(`/api/search/channels?${searchParams.toString()}`);
}
