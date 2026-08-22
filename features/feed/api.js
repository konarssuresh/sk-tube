async function getJson(url, options) {
  const response = await fetch(url, options);
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

export async function fetchFeedVideos(searchParams, cursor) {
  const params = new URLSearchParams(searchParams);

  if (cursor) {
    params.set("cursor", cursor);
  }

  const query = params.toString();

  return getJson(query ? `/api/feed/videos?${query}` : "/api/feed/videos");
}

export async function patchFeedVisit(visitStartedAt) {
  return getJson("/api/feed/visit", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ visitStartedAt }),
  });
}
