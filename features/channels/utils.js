export function filterChannelsBySearch(channels, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return channels;
  }

  return channels.filter((channel) => {
    const titleMatches = channel.title.toLowerCase().includes(normalizedQuery);
    const handleMatches =
      channel.handle?.toLowerCase().includes(normalizedQuery) ?? false;

    return titleMatches || handleMatches;
  });
}
