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
