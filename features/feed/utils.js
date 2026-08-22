export const DATE_PRESETS = {
  all: "all",
  today: "today",
  week: "week",
  month: "month",
  quarter: "quarter",
};

export const DURATION_PRESETS = {
  any: "any",
  short: "short",
  medium: "medium",
  long: "long",
};

function getLocalDayStart(now, timezoneOffsetMinutes) {
  const localTime = new Date(now.getTime() - timezoneOffsetMinutes * 60 * 1000);
  const dayStartLocal = new Date(
    Date.UTC(
      localTime.getUTCFullYear(),
      localTime.getUTCMonth(),
      localTime.getUTCDate(),
    ),
  );

  return new Date(dayStartLocal.getTime() + timezoneOffsetMinutes * 60 * 1000);
}

export function getPublishedAfterForPreset(preset, timezoneOffsetMinutes, now = new Date()) {
  switch (preset) {
    case DATE_PRESETS.today:
      return getLocalDayStart(now, timezoneOffsetMinutes).toISOString();
    case DATE_PRESETS.week:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case DATE_PRESETS.month:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case DATE_PRESETS.quarter:
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return undefined;
  }
}

export function getDurationBoundsForPreset(preset) {
  switch (preset) {
    case DURATION_PRESETS.short:
      return { maxDurationSeconds: 599 };
    case DURATION_PRESETS.medium:
      return { minDurationSeconds: 600, maxDurationSeconds: 1800 };
    case DURATION_PRESETS.long:
      return { minDurationSeconds: 1801 };
    default:
      return {};
  }
}

export function buildFeedQueryParams({
  channelIds,
  datePreset,
  durationPreset,
  timezoneOffsetMinutes,
}) {
  const params = new URLSearchParams();

  if (channelIds?.length) {
    params.set("channelIds", channelIds.join(","));
  }

  const publishedAfter = getPublishedAfterForPreset(
    datePreset,
    timezoneOffsetMinutes,
  );

  if (publishedAfter) {
    params.set("publishedAfter", publishedAfter);
  }

  const durationBounds = getDurationBoundsForPreset(durationPreset);

  if (durationBounds.minDurationSeconds !== undefined) {
    params.set(
      "minDurationSeconds",
      String(durationBounds.minDurationSeconds),
    );
  }

  if (durationBounds.maxDurationSeconds !== undefined) {
    params.set("maxDurationSeconds", String(durationBounds.maxDurationSeconds));
  }

  return params;
}

export function isNewFeedVideo(publishedAt, feedLastVisitedAt) {
  if (!feedLastVisitedAt || !publishedAt) {
    return false;
  }

  return new Date(publishedAt) > new Date(feedLastVisitedAt);
}

export function getFilterSnapshot(state) {
  return {
    selectedChannelIds: state.selectedChannelIds,
    datePreset: state.datePreset,
    durationPreset: state.durationPreset,
    timezoneOffsetMinutes: state.timezoneOffsetMinutes,
  };
}
