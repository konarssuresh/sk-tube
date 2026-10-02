const PLAYBACK_RETURN_FROM = {
  home: "home",
  channel: "channel",
};

export function parsePlaybackReturnFrom(value) {
  if (value === PLAYBACK_RETURN_FROM.channel) {
    return PLAYBACK_RETURN_FROM.channel;
  }

  return PLAYBACK_RETURN_FROM.home;
}

export function appendPlaybackReturnFrom(href, from) {
  if (from !== PLAYBACK_RETURN_FROM.channel) {
    return `${href}?from=${PLAYBACK_RETURN_FROM.home}`;
  }

  return `${href}?from=${PLAYBACK_RETURN_FROM.channel}`;
}

export function resolveOwnedChannelPlaybackBack({
  from,
  channelId,
  channelTitle,
}) {
  const resolvedFrom = parsePlaybackReturnFrom(from);

  if (resolvedFrom === PLAYBACK_RETURN_FROM.channel) {
    return {
      href: `/channels/${channelId}`,
      label: `← Back to ${channelTitle} videos`,
    };
  }

  return {
    href: "/home",
    label: "← Back to Home",
  };
}

export function buildSearchVideosPageHref(searchQuery) {
  const trimmedQuery = searchQuery?.trim() ?? "";

  if (!trimmedQuery) {
    return "/search/videos";
  }

  return `/search/videos?q=${encodeURIComponent(trimmedQuery)}`;
}

export function appendSearchQueryToHref(href, searchQuery) {
  const trimmedQuery = searchQuery?.trim() ?? "";

  if (!trimmedQuery) {
    return href;
  }

  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}q=${encodeURIComponent(trimmedQuery)}`;
}
