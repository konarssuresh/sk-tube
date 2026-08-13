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

export async function fetchChannels() {
  const payload = await getJson("/api/channels");
  return payload.channels;
}
