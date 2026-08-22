import { create } from "zustand";

import { DATE_PRESETS, DURATION_PRESETS } from "@/features/feed/utils";

export const useFeedStore = create((set) => ({
  selectedChannelIds: null,
  datePreset: DATE_PRESETS.all,
  durationPreset: DURATION_PRESETS.any,
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
  setSelectedChannelIds: (selectedChannelIds) => set({ selectedChannelIds }),
  setDatePreset: (datePreset) => set({ datePreset }),
  setDurationPreset: (durationPreset) => set({ durationPreset }),
  resetFilters: () =>
    set({
      selectedChannelIds: null,
      datePreset: DATE_PRESETS.all,
      durationPreset: DURATION_PRESETS.any,
    }),
}));
