const ISO_8601_DURATION_PATTERN =
  /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/;

export function parseIso8601Duration(isoDuration) {
  if (!isoDuration || typeof isoDuration !== "string") {
    return null;
  }

  const match = isoDuration.match(ISO_8601_DURATION_PATTERN);

  if (!match || isoDuration === "PT") {
    return null;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function isPublicVideo(video) {
  return video?.status?.privacyStatus === "public";
}

function isLiveBroadcast(video) {
  const broadcastType = video?.snippet?.liveBroadcastContent;

  return broadcastType === "live" || broadcastType === "upcoming";
}

function isArchivedLivestream(video) {
  return video?.snippet?.liveBroadcastContent === "none" &&
    video?.contentDetails?.duration === "P0D";
}

export function isVideoEligible(video) {
  if (!video || !isPublicVideo(video)) {
    return false;
  }

  if (isLiveBroadcast(video) || isArchivedLivestream(video)) {
    return false;
  }

  const durationSeconds = parseIso8601Duration(video.contentDetails?.duration);

  if (durationSeconds === null) {
    return false;
  }

  return durationSeconds >= 120;
}

export function formatVideoDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return "";
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatPublishedDate(isoDate) {
  if (!isoDate) {
    return "";
  }

  const publishedAt = new Date(isoDate);

  if (Number.isNaN(publishedAt.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = publishedAt.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 7) {
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffDays) >= 1) {
      return formatter.format(diffDays, "day");
    }

    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (Math.abs(diffHours) >= 1) {
      return formatter.format(diffHours, "hour");
    }

    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return formatter.format(diffMinutes, "minute");
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: publishedAt.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(publishedAt);
}
