export const discoveryKeys = {
  all: ["discovery"],
  videos: (query) => [...discoveryKeys.all, "videos", query],
  channels: (query) => [...discoveryKeys.all, "channels", query],
};
