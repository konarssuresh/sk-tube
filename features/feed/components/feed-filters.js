"use client";

import { Label } from "@/components/ui/label";
import { DATE_PRESETS, DURATION_PRESETS } from "@/features/feed/utils";
import { useFeedStore } from "@/stores/feed-store";

const DATE_OPTIONS = [
  { value: DATE_PRESETS.all, label: "All time" },
  { value: DATE_PRESETS.today, label: "Today" },
  { value: DATE_PRESETS.week, label: "Past week" },
  { value: DATE_PRESETS.month, label: "Past month" },
  { value: DATE_PRESETS.quarter, label: "Past 3 months" },
];

const DURATION_OPTIONS = [
  { value: DURATION_PRESETS.any, label: "Any duration" },
  { value: DURATION_PRESETS.short, label: "Under 10 minutes" },
  { value: DURATION_PRESETS.medium, label: "10–30 minutes" },
  { value: DURATION_PRESETS.long, label: "Over 30 minutes" },
];

function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-[13px] font-bold text-[#d1d1d8]">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[46px] w-full rounded-[11px] border border-border bg-[#0c0c12] px-3 text-sm text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ChannelMultiSelect({ channels, className }) {
  const selectedChannelIds = useFeedStore((state) => state.selectedChannelIds);
  const setSelectedChannelIds = useFeedStore(
    (state) => state.setSelectedChannelIds,
  );

  const selectedSet = new Set(selectedChannelIds ?? []);
  const allSelected = !selectedChannelIds || selectedChannelIds.length === 0;

  function toggleChannel(channelId) {
    const next = new Set(selectedChannelIds ?? channels.map((channel) => channel.id));

    if (next.has(channelId)) {
      next.delete(channelId);
    } else {
      next.add(channelId);
    }

    if (next.size === 0 || next.size === channels.length) {
      setSelectedChannelIds(null);
      return;
    }

    setSelectedChannelIds(Array.from(next));
  }

  function selectAll() {
    setSelectedChannelIds(null);
  }

  return (
    <div className={className}>
      <Label className="mb-2 block text-[13px] font-bold text-[#d1d1d8]">
        Channels
      </Label>
      <div className="rounded-[11px] border border-border bg-[#0c0c12] p-3">
        <label className="flex items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => selectAll()}
          />
          <span>All channels</span>
        </label>
        <div className="mt-2 space-y-1 border-t border-border pt-2">
          {channels.map((channel) => (
            <label
              key={channel.id}
              className="flex items-center gap-2 py-1 text-sm text-muted"
            >
              <input
                type="checkbox"
                checked={allSelected || selectedSet.has(channel.id)}
                onChange={() => toggleChannel(channel.id)}
              />
              <span>{channel.title}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedFilterFields({ channels, className }) {
  const datePreset = useFeedStore((state) => state.datePreset);
  const durationPreset = useFeedStore((state) => state.durationPreset);
  const setDatePreset = useFeedStore((state) => state.setDatePreset);
  const setDurationPreset = useFeedStore((state) => state.setDurationPreset);

  return (
    <div className={className}>
      <ChannelMultiSelect channels={channels} className="mb-4" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FilterSelect
          id="feed-date-filter"
          label="Published"
          value={datePreset}
          onChange={setDatePreset}
          options={DATE_OPTIONS}
        />
        <FilterSelect
          id="feed-duration-filter"
          label="Duration"
          value={durationPreset}
          onChange={setDurationPreset}
          options={DURATION_OPTIONS}
        />
      </div>
    </div>
  );
}

export function FeedFiltersDesktop({ channels }) {
  return (
    <div className="hidden lg:block">
      <FeedFilterFields channels={channels} />
    </div>
  );
}
